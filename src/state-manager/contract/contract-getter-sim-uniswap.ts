import { Contract, BigNumber } from 'ethers';
import { from, Observable, zip } from 'rxjs';
import { DexVersion, IzumiState, UniSwapPair, UniSwapReserve, UniSwapSlot0 } from '../state-types';
import { catchError, map, take } from 'rxjs/operators';
import { getDexFactoryVersion } from '../../util-bussiness/uniswap';
import { contractNetwork } from '../const/contract-creator';
import { CACHE_1_HOUR, CACHE_1_MIN, CACHE_FOREVER, cacheService } from '../mem-cache/cache-contract';

function genCacheKey(contract: Contract, key: string, param?: string): string {
  const address = contractNetwork(contract) + '-' + contract.address;
  return address + '-' + key + '-' + (param || '');
}

export function dexPoolVersionGetter(poolContract: Contract): Observable<DexVersion> {
  return from(poolContract.factory() as Promise<string>).pipe(
    map((factory: string) => {
      const ver: DexVersion | undefined = getDexFactoryVersion(factory);

      if (ver) {
        return ver;
      } else {
        throw Error('can not get factory version.');
      }
    }),
    catchError(err => {
      console.warn('error', poolContract.address, err);
      throw err;
    })
  );
}

export function uniSwapPairGetter(pairContract: Contract): Observable<UniSwapPair> {
  const token0$ = from(pairContract.token0() as Promise<string>);
  const token1$ = from(pairContract.token1() as Promise<string>);

  return zip(token0$, token1$).pipe(
    map(([token0, token1]) => {
      return {
        token0,
        token1,
        pairAddress: pairContract.address,
      };
    }),
    take(1)
  );
}

export function uniSwapV2PairReserveGetter(pariContract: Contract): Observable<UniSwapReserve> {
  return from(pariContract.getReserves() as Promise<UniSwapReserve>).pipe(
    map((reserves: UniSwapReserve) => {
      return {
        reserve0: reserves.reserve0,
        reserve1: reserves.reserve1,
      };
    })
  );
}

export function uniSwapV3Slot0Getter(pairContract: Contract): Observable<UniSwapSlot0> {
  const cacheKey: string = genCacheKey(pairContract, 'pool_slot0');

  const slot$ = from(pairContract.slot0() as Promise<UniSwapSlot0>);

  return cacheService.tryUseCache(slot$, cacheKey, CACHE_1_MIN);
}

export function izumiPairGetter(pairContract: Contract): Observable<UniSwapPair> {
  const tokenX$ = from(pairContract.tokenX() as Promise<string>);
  const tokenY$ = from(pairContract.tokenY() as Promise<string>);

  return zip(tokenX$, tokenY$).pipe(
    map(([token0, token1]) => {
      return {
        token0,
        token1,
        pairAddress: pairContract.address,
      };
    }),
    take(1)
  );
}

export function izumiStateGetter(poolContract: Contract): Observable<IzumiState> {
  return from(poolContract.state() as Promise<IzumiState>);
}

export function uniSwapV2PoolGetter(factoryContract: Contract, token1: string, token2: string): Observable<string> {
  const isA = BigNumber.from(token1).lt(BigNumber.from(token2));
  const [tokenA, tokenB] = isA ? [token1, token2] : [token2, token1];
  return from(factoryContract.getPair(tokenA, tokenB) as Promise<string>);
}

export function uniSwapV3PoolGetter(
  factoryContract: Contract,
  tokenA: string,
  tokenB: string,
  tier: BigNumber
): Observable<string> {
  const cacheKey: string = genCacheKey(
    factoryContract,
    'univ3_pool_address',
    tokenA + '-' + tokenB + '-' + tier.toString()
  );

  const pool$ = from(factoryContract.getPool(tokenA, tokenB, tier) as Promise<string>);

  return cacheService.tryUseCache(pool$, cacheKey, CACHE_FOREVER);
}

export function izumiPoolGetter(
  factoryContract: Contract,
  tokenX: string,
  tokenY: string,
  tier: BigNumber
): Observable<string> {
  return from(factoryContract.pool(tokenX, tokenY, tier) as Promise<string>);
}
