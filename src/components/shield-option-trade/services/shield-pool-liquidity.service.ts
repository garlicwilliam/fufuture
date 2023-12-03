import { D } from '../../../state-manager/database/database-state-parser';
import {
  ShieldPoolAddress,
  ShieldPoolAddressList,
  ShieldUnderlyingType,
  TokenErc20
} from '../../../state-manager/state-types';
import { filter, map, mergeMap, switchMap, take, tap, toArray } from 'rxjs/operators';
import { walletState } from '../../../state-manager/wallet/wallet-state';
import { createContractByCurEnv } from '../../../state-manager/const/contract-creator';
import { ABI_PRIVATE_POOL, ABI_PUBLIC_POOL } from '../const/shield-option-abi';
import { asyncScheduler, BehaviorSubject, EMPTY, from, Observable, of, Subscription, zip } from 'rxjs';
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
import { isSameAddress } from '../../../util/address';

type PrivatePool = {
  poolAddress: string;
  token: TokenErc20;
  indexUnderlying: ShieldUnderlyingType;
};
type PublicPool = {
  poolAddress: string;
  token: TokenErc20;
};
export type TokenPool = {
  underlying: ShieldUnderlyingType;
  token: TokenErc20;
  private?: PrivatePool;
  public?: PublicPool;
  volume?: SldDecimal;
};
export type TokenPoolList = {
  underlying: ShieldUnderlyingType;
  pools: TokenPool[];
};

export class ShieldPoolLiquidityService {
  private privatePoolCache = new Map<string, PrivatePool>();
  private publicPoolCache = new Map<string, PublicPool>();

  private poolList: Map<ShieldUnderlyingType, BehaviorSubject<TokenPool[]>> = this.initListMap();

  private liquidityCache = new Map<string, BehaviorSubject<SldDecimal | undefined>>();

  private initListMap(): Map<ShieldUnderlyingType, BehaviorSubject<TokenPool[]>> {
    const rs = new Map<ShieldUnderlyingType, BehaviorSubject<TokenPool[]>>();
    Object.values(ShieldUnderlyingType).forEach(underlying => {
      rs.set(underlying, new BehaviorSubject<TokenPool[]>([]));
    });

    return rs;
  }

  private sub: Subscription;

  constructor() {
    this.sub = this.init().subscribe();
  }

  //

  public watchPoolList(underlying: ShieldUnderlyingType): Observable<TokenPoolList> {
    return (this.poolList.get(underlying) || of([] as TokenPool[])).pipe(
      map((pools: TokenPool[]) => {
        return { pools, underlying } as TokenPoolList;
      })
    );
  }

  public watchLiquidity(pool: PublicPool | PrivatePool): Observable<SldDecimal | undefined> {
    this.initLiquidity(pool);
    this.updateLiquidity(pool);

    const key: string = this.cacheKey(pool.poolAddress);
    return this.liquidityCache.get(key) || EMPTY;
  }

  public searchPools(searchKey: string, indexUnderlying: ShieldUnderlyingType): Observable<TokenPool[]> {
    searchKey = searchKey.toLowerCase();

    if (this.poolList.has(indexUnderlying)) {
      return this.poolList.get(indexUnderlying)!.pipe(
        map((tokens: TokenPool[]) => {
          return tokens.filter(one => {
            const isHasKey: boolean = one.token.symbol.toLowerCase().indexOf(searchKey) >= 0;
            const isAddress: boolean = isSameAddress(one.token.address.toLowerCase(), searchKey);

            return isHasKey || isAddress;
          });
        })
      );
    } else {
      return of([]);
    }
  }

  //

  private init() {
    return walletState.NETWORK.pipe(
      filter(net => net === SLD_ENV_CONF.CurNetwork),
      switchMap(network => {
        return D.Option.Pool.AllAddress.watch();
      }),
      switchMap((pools: ShieldPoolAddressList) => {
        const privates$: Observable<PrivatePool[]> = this.getPrivatePoolList(pools.private);
        const publics$: Observable<PublicPool[]> = this.getPublicPoolList(pools.public);

        return zip(privates$, publics$);
      }),
      tap(([privatePools, publicPools]) => {
        this.setPrivatePoolCache(privatePools);
        this.setPublicPoolCache(publicPools);
      }),
      tap(() => {
        this.extractTokens();
      })
    );
  }

  private extractTokens() {
    const tokenArr: TokenErc20[] = [];
    const priPoolMap = new Map<string, PrivatePool>();
    const pubPoolMap = new Map<string, PublicPool>();

    Array.from(this.privatePoolCache.values()).forEach(priPool => {
      const key = priPool.indexUnderlying + priPool.token.address.toLowerCase();
      priPoolMap.set(key, priPool);
      tokenArr.push(priPool.token);
    });

    Array.from(this.publicPoolCache.values()).forEach(pubPool => {
      const key = pubPool.token.address.toLowerCase();
      pubPoolMap.set(key, pubPool);
      tokenArr.push(pubPool.token);
    });

    const tokens: TokenErc20[] = _.unionBy(tokenArr, el => el.address.toLowerCase());
    const underlying: ShieldUnderlyingType[] = Object.values(ShieldUnderlyingType);

    for (const i of underlying) {
      const tokenPools: TokenPool[] = [];

      for (const t of tokens) {
        const pubKey = t.address.toLowerCase();
        const priKey = i + pubKey;

        const pool: TokenPool = {
          underlying: i,
          token: t,
          private: priPoolMap.get(priKey),
          public: pubPoolMap.get(pubKey),
        };

        tokenPools.push(pool);
      }

      tokenPools.sort((a, b) => (a.token.symbol > b.token.symbol ? 1 : -1));
      this.poolList.get(i)?.next(tokenPools);
    }
  }

  private setPrivatePoolCache(privates: PrivatePool[]) {
    privates.forEach((pool: PrivatePool) => {
      const key: string = this.cacheKey(pool.poolAddress);
      this.privatePoolCache.set(key, pool);
    });
  }

  private hasPrivatePoolCache(poolAddress: string): boolean {
    const key = this.cacheKey(poolAddress);
    return this.privatePoolCache.has(key);
  }

  private setPublicPoolCache(publics: PublicPool[]) {
    publics.forEach((pool: PublicPool) => {
      const key = this.cacheKey(pool.poolAddress);
      this.publicPoolCache.set(key, pool);
    });
  }

  private hasPublicPoolCache(poolAddress: string): boolean {
    const key = this.cacheKey(poolAddress);
    return this.publicPoolCache.has(key);
  }

  private cacheKey(poolAddress: string): string {
    return poolAddress.toLowerCase();
  }

  private getPrivatePoolList(privates: ShieldPoolAddress[]): Observable<PrivatePool[]> {
    return from(privates).pipe(
      mergeMap((pool: ShieldPoolAddress) => {
        return this.hasPrivatePoolCache(pool.poolAddress) ? of(null) : this.getPrivatePool(pool);
      }),
      toArray(),
      map((pools: (PrivatePool | null)[]) => {
        return pools.filter(Boolean) as PrivatePool[];
      })
    );
  }

  private getPrivatePool(pool: ShieldPoolAddress): Observable<PrivatePool> {
    const indexUnderlying$: Observable<ShieldUnderlyingType> = this.getPriIndexUnderlying(pool.poolAddress);
    const token$: Observable<TokenErc20> = erc20InfoByAddressGetter(pool.tokenAddress);

    return zip(indexUnderlying$, token$).pipe(
      map(([indexUnderlying, token]) => {
        return {
          poolAddress: pool.poolAddress,
          indexUnderlying,
          token,
        } as PrivatePool;
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

  private getPublicPoolList(publics: ShieldPoolAddress[]): Observable<PublicPool[]> {
    return from(publics).pipe(
      mergeMap(pubPool => {
        return this.hasPublicPoolCache(pubPool.poolAddress) ? of(null) : this.getPublicPool(pubPool);
      }),
      toArray(),
      map((pools: (PublicPool | null)[]) => {
        return pools.filter(Boolean) as PublicPool[];
      })
    );
  }

  private getPublicPool(pool: ShieldPoolAddress): Observable<PublicPool> {
    const token$: Observable<TokenErc20> = erc20InfoByAddressGetter(pool.tokenAddress);

    return token$.pipe(
      map((token: TokenErc20): PublicPool => {
        return {
          poolAddress: pool.poolAddress,
          token,
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

    const key = this.cacheKey(pool.poolAddress);
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
    const key = this.cacheKey(pool.poolAddress);
    if (!this.liquidityCache.has(key)) {
      this.liquidityCache.set(key, new BehaviorSubject<SldDecimal | undefined>(undefined));
    }
  }
}

export const poolLiquidityService = new ShieldPoolLiquidityService();
