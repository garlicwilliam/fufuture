import {
  ShieldClosedOrderInfo,
  ShieldMakerOrderInfo,
  ShieldOptionType,
  ShieldOrderInfo,
  ShieldOrderMigration,
} from '../../../state-manager/state-types';
import { SldDecimal, SldDecPercent, SldDecPrice } from '../../../util/decimal';
import { BigNumber } from 'ethers';
import { baseBigNumber } from '../../../util/ethers';
import { numString, percentageCompute } from '../../../util/math';
import { arrayInteger } from '../../../util/array';

export type PhaseFundingFeeMeta = { dayIndex: number; duration: number; phaseIndex: number };

export type OrderNextPhaseFundingMetaInfo = {
  phase0Fee: SldDecimal;
  day0Fee: SldDecimal;
  phaseDuration: number;
  nextPhase: PhaseFundingFeeMeta;
  owedFundingFee?: PhaseFundingFeeMeta[];
  overFundingFee?: PhaseFundingFeeMeta[];
};

export function computeClosedOrderPnl(order: ShieldClosedOrderInfo): SldDecimal {
  const positionProfit: SldDecimal =
    order.optionType === ShieldOptionType.Call
      ? order.closePrice.gt(order.openPrice)
        ? order.orderAmount.toUsdValue(order.closePrice.sub(order.openPrice), order.token.decimal).toTokenDecimal()
        : SldDecimal.ZERO
      : order.openPrice.gt(order.closePrice)
      ? order.orderAmount.toUsdValue(order.openPrice.sub(order.closePrice), order.token.decimal).toTokenDecimal()
      : SldDecimal.ZERO;

  const fundingFee: SldDecimal = order.fundingFeePaid;

  const pnl = positionProfit.sub(fundingFee);

  return pnl;
}

export function computeOrderPnl(order: ShieldOrderInfo): {
  unrealizedPnl: SldDecimal;
  profit: SldDecimal;
  pnl: SldDecimal;
} {
  if (!order.markPrice && !order.closePrice) {
    return { unrealizedPnl: SldDecimal.ZERO, profit: SldDecimal.ZERO, pnl: SldDecimal.ZERO };
  }

  const markPrice = order.markPrice || order.closePrice;

  const isProfit =
    order.optionType === ShieldOptionType.Call ? markPrice.gt(order.openPrice) : markPrice.lt(order.openPrice);

  const deltaPrice: SldDecPrice = markPrice.gt(order.openPrice)
    ? markPrice.sub(order.openPrice)
    : order.openPrice.sub(markPrice);

  const orderUsdVal = order.orderAmount.toUsdValue(deltaPrice, order.token.decimal);
  const deltaValue: SldDecimal = orderUsdVal.toStableTokenAmount();

  const fees: SldDecimal = order.fundingFee.paid.add(order.tradingFee);

  const profit: SldDecimal = isProfit && deltaValue.gt(fees) ? deltaValue.sub(fees) : SldDecimal.ZERO;
  const sign = BigNumber.from(isProfit ? 1 : -1);

  const pnl = isProfit ? deltaValue.sub(order.fundingFee.paid) : order.fundingFee.paid.mul(sign);

  return {
    unrealizedPnl: deltaValue.mul(sign),
    profit,
    pnl,
  };
}

export function computeOrderPhaseDayIndex(phaseIndex: number, phaseDuration: number): number {
  return Math.floor((phaseIndex * phaseDuration) / (24 * 3600));
}

function computeOrderPhasesMetaInfo(
  openTime: number,
  dailySettlementTimes: number
): {
  curPhaseIndex: number;
  phaseDuration: number;
  phase0Start: number;
} {
  const dayDuration = 24 * 3600;
  const now = Math.ceil(new Date().getTime() / 1000);

  const phaseDuration = Math.ceil(dayDuration / dailySettlementTimes);
  const phase0Start: number = Math.floor(openTime / phaseDuration) * phaseDuration;
  const curPhaseIndex = Math.floor((now - phase0Start) / phaseDuration);

  return { curPhaseIndex, phaseDuration, phase0Start };
}

function computeOrderOwedFundingInfo(
  phase0Start: number,
  phaseDuration: number,
  payedEndTimestamp: number,
  curPhaseIndex: number
): { dayIndex: number; duration: number; phaseIndex: number }[] {
  const shouldPayEndTimestamp: number = (curPhaseIndex + 1) * phaseDuration + phase0Start;

  if (payedEndTimestamp >= shouldPayEndTimestamp) {
    return [];
  }

  const res: { dayIndex: number; duration: number; phaseIndex: number }[] = [];
  let needPayPhaseIndex = Math.floor((payedEndTimestamp - phase0Start) / phaseDuration);
  let payedTimestamp = payedEndTimestamp;

  while (needPayPhaseIndex <= curPhaseIndex) {
    const thisPhaseEnd: number = phase0Start + (needPayPhaseIndex + 1) * phaseDuration;
    const duration: number = thisPhaseEnd - payedTimestamp;
    const dayIndex: number = computeOrderPhaseDayIndex(needPayPhaseIndex, phaseDuration);

    res.push({
      dayIndex,
      duration,
      phaseIndex: needPayPhaseIndex,
    });

    needPayPhaseIndex++;
    payedTimestamp = thisPhaseEnd;
  }

  return res;
}

function computeOrderOverFundingInfo(
  phase0Start: number,
  phaseDuration: number,
  payedEnd: number,
  curPhaseIndex: number
): { dayIndex: number; duration: number; phaseIndex: number }[] {
  const shouldPayEnd = (curPhaseIndex + 1) * phaseDuration + phase0Start;
  if (payedEnd <= shouldPayEnd) {
    return [];
  }

  const res: { dayIndex: number; duration: number; phaseIndex: number }[] = [];

  let nextPhaseIndex = curPhaseIndex + 1;
  let nextPhaseBegin = nextPhaseIndex * phaseDuration;

  while (payedEnd > nextPhaseBegin) {
    const overPayedDuration = payedEnd - nextPhaseBegin;
    const duration = Math.min(overPayedDuration, phaseDuration);

    res.push({
      duration,
      phaseIndex: nextPhaseIndex,
      dayIndex: computeOrderPhaseDayIndex(nextPhaseIndex, phaseDuration),
    });

    nextPhaseIndex++;
    nextPhaseBegin += phaseDuration;
  }

  return res;
}

export function computeOrderNextPhaseFundingInfo(
  order: ShieldOrderInfo,
  orderMigration: ShieldOrderMigration,
  dailySettleTimes: number // integer
): OrderNextPhaseFundingMetaInfo {
  const { curPhaseIndex, phase0Start, phaseDuration } = computeOrderPhasesMetaInfo(order.openTime, dailySettleTimes);

  const res: OrderNextPhaseFundingMetaInfo = {
    day0Fee: order.fundingFee.initial,
    phase0Fee: order.fundingFee.initial.div(BigNumber.from(dailySettleTimes)),
    phaseDuration,
    nextPhase: {
      duration: phaseDuration,
      phaseIndex: curPhaseIndex + 1,
      dayIndex: computeOrderPhaseDayIndex(curPhaseIndex + 1, phaseDuration),
    },
  };

  res.owedFundingFee = computeOrderOwedFundingInfo(
    phase0Start,
    phaseDuration,
    orderMigration.scheduleSettleTime,
    curPhaseIndex
  );

  res.overFundingFee = computeOrderOverFundingInfo(
    phase0Start,
    phaseDuration,
    orderMigration.scheduleSettleTime,
    curPhaseIndex
  );

  return res;
}

export function computeOrderLaterPhaseFundingFee(
  fromPhase: number,
  phaseCount: number,
  allDaysRates: SldDecPercent[],
  phase0Fee: SldDecimal,
  timesPerDay: number,
  fromPhaseFee?: SldDecimal
): SldDecimal {
  function phaseFee(phaseIndex: number): SldDecimal {
    const dayIndex: number = Math.floor(phaseIndex / timesPerDay);
    const phaseRate: SldDecPercent = allDaysRates[dayIndex];

    return phaseRate.applyTo(phase0Fee);
  }

  const phaseIndexes: number[] = arrayInteger(phaseCount, fromPhase);

  return phaseIndexes
    .map(index => {
      return index === fromPhase && fromPhaseFee ? fromPhaseFee : phaseFee(index);
    })
    .reduce((acc, cur) => {
      return acc.add(cur);
    }, SldDecimal.ZERO);
}

export function computeMakerOrderLoss(order: ShieldMakerOrderInfo): SldDecimal {
  if (!order.markPrice) {
    return SldDecimal.ZERO;
  }

  const isProfit: boolean =
    order.optionType === ShieldOptionType.Call
      ? order.markPrice.gt(order.openPrice)
      : order.markPrice.lt(order.openPrice);

  if (isProfit) {
    const deltaPrice: SldDecPrice = order.openPrice.gt(order.markPrice)
      ? order.openPrice.sub(order.markPrice)
      : order.markPrice.sub(order.openPrice);

    return order.orderAmount.toUsdValue(deltaPrice, order.token.decimal).toStableTokenAmount();
  } else {
    return SldDecimal.ZERO;
  }
}

export function computeMakerOrderPnl(order: ShieldMakerOrderInfo): {
  pnl: SldDecimal;
  positionLoss: SldDecimal;
  premium: SldDecimal;
} {
  const positionLoss = computeMakerOrderLoss(order);
  const premium = order.fundingInfo.paid;
  const pnl = premium.sub(positionLoss);

  return { pnl, positionLoss, premium };
}

export function computeMakerLiquidationPrice(order: ShieldMakerOrderInfo): {
  liqPrice: SldDecPrice;
  couldLiq: boolean;
} {
  const E: BigNumber = baseBigNumber(order.orderAmount.getOriginDecimal());
  const r: BigNumber = order.makerMarginAmount.toOrigin().mul(E).div(order.orderAmount.toOrigin());
  const delta: SldDecimal = SldDecimal.fromOrigin(r, order.makerMarginAmount.getOriginDecimal());
  const deltaPrice: SldDecPrice = SldDecPrice.fromE18(delta.toE18());

  const isCall: boolean = order.optionType === ShieldOptionType.Call;
  const liqPrice: SldDecPrice = isCall ? order.openPrice.add(deltaPrice) : order.openPrice.sub(deltaPrice);
  const couldLiq: boolean = (isCall ? order.markPrice?.gt(liqPrice) : order.markPrice?.lt(liqPrice)) || false;

  return { liqPrice, couldLiq };
}

export function computeMakerLiquidationAxis(
  totalWidth: number,
  curPrice: SldDecPrice,
  openPrice: SldDecPrice,
  liqPrice: SldDecPrice
): {
  openOffset: SldDecPercent;
  liqOffset: SldDecPercent;
  curOffset: SldDecPercent;
  openPoint: SldDecimal;
  liqPoint: SldDecimal;
  curPoint: SldDecimal;
} {
  const ops = { removeZero: true, split: false, fix: 2 };

  function priceToAxisX(price: SldDecPrice, base: SldDecPrice): number {
    const sign = price.gte(base) ? 1 : -1;
    const delta = sign >= 0 ? price.sub(base) : base.sub(price);
    const mask = Number(delta.format(ops)) + 1;

    return mask * sign;
  }

  function xToY(x: number): number {
    return Math.log2(x);
  }

  function widthOffsetPercent(x: number, maxValue: number): SldDecPercent {
    const y = xToY(Math.abs(x));
    const deltaPStr = numString(percentageCompute(maxValue, y));

    const deltaP = SldDecPercent.genPercent(deltaPStr, 4).div(BigNumber.from(2));
    const center = SldDecPercent.genPercent('50', 4);

    return x > 0 ? center.add(deltaP) : center.sub(deltaP);
  }

  const sizeDelta = SldDecPrice.fromE18(curPrice.toE18().div(3));
  const startPrice = curPrice.sub(sizeDelta);
  const endPrice = curPrice.add(sizeDelta);

  openPrice = openPrice.gt(endPrice) ? endPrice : openPrice;
  openPrice = openPrice.lt(startPrice) ? startPrice : openPrice;

  liqPrice = liqPrice.gt(endPrice) ? endPrice : liqPrice;
  liqPrice = liqPrice.lt(startPrice) ? startPrice : liqPrice;

  const endX: number = priceToAxisX(endPrice, curPrice);
  const endY: number = xToY(endX);

  const openX: number = priceToAxisX(openPrice, curPrice);
  const openOffset: SldDecPercent = widthOffsetPercent(openX, endY);

  const liqX: number = priceToAxisX(liqPrice, curPrice);
  const liqOffset: SldDecPercent = widthOffsetPercent(liqX, endY);

  const curOffset: SldDecPercent = SldDecPercent.genPercent('50', 4);

  const totalWidthNum = BigNumber.from(Math.ceil(totalWidth));
  const totalSize = SldDecimal.fromOrigin(totalWidthNum, 0);

  const openPoint = openOffset.applyTo(totalSize);
  const liqPoint = liqOffset.applyTo(totalSize);
  const curPoint = curOffset.applyTo(totalSize);

  return { openOffset, liqOffset, curOffset, openPoint, liqPoint, curPoint };
}

export function computeMakerLiquidationAxis1(
  totalWidth: number,
  curPrice: SldDecPrice,
  openPrice: SldDecPrice,
  liqPrice: SldDecPrice
): {
  openOffset: SldDecPercent;
  liqOffset: SldDecPercent;
  curOffset: SldDecPercent;
  openPoint: SldDecimal;
  liqPoint: SldDecimal;
  curPoint: SldDecimal;
} {
  const min = SldDecPrice.min(curPrice, openPrice, liqPrice);
  const max = SldDecPrice.max(curPrice, openPrice, liqPrice);

  const edgePriceDelta = max.sub(min).div(BigNumber.from(15));
  const startPrice = min.sub(edgePriceDelta);
  const endPrice = max.add(edgePriceDelta);

  const widthDeltaPrice = endPrice.sub(startPrice);
  const totalSize: SldDecimal = SldDecimal.fromOrigin(BigNumber.from(Math.ceil(totalWidth)), 0);

  const openOffset = SldDecPercent.fromArgs(widthDeltaPrice.toDecimal(), openPrice.sub(startPrice).toDecimal());
  const liqOffset = SldDecPercent.fromArgs(widthDeltaPrice.toDecimal(), liqPrice.sub(startPrice).toDecimal());
  const curOffset = SldDecPercent.fromArgs(widthDeltaPrice.toDecimal(), curPrice.sub(startPrice).toDecimal());

  const openPoint = openOffset.applyTo(totalSize);
  const liqPoint = liqOffset.applyTo(totalSize);
  const curPoint = curOffset.applyTo(totalSize);

  return { openOffset, liqOffset, curOffset, openPoint, liqPoint, curPoint };
}
