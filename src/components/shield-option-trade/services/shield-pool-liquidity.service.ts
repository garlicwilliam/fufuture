import { D } from '../../../state-manager/database/database-state-parser';
import {
  ShieldPoolAddress,
  ShieldPoolAddressList,
  ShieldUnderlyingType,
  TokenErc20,
} from '../../../state-manager/state-types';
import { filter, map, switchMap, tap } from 'rxjs/operators';
import { walletState } from '../../../state-manager/wallet/wallet-state';
import { BehaviorSubject, EMPTY, NEVER, Observable, of, zip } from 'rxjs';
import { SLD_ENV_CONF } from '../const/env';
import * as _ from 'lodash';
import { SldDecimal } from '../../../util/decimal';
import { Network } from '../../../constant/network';
import { PrivatePool, PrivatePoolRes, PublicPool, TokenPool, TokenPoolList } from './types';
import {
  batchFetchPoolInfo,
  batchFetchPrivateLiquidity,
  batchFetchPublicLiquidity,
  batchFetchTokenInfo,
  poolCacheKey,
} from './batch-fetch.service';

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

  // -------------------------------------------------------------------------------------------------------------------

  constructor() {
    this.init().subscribe();
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
    //this.updateLiquidity(pool);

    const key: string = poolCacheKey(pool.poolAddress, pool.network);
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
        const privates$: Observable<PrivatePool[]> = this.getPrivatePoolList(pools.private, network);
        const publics$: Observable<PublicPool[]> = this.getPublicPoolList(pools.public, network);

        return zip(privates$, publics$, of(network));
      }),
      tap(([privatePools, publicPools, network]) => {
        privatePools.forEach(priPool => {
          this.initLiquidity(priPool);
        });
        batchFetchPrivateLiquidity(privatePools, network).subscribe({
          next: liq => {
            Object.keys(liq).forEach((key: string) => {
              this.liquidityCache.get(key)?.next(liq[key]);
            });
          },
        });

        publicPools.forEach(pubPool => {
          this.initLiquidity(pubPool);
        });
        batchFetchPublicLiquidity(publicPools, network).subscribe({
          next: liq => {
            Object.keys(liq).forEach((key: string) => {
              this.liquidityCache.get(key)?.next(liq[key]);
            });
          },
        });

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
      const key: string = poolCacheKey(pool.poolAddress, pool.network);
      this.privatePoolCache.set(key, pool);
    });
  }

  private hasPrivatePoolCache(poolAddress: ShieldPoolAddress): boolean {
    const key: string = poolCacheKey(poolAddress.poolAddress, poolAddress.network);
    return this.privatePoolCache.has(key);
  }

  private setPublicPoolCache(publics: PublicPool[]) {
    publics.forEach((pool: PublicPool) => {
      const key: string = poolCacheKey(pool.poolAddress, pool.network);
      this.publicPoolCache.set(key, pool);
    });
  }

  private hasPublicPoolCache(poolAddress: string, network: Network): boolean {
    const key = poolCacheKey(poolAddress, network);
    return this.publicPoolCache.has(key);
  }

  private poolListCacheKey(underlying: ShieldUnderlyingType, network: Network): string {
    return network + ':' + underlying;
  }

  private getPrivatePoolList(privates: ShieldPoolAddress[], network: Network): Observable<PrivatePool[]> {
    const poolInfoArr: ShieldPoolAddress[] = privates.filter(
      (one: ShieldPoolAddress) => !this.hasPrivatePoolCache(one)
    );
    const tokens: string[] = Array.from(new Set(privates.map((p: ShieldPoolAddress) => p.tokenAddress)));
    const pools: string[] = Array.from(new Set(privates.map((p: ShieldPoolAddress) => p.poolAddress)));

    return zip(batchFetchTokenInfo(tokens, network, 'liq service 213'), batchFetchPoolInfo(pools, network)).pipe(
      map(([tokenMap, poolMap]) => {
        return poolInfoArr.map((poolInfo: ShieldPoolAddress) => {
          const poolAddress: string = poolInfo.poolAddress.toLowerCase();
          const underlying: PrivatePoolRes = poolMap[poolAddress];
          const token: TokenErc20 = tokenMap[poolInfo.tokenAddress.toLowerCase()];

          return {
            network,
            poolAddress: poolAddress,
            token,
            indexUnderlying: underlying.indexUnderlying,
          };
        });
      })
    );
  }

  private getPublicPoolList(publicAddresses: ShieldPoolAddress[], network: Network): Observable<PublicPool[]> {
    const pubPoolInfo: ShieldPoolAddress[] = publicAddresses.filter(
      (one: ShieldPoolAddress) => !this.hasPublicPoolCache(one.poolAddress, one.network)
    );

    const tokenList: string[] = pubPoolInfo.map((one: ShieldPoolAddress) => one.tokenAddress);

    return batchFetchTokenInfo(tokenList, network, 'pool liq 238').pipe(
      map(tokenMap => {
        return pubPoolInfo.map(pub => {
          return {
            network,
            poolAddress: pub.poolAddress.toLowerCase(),
            token: tokenMap[pub.tokenAddress.toLowerCase()],
          };
        });
      })
    );
  }

  private initLiquidity(pool: PrivatePool | PublicPool) {
    const key = poolCacheKey(pool.poolAddress, pool.network);
    if (!this.liquidityCache.has(key)) {
      this.liquidityCache.set(key, new BehaviorSubject<SldDecimal | undefined>(undefined));
    }
  }
}

export const poolLiquidityService: ShieldPoolLiquidityService = new ShieldPoolLiquidityService();
