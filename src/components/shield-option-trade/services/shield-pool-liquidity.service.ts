import { D } from '../../../state-manager/database/database-state-parser';
import {
  ShieldPoolAddress,
  ShieldPoolAddressList,
  ShieldUnderlyingType,
  TokenErc20,
} from '../../../state-manager/state-types';
import { filter, map, mergeMap, switchMap, take, tap, toArray } from 'rxjs/operators';
import { walletState } from '../../../state-manager/wallet/wallet-state';
import { createContractByCurEnv } from '../../../state-manager/const/contract-creator';
import { ABI_PRIVATE_POOL, ABI_PUBLIC_POOL } from '../const/shield-option-abi';
import { asyncScheduler, BehaviorSubject, EMPTY, from, NEVER, Observable, of, Subscription, zip } from 'rxjs';
import { erc20InfoByAddressGetter } from '../../../state-manager/contract/contract-getter-sim-erc20';
import {
  privatePoolLiquidityGetter,
  privatePoolUnderlyingGetter,
  publicPoolLiquidityGetter,
} from '../../../state-manager/contract/contract-getter-cpx-shield';
import { SLD_ENV_CONF } from '../const/env';
import * as _ from 'lodash';
import { SldDecimal } from '../../../util/decimal';
import { shieldOptionTradeContracts } from '../contract/shield-option-trade-contract';
import { Network } from '../../../constant/network';

type PrivatePool = {
  network: Network;
  poolAddress: string;
  token: TokenErc20;
  indexUnderlying: ShieldUnderlyingType;
};
type PublicPool = {
  network: Network;
  poolAddress: string;
  token: TokenErc20;
};
export type TokenPool = {
  network: Network;
  underlying: ShieldUnderlyingType;
  token: TokenErc20;
  private?: PrivatePool;
  public?: PublicPool;
  volume?: SldDecimal;
};
export type TokenPoolList = {
  network: Network;
  underlying: ShieldUnderlyingType;
  pools: TokenPool[] | undefined;
};

export class ShieldPoolLiquidityService {
  // pool key => pool info
  private privatePoolCache = new Map<string, PrivatePool>();
  // pool key => pool info
  private publicPoolCache = new Map<string, PublicPool>();
  // pool key => liquidity value
  private liquidityCache = new Map<string, BehaviorSubject<SldDecimal | undefined>>();
  // pool list key => pool list
  private poolList: Map<string, BehaviorSubject<TokenPool[] | undefined>> = this.initListMap();

  private initListMap(): Map<string, BehaviorSubject<TokenPool[] | undefined>> {
    const rs = new Map<string, BehaviorSubject<TokenPool[] | undefined>>();

    const underlyingList: ShieldUnderlyingType[] = Object.values(ShieldUnderlyingType);
    const networkList: Network[] = Object.keys(SLD_ENV_CONF.Supports) as Network[];

    networkList.forEach(network => {
      underlyingList.forEach(underlying => {
        const cacheKey: string = this.poolListCacheKey(underlying, network);
        rs.set(cacheKey, new BehaviorSubject<TokenPool[] | undefined>(undefined));
      });
    });

    return rs;
  }

  private sub: Subscription;

  constructor() {
    this.sub = this.init().subscribe();
  }
  //
  public watchPoolList(underlying: ShieldUnderlyingType, network: Network): Observable<TokenPoolList> {
    const cacheKey: string = this.poolListCacheKey(underlying, network);

    if (!this.poolList.has(cacheKey)) {
      return NEVER;
    }

    const pools$: Observable<TokenPool[] | undefined> = this.poolList.has(cacheKey)
      ? this.poolList.get(cacheKey)!
      : NEVER;

    return pools$.pipe(
      map((pools: TokenPool[] | undefined): TokenPoolList => {
        return { pools, underlying, network };
      })
    );
  }

  public watchLiquidity(pool: PublicPool | PrivatePool): Observable<SldDecimal | undefined> {
    this.initLiquidity(pool);
    this.updateLiquidity(pool);

    const key: string = this.poolCacheKey(pool.poolAddress, pool.network);
    return this.liquidityCache.get(key) || EMPTY;
  }

  // -----------------------------------------------------------------------------------------

  private init() {
    return walletState.NETWORK.pipe(
      filter(network => Object.keys(SLD_ENV_CONF.Supports).indexOf(network) >= 0),
      switchMap((network: Network) => {
        const poolsAddress$ = D.Option.Pool.AllAddress.watch().pipe(filter(pools => pools.network === network));
        return zip(poolsAddress$, of(network));
      }),
      switchMap(([pools, network]: [ShieldPoolAddressList, Network]) => {
        const privates$: Observable<PrivatePool[]> = this.getPrivatePoolList(pools.private);
        const publics$: Observable<PublicPool[]> = this.getPublicPoolList(pools.public);

        return zip(privates$, publics$, of(network));
      }),
      tap(([privatePools, publicPools, network]) => {
        this.setPrivatePoolCache(privatePools);
        this.setPublicPoolCache(publicPools);

        this.extractTokenPoolList(network);
      })
    );
  }

  private extractTokenPoolList(network: Network) {
    const allPriPools: PrivatePool[] = Array.from(this.privatePoolCache.values());
    const allPubPools: PublicPool[] = Array.from(this.publicPoolCache.values());
    const allUnderlying: ShieldUnderlyingType[] = Object.values(ShieldUnderlyingType);
    const allNetworks: Network[] = Object.keys(SLD_ENV_CONF.Supports) as Network[];

    const d = {};
    const t = {};

    allPubPools.forEach((pubPool: PublicPool) => {
      allUnderlying.forEach((underlying: ShieldUnderlyingType) => {
        _.set(d, `${pubPool.network}.${underlying}.${pubPool.token.address.toLowerCase()}.pub`, pubPool);
        _.set(t, `${pubPool.network}.${pubPool.token.address.toLowerCase()}`, pubPool.token);
      });
    });

    allPriPools.forEach((priPool: PrivatePool) => {
      _.set(d, `${priPool.network}.${priPool.indexUnderlying}.${priPool.token.address.toLowerCase()}.pri`, priPool);
      _.set(t, `${priPool.network}.${priPool.token.address.toLowerCase()}`, priPool.token);
    });

    allUnderlying.forEach((underlying: ShieldUnderlyingType) => {
      const listKey: string = this.poolListCacheKey(underlying, network);
      const tokensPools = _.get(d, `${network}.${underlying}`, {});
      const tokenAddresses: string[] = Object.keys(tokensPools);

      const poolsList: (TokenPool | null)[] = tokenAddresses.map((tokenAddr: string) => {
        const token: TokenErc20 | undefined = _.get(t, `${network}.${tokenAddr.toLowerCase()}`, undefined);

        if (!token) {
          return null;
        }

        const pool: TokenPool = {
          network,
          underlying,
          private: tokensPools[tokenAddr].pri,
          public: tokensPools[tokenAddr].pub,
          token,
        };

        return pool;
      });
      const poolsList1: TokenPool[] = poolsList.filter(Boolean) as TokenPool[];
      poolsList1.sort((a, b) => (a.token.symbol > b.token.symbol ? 1 : -1));

      this.poolList.get(listKey)?.next(poolsList1);
    });
  }

  private setPrivatePoolCache(privates: PrivatePool[]) {
    privates.forEach((pool: PrivatePool) => {
      const key: string = this.poolCacheKey(pool.poolAddress, pool.network);
      this.privatePoolCache.set(key, pool);
    });
  }

  private hasPrivatePoolCache(poolAddress: ShieldPoolAddress): boolean {
    const key = this.poolCacheKey(poolAddress.poolAddress, poolAddress.network);
    return this.privatePoolCache.has(key);
  }

  private setPublicPoolCache(publics: PublicPool[]) {
    publics.forEach((pool: PublicPool) => {
      const key: string = this.poolCacheKey(pool.poolAddress, pool.network);
      this.publicPoolCache.set(key, pool);
    });
  }

  private hasPublicPoolCache(poolAddress: string, network: Network): boolean {
    const key = this.poolCacheKey(poolAddress, network);
    return this.publicPoolCache.has(key);
  }

  private poolCacheKey(poolAddress: string, network: Network): string {
    return network + ':' + poolAddress.toLowerCase();
  }

  private poolListCacheKey(underlying: ShieldUnderlyingType, network: Network): string {
    return network + ':' + underlying;
  }

  private getPrivatePoolList(privates: ShieldPoolAddress[]): Observable<PrivatePool[]> {
    return from(privates).pipe(
      mergeMap((pool: ShieldPoolAddress) => {
        return this.hasPrivatePoolCache(pool) ? of(null) : this.getPrivatePool(pool);
      }),
      toArray(),
      map((pools: (PrivatePool | null)[]) => {
        return pools.filter(Boolean) as PrivatePool[];
      })
    );
  }

  private getPrivatePool(poolAddress: ShieldPoolAddress): Observable<PrivatePool> {
    const indexUnderlying$: Observable<ShieldUnderlyingType> = this.getPriIndexUnderlying(poolAddress.poolAddress);
    const token$: Observable<TokenErc20> = erc20InfoByAddressGetter(poolAddress.tokenAddress);

    return zip(indexUnderlying$, token$).pipe(
      map(([indexUnderlying, token]): PrivatePool => {
        return {
          poolAddress: poolAddress.poolAddress,
          indexUnderlying,
          token,
          network: poolAddress.network,
        };
      })
    );
  }

  private getPriIndexUnderlying(poolAddress: string): Observable<ShieldUnderlyingType> {
    return createContractByCurEnv(poolAddress, ABI_PRIVATE_POOL).pipe(
      switchMap(contract => {
        return privatePoolUnderlyingGetter(contract);
      })
    );
  }

  private getPublicPoolList(publicAddresses: ShieldPoolAddress[]): Observable<PublicPool[]> {
    return from(publicAddresses).pipe(
      mergeMap((pubPoolAddress: ShieldPoolAddress) => {
        return this.hasPublicPoolCache(pubPoolAddress.poolAddress, pubPoolAddress.network)
          ? of(null)
          : this.getPublicPool(pubPoolAddress);
      }),
      toArray(),
      map((pools: (PublicPool | null)[]) => {
        return pools.filter(Boolean) as PublicPool[];
      })
    );
  }

  private getPublicPool(poolAddress: ShieldPoolAddress): Observable<PublicPool> {
    const token$: Observable<TokenErc20> = erc20InfoByAddressGetter(poolAddress.tokenAddress);

    return token$.pipe(
      map((token: TokenErc20): PublicPool => {
        return {
          poolAddress: poolAddress.poolAddress,
          token,
          network: poolAddress.network,
        };
      })
    );
  }

  private getPrivatePoolLiquidity(pool: PrivatePool): Observable<SldDecimal> {
    return shieldOptionTradeContracts.CONTRACTS.liquidityManager.pipe(
      take(1),
      switchMap(contract => {
        return privatePoolLiquidityGetter(contract, pool.poolAddress, pool.token);
      })
    );
  }

  private getPublicPoolLiquidity(pool: PublicPool): Observable<SldDecimal> {
    return createContractByCurEnv(pool.poolAddress, ABI_PUBLIC_POOL).pipe(
      switchMap(poolContract => {
        return publicPoolLiquidityGetter(poolContract, pool.token);
      })
    );
  }

  private updateLiquidity(pool: PrivatePool | PublicPool) {
    this.initLiquidity(pool);

    const key: string = this.poolCacheKey(pool.poolAddress, pool.network);
    const isPrivate: boolean = _.has(pool, 'indexUnderlying');

    const get$: Observable<SldDecimal> = isPrivate
      ? this.getPrivatePoolLiquidity(pool as PrivatePool)
      : this.getPublicPoolLiquidity(pool as PublicPool);

    const update$ = get$.pipe(
      tap((liq: SldDecimal) => {
        this.liquidityCache.get(key)?.next(liq);
      })
    );

    asyncScheduler.schedule(() => {
      update$.subscribe();
    });
  }

  private initLiquidity(pool: PrivatePool | PublicPool) {
    const key = this.poolCacheKey(pool.poolAddress, pool.network);
    if (!this.liquidityCache.has(key)) {
      this.liquidityCache.set(key, new BehaviorSubject<SldDecimal | undefined>(undefined));
    }
  }
}

export const poolLiquidityService = new ShieldPoolLiquidityService();
