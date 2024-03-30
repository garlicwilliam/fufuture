import {
  DexFactory,
  DexVersion,
  IzumiState,
  TokenErc20,
  UniSwapPairInfo,
  UniSwapReserve,
  UniSwapSlot0,
  UniSwapV3PosNftAmount,
} from '../state-manager/state-types';
import { BigNumber } from 'ethers';
import * as _ from 'lodash';
import { baseBigNumber, keepE18Number } from '../util/ethers';
import { NET_BNB, NET_BNB_TEST, NET_ETHEREUM, Network } from '../constant/network';
import { SldDecimal, SldDecPrice } from '../util/decimal';
import { isSameAddress } from '../util/address';
import { DexType, E18, Q192 } from '../constant';
import { arrayContains } from '../util/array';
import { SqrtPriceMath, TickMath } from '@uniswap/v3-sdk';
import JSBI from 'jsbi';

export const VAULT_SS_SUPPORT_DEX_FACTORY = [DexType.UNI, DexType.CAKE, DexType.IZUMI];
export const VAULT_DM_SUPPORT_DEX_FACTORY = [DexType.UNI, DexType.CAKE];
export const UNISWAP_FACTORY_ADDRESS: DexFactory[] = [
  { ver: 3, dex: DexType.UNI, net: NET_ETHEREUM, factory: '0x1F98431c8aD98523631AE4a59f267346ea31F984' },
  { ver: 2, dex: DexType.UNI, net: NET_ETHEREUM, factory: '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f' },
  { ver: 2, dex: DexType.CAKE, net: NET_BNB_TEST, factory: '0xB7926C0430Afb07AA7DEfDE6DA862aE0Bde767bc' },
  { ver: 1, dex: DexType.IZUMI, net: NET_BNB_TEST, factory: '0xfc601E5D885d0545ee1B20EA1711D1F1c0eA7d0A' },
  { ver: 2, dex: DexType.CAKE, net: NET_BNB, factory: '0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73' },
  { ver: 1, dex: DexType.IZUMI, net: NET_BNB, factory: '0xd7de110Bd452AAB96608ac3750c3730A17993DE0' },
];
/**
 * compute uniswap v2 price by dex pair info
 * @param pairInfo
 * @param reserves
 * @param baseAddress
 */
export function computeV2PairBasePrice(
  pairInfo: UniSwapPairInfo,
  reserves: UniSwapReserve,
  baseAddress: string
): BigNumber {
  const is0Base = isSameAddress(pairInfo.token0.address, baseAddress);
  const is1Base = isSameAddress(pairInfo.token1.address, baseAddress);

  if (!is0Base && !is1Base) {
    return BigNumber.from(0);
  }

  const [base, quote, reserveBase, reserveQuote] = is0Base
    ? [pairInfo.token0, pairInfo.token1, reserves.reserve0, reserves.reserve1]
    : [pairInfo.token1, pairInfo.token0, reserves.reserve1, reserves.reserve0];

  const baseMod = BigNumber.from('1' + _.repeat('0', base.decimal));
  const price = reserveQuote.mul(baseMod).div(reserveBase);

  return keepE18Number(price, quote.decimal);
}

/**
 * Compute UniSwap V3 pool Price
 * sqrtPriceX96 is a square root of token0 price described by quote (token1) decimal.
 *
 * @param pairInfo
 * @param sqrtPriceX96
 * @param baseAddress
 */
export function computeV3PairBasePrice(
  pairInfo: UniSwapPairInfo,
  sqrtPriceX96: BigNumber,
  baseAddress: string
): BigNumber {
  const Q192: BigNumber = BigNumber.from(2).pow(192);
  const x96_2: BigNumber = sqrtPriceX96.pow(2);

  const isToken0Base: boolean = isSameAddress(pairInfo.token0.address, baseAddress);
  if (isToken0Base) {
    // token1 decimal
    const priceToken0: BigNumber = x96_2.mul(baseBigNumber(pairInfo.token0.decimal)).div(Q192);
    return keepE18Number(priceToken0, pairInfo.token1.decimal);
  } else {
    // token0 decimal
    const priceToken1 = Q192.mul(baseBigNumber(pairInfo.token1.decimal)).div(x96_2);
    return keepE18Number(priceToken1, pairInfo.token0.decimal);
  }
}

/**
 * Compute Izumi pool price
 * @param pairInfo
 * @param state
 * @param baseAddress
 */
export function computeIzumiPairBasePrice(
  pairInfo: UniSwapPairInfo,
  state: IzumiState,
  baseAddress: string
): BigNumber {
  return computeV3PairBasePrice(pairInfo, state.sqrtPrice_96, baseAddress);
}

export function getDexFactoryVersion(factoryAddress: string): DexFactory | undefined {
  return UNISWAP_FACTORY_ADDRESS.find(one => isSameAddress(one.factory, factoryAddress));
}

export enum VaultProductType {
  LongTail = 'LongTail',
  Dominant = 'Dominant',
}

export function findDexFactories(opt: { network: Network; tier?: boolean; vaultType?: VaultProductType }): string[] {
  return UNISWAP_FACTORY_ADDRESS.filter(one => {
    const correctNet: boolean = one.net === opt.network;
    const correctType: boolean =
      opt.tier === undefined ? true : opt.tier ? isUsedTierFactory(one) : isUnusedTierFactory(one);
    const correctName: boolean =
      opt.vaultType === undefined
        ? true
        : opt.vaultType === VaultProductType.LongTail
        ? arrayContains(VAULT_SS_SUPPORT_DEX_FACTORY, one.dex)
        : opt.vaultType === VaultProductType.Dominant
        ? arrayContains(VAULT_DM_SUPPORT_DEX_FACTORY, one.dex)
        : true;

    return correctNet && correctType && correctName;
  }).map(one => one.factory);
}

export function getUsedTierFactories(factories: string[]): string[] {
  return factories.filter(one => {
    const ver: DexVersion | undefined = getDexFactoryVersion(one);
    return !!ver && isUsedTierFactory(ver);
  });
}

export function getUnusedTierFactories(factories: string[]): string[] {
  return factories.filter(one => {
    const ver: DexVersion | undefined = getDexFactoryVersion(one);
    return !!ver && isUnusedTierFactory(ver);
  });
}

export function dexVersionStr(dexVer: DexVersion | null): string {
  if (!dexVer) {
    return '';
  }

  return dexVer.dex === DexType.CAKE
    ? 'Pancake'
    : dexVer.dex === DexType.IZUMI
    ? 'iZUMi'
    : dexVer.ver === 2
    ? 'UNI V2'
    : 'UNI V3';
}

export function isUnusedTierFactory(dexVer: DexVersion): boolean {
  return dexVer.ver === 2;
}

export function isUsedTierFactory(dexVer: DexVersion): boolean {
  return dexVer.ver !== 2;
}

export function uniSwapV3TickToPrice(tick: number, baseBeforeQuote: boolean): SldDecPrice {
  const sqrtRatioX96: JSBI = TickMath.getSqrtRatioAtTick(tick);
  const x96_2: BigNumber = BigNumber.from(JSBI.multiply(sqrtRatioX96, sqrtRatioX96).toString());

  const priceBigNum: BigNumber = baseBeforeQuote ? x96_2.mul(E18).div(Q192) : Q192.mul(E18).div(x96_2);

  return SldDecPrice.fromE18(priceBigNum);
}

export function uniSwapV3PosToAmount(
  token0: TokenErc20,
  token1: TokenErc20,
  tickLower: number,
  tickUpper: number,
  nftLiquidity: BigNumber,
  poolSlot0: UniSwapSlot0
): UniSwapV3PosNftAmount {
  const liquidity: JSBI = JSBI.BigInt(nftLiquidity.toString());
  const sqrtPriceX96: JSBI = JSBI.BigInt(poolSlot0.sqrtPriceX96.toString());

  let amount0: JSBI = JSBI.BigInt(0);

  if (poolSlot0.tick < tickLower) {
    amount0 = SqrtPriceMath.getAmount0Delta(
      TickMath.getSqrtRatioAtTick(tickLower),
      TickMath.getSqrtRatioAtTick(tickUpper),
      liquidity,
      false
    );
  } else if (poolSlot0.tick < tickUpper) {
    amount0 = SqrtPriceMath.getAmount0Delta(sqrtPriceX96, TickMath.getSqrtRatioAtTick(tickUpper), liquidity, false);
  }

  const amountA: SldDecimal = SldDecimal.fromOrigin(BigNumber.from(amount0.toString()), token0.decimal);

  let amount1: JSBI;

  if (poolSlot0.tick < tickLower) {
    amount1 = JSBI.BigInt(0);
  } else if (poolSlot0.tick < tickUpper) {
    amount1 = SqrtPriceMath.getAmount1Delta(TickMath.getSqrtRatioAtTick(tickLower), sqrtPriceX96, liquidity, false);
  } else {
    amount1 = SqrtPriceMath.getAmount1Delta(
      TickMath.getSqrtRatioAtTick(tickLower),
      TickMath.getSqrtRatioAtTick(tickUpper),
      liquidity,
      false
    );
  }

  const amountB: SldDecimal = SldDecimal.fromOrigin(BigNumber.from(amount1.toString()), token1.decimal);

  return {
    amount0: {
      amount: amountA,
      token: token0,
    },
    amount1: {
      amount: amountB,
      token: token1,
    },
  };
}
