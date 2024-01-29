import { Network } from '../../constant/network';
import { EMPTY, from, Observable, of, switchMap, zip } from 'rxjs';
import { isSameAddress, isValidAddress } from '../../util/address';
import {
  DexVersion,
  StateNull,
  UniSwapV3PosNft,
  UniSwapPair,
  UniSwapPairInfo,
  UniSwapReserve,
  UniSwapSlot0,
  UniSwapV3PosNftAmount,
  UniSwapV3TokenAmount,
  TokenErc20,
  UniSwapV3PosNftPrice,
} from '../state-types';
import { uniSwapState } from '../const/uniswap-state';
import { Contract, BigNumber } from 'ethers';
import {
  dexPoolVersionGetter,
  izumiPairGetter,
  izumiPoolGetter,
  izumiStateGetter,
  uniSwapPairGetter,
  uniSwapV2PairReserveGetter,
  uniSwapV2PoolGetter,
  uniSwapV3PoolGetter,
  uniSwapV3Slot0Getter,
} from './contract-getter-sim-uniswap';
import { catchError, map, take } from 'rxjs/operators';
import {
  computeIzumiPairBasePrice,
  computeV2PairBasePrice,
  computeV3PairBasePrice,
  getDexFactoryVersion,
  uniSwapV3PosToAmount,
  uniSwapV3TickToPrice,
} from '../../util-bussiness/uniswap';
import { isSN, snAssert } from '../interface-util';
import { DexType, ZERO } from '../../constant';
import { SldDecimal, SldDecPercent } from '../../util/decimal';
import { contractNetworkGetter } from './contract-utils';
import { isBscNetworkGroup } from '../../constant/network-util';
import { erc20InfoByAddressGetter } from './contract-getter-sim-erc20';
import { contractNetwork, createContractByEnv } from '../const/contract-creator';
import { UNI_FACTORY_V3_ABI, UNI_V3_POOL_ABI } from '../../wallet/abi';
import { CACHE_10_SEC, CACHE_FOREVER, cacheService } from '../mem-cache/cache-contract';

function genCacheKey(contract: Contract, key: string, param?: string): string {
  const address = contractNetwork(contract) + '-' + contract.address;
  return address + '-' + key + (param || '');
}

/**
 *
 * @param pairAddress
 * @param network - refresh when network change
 */
export function dexVersionGetter(pairAddress: string, network?: Network): Observable<DexVersion | typeof StateNull> {
  if (!isValidAddress(pairAddress)) {
    return of(StateNull);
  }

  return uniSwapState.createDexMinContract(pairAddress).pipe(
    switchMap((pairContract: Contract | null) => {
      if (pairContract === null) {
        throw Error();
      }
      return dexPoolVersionGetter(pairContract);
    })
  );
}

export function dexPairInfoContractGetter(dexPoolContract: Contract, version: DexVersion): Observable<UniSwapPairInfo> {
  const pair$: Observable<UniSwapPair> =
    version.dex === DexType.IZUMI ? izumiPairGetter(dexPoolContract) : uniSwapPairGetter(dexPoolContract);

  return pair$.pipe(
    switchMap((pair: UniSwapPair) => {
      const token0$ = erc20InfoByAddressGetter(pair.token0);
      const token1$ = erc20InfoByAddressGetter(pair.token1);

      return zip(token0$, token1$).pipe(take(1));
    }),
    map(([token0, token1]): UniSwapPairInfo => {
      return {
        pairAddress: dexPoolContract.address,
        token0,
        token1,
      };
    })
  );
}

export function dexPairInfoGetter(
  dexPoolAddress: string,
  network?: Network
): Observable<UniSwapPairInfo | typeof StateNull> {
  if (!isValidAddress(dexPoolAddress)) {
    return of(StateNull);
  }

  const version$ = dexVersionGetter(dexPoolAddress);
  return version$.pipe(
    switchMap((version: DexVersion | typeof StateNull) => {
      if (isSN(version)) {
        throw Error();
      }

      const ver: DexVersion = snAssert(version);
      const contract$ =
        ver.dex === DexType.IZUMI
          ? uniSwapState.createIzumiPoolContract(dexPoolAddress)
          : ver.ver === 3
          ? uniSwapState.createV3PoolContract(dexPoolAddress)
          : uniSwapState.createV2PairContract(dexPoolAddress);

      return contract$.pipe(
        switchMap(contract => {
          return dexPairInfoContractGetter(contract, ver);
        })
      );
    }),
    catchError(err => {
      console.warn('error', err);
      return of(StateNull);
    })
  );
}

export function dexTierGetter(dexPoolAddress: string, network?: Network): Observable<SldDecimal | typeof StateNull> {
  if (!isValidAddress(dexPoolAddress)) {
    return of(StateNull);
  }

  return dexVersionGetter(dexPoolAddress).pipe(
    switchMap((version: DexVersion | typeof StateNull) => {
      if (isSN(version)) {
        throw Error();
      }

      const ver: DexVersion = snAssert(version);
      const contract$ =
        ver.dex === DexType.IZUMI
          ? uniSwapState.createIzumiPoolContract(dexPoolAddress)
          : ver.ver === 3
          ? uniSwapState.createV3PoolContract(dexPoolAddress)
          : uniSwapState.createV2PairContract(dexPoolAddress);

      return contract$.pipe(
        switchMap(contract => {
          return ver.dex === DexType.IZUMI
            ? izumiTierGetter(contract)
            : ver.ver === 3
            ? uniSwapV3TierGetter(contract)
            : of(SldDecimal.ZERO);
        })
      );
    }),
    catchError(err => {
      console.warn('error', err);
      return of(StateNull);
    })
  );
}

/**
 * Get uniSwap shot price
 *
 * @param pairAddress
 * @param baseAddress
 * @param network
 */
export function dexBasePriceGetter(pairAddress: string, baseAddress: string, network: Network): Observable<BigNumber> {
  return dexVersionGetter(pairAddress, network).pipe(
    switchMap((version: DexVersion | typeof StateNull) => {
      if (version === StateNull) {
        return of(BigNumber.from(0));
      }

      const contract$ =
        version.dex === DexType.IZUMI
          ? uniSwapState.createIzumiPoolContract(pairAddress)
          : version.ver === 2
          ? uniSwapState.createV2PairContract(pairAddress)
          : uniSwapState.createV3PoolContract(pairAddress);

      return contract$.pipe(
        switchMap(contract => {
          return version.dex === DexType.IZUMI
            ? izumiBasePriceGetter(contract, baseAddress)
            : version.ver === 2
            ? uniSwapV2BasePriceGetter(contract, baseAddress)
            : uniSwapV3BasePriceGetter(contract, baseAddress);
        })
      );
    }),
    catchError(err => {
      console.warn('error', err);
      return of(BigNumber.from(0));
    })
  );
}

export function dexPoolGetter(
  factoryContract: Contract,
  tokenA: string,
  tokenB: string,
  tier?: BigNumber
): Observable<string> {
  const dexVersion: DexVersion | undefined = getDexFactoryVersion(factoryContract.address);

  if (!dexVersion) {
    return EMPTY;
  }

  return dexVersion.dex === DexType.IZUMI
    ? izumiPoolGetter(factoryContract, tokenA, tokenB, tier as BigNumber)
    : dexVersion.ver === 2
    ? uniSwapV2PoolGetter(factoryContract, tokenA, tokenB)
    : uniSwapV3PoolGetter(factoryContract, tokenA, tokenB, tier as BigNumber);
}

/**
 * uniswap V2 price getter
 * @param v2PoolContract - pool contract with v2 ABI
 * @param baseAddress - base token address
 */
export function uniSwapV2BasePriceGetter(v2PoolContract: Contract, baseAddress: string): Observable<BigNumber> {
  if (!v2PoolContract) {
    return of(BigNumber.from(0));
  }

  const reserves$: Observable<UniSwapReserve> = uniSwapV2PairReserveGetter(v2PoolContract);
  const pairInfo$: Observable<UniSwapPairInfo | typeof StateNull> = contractNetworkGetter(v2PoolContract).pipe(
    switchMap((network: Network) => {
      const dex = isBscNetworkGroup(network) ? DexType.CAKE : DexType.UNI;
      return dexPairInfoContractGetter(v2PoolContract, { ver: 2, dex, net: network });
    })
  );

  return zip(reserves$, pairInfo$).pipe(
    map(([reserves, pairInfo]) => {
      if (pairInfo === StateNull) {
        return BigNumber.from(0);
      }
      return computeV2PairBasePrice(pairInfo, reserves, baseAddress);
    })
  );
}

/**
 * uniswap V3 price getter
 * @param v3PoolContract - pool contract with v3 ABI
 * @param baseAddress - base token address
 */
export function uniSwapV3BasePriceGetter(v3PoolContract: Contract, baseAddress: string): Observable<BigNumber> {
  const slot0$ = uniSwapV3Slot0Getter(v3PoolContract);

  const pair$: Observable<UniSwapPairInfo | typeof StateNull> = contractNetworkGetter(v3PoolContract).pipe(
    switchMap((network: Network) => {
      const dex = isBscNetworkGroup(network) ? DexType.CAKE : DexType.UNI;
      return dexPairInfoContractGetter(v3PoolContract, { dex, ver: 3, net: network });
    })
  );

  return zip(slot0$, pair$).pipe(
    map(([slot, pairInfo]) => {
      if (pairInfo === StateNull) {
        return BigNumber.from(0);
      }
      return computeV3PairBasePrice(pairInfo, slot.sqrtPriceX96, baseAddress);
    })
  );
}

export function uniSwapV3TierGetter(v3PoolContract: Contract): Observable<SldDecimal> {
  return from(v3PoolContract.fee() as Promise<BigNumber>).pipe(map(tier => SldDecimal.fromOrigin(tier, 4)));
}

/**
 * izumi price getter
 * @param izumiPoolContract
 * @param baseAddress
 */
export function izumiBasePriceGetter(izumiPoolContract: Contract, baseAddress: string): Observable<BigNumber> {
  const state$ = izumiStateGetter(izumiPoolContract);
  const pair$: Observable<UniSwapPairInfo | typeof StateNull> = contractNetworkGetter(izumiPoolContract).pipe(
    switchMap(network => {
      return dexPairInfoContractGetter(izumiPoolContract, { dex: DexType.IZUMI, ver: 1, net: network });
    })
  );
  return zip(state$, pair$).pipe(
    map(([state, pairInfo]) => {
      if (isSN(pairInfo)) {
        return ZERO;
      }

      return computeIzumiPairBasePrice(pairInfo as UniSwapPairInfo, state, baseAddress);
    })
  );
}

export function izumiTierGetter(izumiPoolContract: Contract): Observable<SldDecimal> {
  return from(izumiPoolContract.fee() as Promise<BigNumber>).pipe(map(tier => SldDecimal.fromOrigin(tier, 4)));
}

export function uniSwapV3PositionNftGetter(
  posNftContract: Contract,
  posNftId: BigNumber,
  baseToken: string
): Observable<UniSwapV3PosNft> {
  type Rs = {
    operator: string;
    token0: string;
    token1: string;
    fee: number;
    tickLower: number;
    tickUpper: number;
    liquidity: BigNumber;
    feeGrowthInside0LastX128: BigNumber;
    feeGrowthInside1LastX128: BigNumber;
    tokensOwed0: BigNumber;
    tokensOwed1: BigNumber;
  };

  const cacheKey: string = genCacheKey(posNftContract, 'nft_pos_token', posNftId.toString());

  const nft$ = from(posNftContract.positions(posNftId) as Promise<Rs>).pipe(
    switchMap((rs: Rs) => {
      const token0$ = erc20InfoByAddressGetter(rs.token0);
      const token1$ = erc20InfoByAddressGetter(rs.token1);

      return zip(token0$, token1$, of(rs));
    }),
    map(([token0, token1, rs]) => {
      const feeRate = SldDecPercent.fromOrigin(BigNumber.from(rs.fee), 6);
      const isToken0Base: boolean = isSameAddress(token0.address, baseToken);

      const minBasePrice: UniSwapV3PosNftPrice =
        (isToken0Base && rs.tickLower <= -887200) || (!isToken0Base && rs.tickUpper >= 887200)
          ? 'MIN'
          : uniSwapV3TickToPrice(isToken0Base ? rs.tickLower : rs.tickUpper, isToken0Base);
      const maxBasePrice: UniSwapV3PosNftPrice =
        (isToken0Base && rs.tickUpper >= 887200) || (!isToken0Base && rs.tickLower <= -887200)
          ? 'MAX'
          : uniSwapV3TickToPrice(isToken0Base ? rs.tickUpper : rs.tickLower, isToken0Base);

      return {
        isToken0Base,
        id: posNftId,
        token0,
        token1,
        liquidity: rs.liquidity,
        tickLower: rs.tickLower,
        tickUpper: rs.tickUpper,
        minBasePrice,
        maxBasePrice,
        feeRate,
        tier: BigNumber.from(rs.fee),
      };
    }),
    switchMap(nftInfo => {
      return uniSwapPosNftPoolSlot0Getter(posNftContract, nftInfo.token0, nftInfo.token1, nftInfo.tier).pipe(
        map((slot0: UniSwapSlot0): UniSwapV3PosNft => {
          const amount: UniSwapV3PosNftAmount = uniSwapV3PosToAmount(
            nftInfo.token0,
            nftInfo.token1,
            nftInfo.tickLower,
            nftInfo.tickUpper,
            nftInfo.liquidity,
            slot0
          );

          const baseTokenAmount: UniSwapV3TokenAmount = nftInfo.isToken0Base ? amount.amount0 : amount.amount1;
          const quoteTokenAmount: UniSwapV3TokenAmount = nftInfo.isToken0Base ? amount.amount1 : amount.amount0;

          return Object.assign({}, nftInfo, { baseTokenAmount, quoteTokenAmount });
        })
      );
    })
  );

  return cacheService.tryUseCache(nft$, cacheKey, CACHE_10_SEC);
}

export function uniSwapPosNftFactoryGetter(posNftContract: Contract): Observable<string> {
  const cacheKey: string = genCacheKey(posNftContract, 'factory_address');

  const factory$ = from(posNftContract.factory() as Promise<string>);

  return cacheService.tryUseCache(factory$, cacheKey, CACHE_FOREVER);
}

export function uniSwapPosNftPoolGetter(
  posNftContract: Contract,
  token0: TokenErc20,
  token1: TokenErc20,
  tier: BigNumber
): Observable<string> {
  return uniSwapPosNftFactoryGetter(posNftContract).pipe(
    switchMap((factory: string) => {
      const factoryContract: Contract = createContractByEnv(factory, UNI_FACTORY_V3_ABI, posNftContract);
      return uniSwapV3PoolGetter(factoryContract, token0.address, token1.address, tier);
    })
  );
}

export function uniSwapPosNftPoolSlot0Getter(
  posNftContract: Contract,
  token0: TokenErc20,
  token1: TokenErc20,
  tier: BigNumber
): Observable<UniSwapSlot0> {
  return uniSwapPosNftPoolGetter(posNftContract, token0, token1, tier).pipe(
    switchMap((poolAddress: string) => {
      const poolContract: Contract = createContractByEnv(poolAddress, UNI_V3_POOL_ABI, posNftContract);
      return uniSwapV3Slot0Getter(poolContract);
    })
  );
}

export function uniSwapPosNftAmountGetter(
  posNftContract: Contract,
  posNft: UniSwapV3PosNft
): Observable<UniSwapV3PosNftAmount> {
  return uniSwapPosNftPoolSlot0Getter(posNftContract, posNft.token0, posNft.token1, posNft.tier).pipe(
    map((slot0: UniSwapSlot0) => {
      return uniSwapV3PosToAmount(
        posNft.token0,
        posNft.token1,
        posNft.tickLower,
        posNft.tickUpper,
        posNft.liquidity,
        slot0
      );
    })
  );
}
