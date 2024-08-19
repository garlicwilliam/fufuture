import { D } from '../../../state-manager/database/database-state-parser';
import {
  ShieldPoolAddress,
  ShieldPoolAddressList,
  ShieldUnderlyingType,
  TokenErc20,
} from '../../../state-manager/state-types';
import { filter, map, switchMap, take, tap } from 'rxjs/operators';
import { walletState } from '../../../state-manager/wallet/wallet-state';
import { createChainContract } from '../../../state-manager/const/contract-creator';
import { ABI_PRIVATE_POOL, ABI_PUBLIC_POOL } from '../const/shield-option-abi';
import { asyncScheduler, BehaviorSubject, EMPTY, from, NEVER, Observable, of, Subscription, zip } from 'rxjs';
import {
  privatePoolLiquidityGetter,
  publicPoolLiquidityGetter,
} from '../../../state-manager/contract/contract-getter-cpx-shield';
import { SLD_ENV_CONF } from '../const/env';
import * as _ from 'lodash';
import { SldDecimal } from '../../../util/decimal';
import { shieldOptionTradeContracts } from '../contract/shield-option-trade-contract';
import { Network } from '../../../constant/network';
import { getShieldRpcProviderCache } from '../const/http-rpc';
import { ERC20 } from '../../../wallet/abi';
import { JsonRpcProvider } from '@uniswap/widgets';
import { BigNumber, Contract } from 'ethers';
import { fetchJson } from '@ethersproject/web';
import * as net from 'node:net';

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
  // token address => token info
  private tokenCache: Map<string, TokenErc20> = new Map<string, TokenErc20>();
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

  // -------------------------------------------------------------------------------------------------------------------

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

    return zip(batchFetchTokenInfo(tokens, network), batchFetchPoolInfo(pools, network)).pipe(
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

    return batchFetchTokenInfo(tokenList, network).pipe(
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

  // optimized
  private getPrivatePoolLiquidity(pool: PrivatePool): Observable<SldDecimal> {
    return shieldOptionTradeContracts.CONTRACTS.liquidityManager.pipe(
      take(1),
      switchMap(contract => {
        return privatePoolLiquidityGetter(contract, pool.poolAddress, pool.token);
      })
    );
  }

  // optimized
  private getPublicPoolLiquidity(pool: PublicPool): Observable<SldDecimal> {
    return walletState.watchNetwork().pipe(
      switchMap((network: Network) => {
        const provider = getShieldRpcProviderCache(network);
        if (!provider) {
          return NEVER;
        }
        return of(createChainContract(pool.poolAddress, ABI_PUBLIC_POOL, provider, network));
      }),
      switchMap(poolContract => {
        return publicPoolLiquidityGetter(poolContract, pool.token);
      })
    );
  }

  private updateLiquidity(pool: PrivatePool | PublicPool): void {
    this.initLiquidity(pool);

    const key: string = poolCacheKey(pool.poolAddress, pool.network);
    const isPrivate: boolean = _.has(pool, 'indexUnderlying');

    const get$: Observable<SldDecimal> = isPrivate
      ? this.getPrivatePoolLiquidity(pool as PrivatePool)
      : this.getPublicPoolLiquidity(pool as PublicPool);

    const update$: Observable<SldDecimal> = get$.pipe(
      tap((liq: SldDecimal) => {
        this.liquidityCache.get(key)?.next(liq);
      })
    );

    asyncScheduler.schedule(() => {
      update$.subscribe();
    });
  }

  private initLiquidity(pool: PrivatePool | PublicPool) {
    const key = poolCacheKey(pool.poolAddress, pool.network);
    if (!this.liquidityCache.has(key)) {
      this.liquidityCache.set(key, new BehaviorSubject<SldDecimal | undefined>(undefined));
    }
  }
}

export const poolLiquidityService: ShieldPoolLiquidityService = new ShieldPoolLiquidityService();

// ---------------------------------------------------------------------------------------------------------------------

type Call = {
  jsonrpc: '2.0';
  method: 'eth_call';
  params: [
    {
      to: string;
      data: string;
    },
    'latest'
  ];
  id: number;
};

type TokenRpcRequestMeta = {
  id: number;
  type: 'sym' | 'dec';
  token: string;
  contract: Contract;
};

type UnderlyingRpcRequestMeta = {
  id: number;
  pool: string;
  contract: Contract;
};

type PriLiquidityRpcRequestMeta = {
  id: number;
  pool: PrivatePool;
  tokenContract: Contract;
};

type PubLiqRpcRequestMeta = {
  id: number;
  pool: PublicPool;
  poolContract: Contract;
};

type PrivatePoolRes = {
  network: Network;
  pool: string;
  indexUnderlying: ShieldUnderlyingType;
};

function poolCacheKey(poolAddress: string, network: Network): string {
  return network + ':' + poolAddress.toLowerCase();
}

function batchFetchTokenInfo(tokenAddresses: string[], network: Network): Observable<{ [p: string]: TokenErc20 }> {
  const rpcProvider: JsonRpcProvider = getShieldRpcProviderCache(network);
  const metas: TokenRpcRequestMeta[] = [];
  const tokenReqData: Call[] = tokenAddresses
    .map(tokenAddress => {
      return new Contract(tokenAddress, ERC20, rpcProvider);
    })
    .map((contract: Contract) => {
      const to: string = contract.address;
      const symData: string = contract.interface.encodeFunctionData('symbol', []);
      const decData: string = contract.interface.encodeFunctionData('decimals', []);

      return {
        to,
        symData,
        decData,
        contract,
      };
    })
    .map((data, index) => {
      const id1: number = index * 2;
      const id2: number = id1 + 1;

      const callSym: Call = {
        jsonrpc: '2.0',
        method: 'eth_call',
        params: [
          {
            to: data.to,
            data: data.symData,
          },
          'latest',
        ],
        id: id1,
      };
      const callDec: Call = {
        jsonrpc: '2.0',
        method: 'eth_call',
        params: [
          {
            to: data.to,
            data: data.decData,
          },
          'latest',
        ],
        id: id2,
      };
      const meta1: TokenRpcRequestMeta = {
        id: id1,
        type: 'sym',
        token: data.to,
        contract: data.contract,
      };
      const meta2: TokenRpcRequestMeta = {
        id: id2,
        type: 'dec',
        token: data.to,
        contract: data.contract,
      };

      metas.push(meta1, meta2);

      return [callSym, callDec];
    })
    .reduce((acc: Call[], cur: Call[]) => {
      return [...acc, ...cur];
    }, []);

  metas.sort((a, b) => a.id - b.id);

  return from(fetchJson(rpcProvider.connection, JSON.stringify(tokenReqData))).pipe(
    map(res => {
      return res.map((data, index): { data: any; meta: TokenRpcRequestMeta } => {
        const meta: TokenRpcRequestMeta = metas[data.id];
        return { data, meta };
      });
    }),
    map((resDataArr: { data: any; meta: TokenRpcRequestMeta }[]) => {
      return resDataArr.map(resData => {
        const method = resData.meta.type === 'sym' ? 'symbol' : 'decimals';
        const result = resData.meta.contract.interface.decodeFunctionResult(method, resData.data.result);

        return { meta: resData.meta, result: result[0] };
      });
    }),
    map(allResults => {
      const erc20Tokens: { [addr: string]: TokenErc20 } = {};

      allResults.forEach(rs => {
        const addr: string = rs.meta.token.toLowerCase();
        const data: Partial<TokenErc20> = rs.meta.type === 'sym' ? { symbol: rs.result } : { decimal: rs.result };
        const old: TokenErc20 = erc20Tokens[addr] || { address: addr, network };

        erc20Tokens[addr] = Object.assign(old, data);
      });

      return erc20Tokens;
    })
  );
}

function batchFetchPoolInfo(poolAddresses: string[], network: Network): Observable<{ [p: string]: PrivatePoolRes }> {
  const rpcProvider: JsonRpcProvider = getShieldRpcProviderCache(network);

  const metas: UnderlyingRpcRequestMeta[] = [];
  const calls: Call[] = poolAddresses
    .map(address => {
      const contract: Contract = new Contract(address, ABI_PRIVATE_POOL, rpcProvider);
      const underlyingData: string = contract.interface.encodeFunctionData('underlyingName', []);
      const to: string = contract.address;

      return { to, contract, underlyingData };
    })
    .map((reqData, index) => {
      const call: Call = {
        jsonrpc: '2.0',
        method: 'eth_call',
        params: [
          {
            to: reqData.to,
            data: reqData.underlyingData,
          },
          'latest',
        ],
        id: index,
      };
      const meta: UnderlyingRpcRequestMeta = {
        id: index,
        contract: reqData.contract,
        pool: reqData.contract.address,
      };

      metas.push(meta);

      return { call, meta };
    })
    .reduce((acc, cur) => {
      return [...acc, cur.call];
    }, [] as Call[]);

  metas.sort((a, b) => a.id - b.id);

  return from(fetchJson(rpcProvider.connection, JSON.stringify(calls))).pipe(
    map(res => {
      return res.map((data, index) => {
        const meta: UnderlyingRpcRequestMeta = metas[data.id];
        return { data, meta };
      });
    }),
    map((dataArr: { data; meta }[]) => {
      return dataArr.map(data => {
        const result = data.meta.contract.interface.decodeFunctionResult('underlyingName', data.data.result);
        return { meta: data.meta, result: result[0] };
      });
    }),
    map(allResults => {
      const pools: { [p: string]: PrivatePoolRes } = {};

      allResults.forEach(rs => {
        const poolAddr: string = rs.meta.pool.toLowerCase();

        const pool: PrivatePoolRes = {
          network,
          pool: poolAddr,
          indexUnderlying: rs.result,
        };

        pools[poolAddr] = pool;
      });

      return pools;
    })
  );
}

function batchFetchPrivateLiquidity(pools: PrivatePool[], network: Network): Observable<any> {
  const rpcProvider: JsonRpcProvider = getShieldRpcProviderCache(network);
  const metas: PriLiquidityRpcRequestMeta[] = [];

  const calls: Call[] = pools
    .map((pool, index) => {
      const tokenAddr: string = pool.token.address.toLowerCase();
      const poolAddr: string = pool.poolAddress.toLowerCase();
      const tokenContract: Contract = new Contract(tokenAddr, ERC20, getShieldRpcProviderCache(pool.network));

      const call: Call = {
        jsonrpc: '2.0',
        method: 'eth_call',
        params: [
          {
            to: tokenAddr,
            data: tokenContract.interface.encodeFunctionData('balanceOf', [poolAddr]),
          },
          'latest',
        ],
        id: index,
      };
      const meta: PriLiquidityRpcRequestMeta = {
        id: index,
        pool,
        tokenContract: tokenContract,
      };

      metas.push(meta);

      return { call, meta };
    })
    .reduce((acc, cur) => {
      return [...acc, cur.call];
    }, [] as Call[]);

  metas.sort((a, b) => a.id - b.id);

  return from(fetchJson(rpcProvider.connection, JSON.stringify(calls))).pipe(
    map(res => {
      return res.map((data, index) => {
        const meta: PriLiquidityRpcRequestMeta = metas[data.id];
        return { data, meta };
      });
    }),
    map((dataArr: { data: any; meta: PriLiquidityRpcRequestMeta }[]) => {
      return dataArr.map(data => {
        const result = data.data.result
          ? data.meta.tokenContract.interface.decodeFunctionResult('balanceOf', data.data.result)
          : [BigNumber.from('0')];

        return { meta: data.meta, result: result[0] };
      });
    }),
    map((allResults: { meta: PriLiquidityRpcRequestMeta; result: BigNumber }[]) => {
      const liquidity: { [k: string]: SldDecimal } = {};

      allResults.forEach((rs: { meta: PriLiquidityRpcRequestMeta; result: BigNumber }) => {
        const key: string = poolCacheKey(rs.meta.pool.poolAddress, rs.meta.pool.network);
        const liq: SldDecimal = SldDecimal.fromOrigin(BigNumber.from(rs.result), rs.meta.pool.token.decimal);

        liquidity[key] = liq;
      });

      return liquidity;
    })
  );
}

function batchFetchPublicLiquidity(pools: PublicPool[], network: Network): Observable<any> {
  const rpcProvider: JsonRpcProvider = getShieldRpcProviderCache(network);
  const metas: PubLiqRpcRequestMeta[] = [];

  const calls: Call[] = pools
    .map((pool, index) => {
      const poolContract: Contract = new Contract(pool.poolAddress, ABI_PUBLIC_POOL, rpcProvider);

      const call: Call = {
        jsonrpc: '2.0',
        method: 'eth_call',
        params: [
          {
            to: pool.poolAddress,
            data: poolContract.interface.encodeFunctionData('publicPoolInfo', []),
          },
          'latest',
        ],
        id: index,
      };
      const meta: PubLiqRpcRequestMeta = {
        id: index,
        pool,
        poolContract,
      };

      metas.push(meta);

      return { meta, call };
    })
    .reduce((acc, cur) => {
      return [...acc, cur.call];
    }, [] as Call[]);

  metas.sort((a, b) => a.id - b.id);

  return from(fetchJson(rpcProvider.connection, JSON.stringify(calls))).pipe(
    map(res => {
      return res.map((data, index) => {
        const meta: PubLiqRpcRequestMeta = metas[data.id];
        return { data, meta };
      });
    }),
    map((dataArr: { data: any; meta: PubLiqRpcRequestMeta }[]) => {
      return dataArr.map(data => {
        const result = data.meta.poolContract.interface.decodeFunctionResult('publicPoolInfo', data.data.result);
        return { meta: data.meta, result: result[0] }; // 0 is deposit amount
      });
    }),
    map(allResults => {
      const liquidity: { [k: string]: SldDecimal } = {};

      allResults.forEach(rs => {
        const key: string = poolCacheKey(rs.meta.pool.poolAddress, rs.meta.pool.network);
        const liq: SldDecimal = SldDecimal.fromOrigin(BigNumber.from(rs.result), rs.meta.pool.token.decimal);

        liquidity[key] = liq;
      });

      return liquidity;
    })
  );
}
