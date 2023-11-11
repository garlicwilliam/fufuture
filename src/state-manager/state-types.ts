import { BigNumber } from 'ethers';
import { Network } from '../constant/network';
import { SldDecimal, SldDecPercent, SldDecPrice } from '../util/decimal';
import { IndexUnderlyingType } from '../components/shield-option-trade/const/assets';

export const ArgIllegal = Symbol('illegal');
export const StateNull = Symbol('null');

export type StateNullType = typeof StateNull;
export type TokenPriceHistory = {
  curPrice: number;
  history: [number, number][];
  minPrice: number;
};

export type PriceDuration = 'DAY' | 'MONTH' | 'WEEK';
export type TradeChartType = 'PRICE' | 'KLINE';

// --------------------------------------------------

export type TokenErc20 = {
  network: Network;
  address: string;
  symbol: string;
  decimal: number;
};

export type ShieldTradePair = {
  indexUnderlying: IndexUnderlyingType;
  quoteToken: TokenErc20;
};

export enum ShieldOptionType {
  Call = 'Call',
  Put = 'Put',
}

export enum ShieldOrderState {
  ACTIVE,
  CLOSED,
  TAKER_LIQUIDATED,
  MAKER_LIQUIDATED,
  POOL_LIQUIDATED,
  MAKER_AGREEMENT_LIQUIDATED,
  POOL_AGREEMENT_LIQUIDATED,
  TAKER_MAKER_AGREEMENT_LIQUIDATED,
  TAKER_POOL_AGREEMENT_LIQUIDATED,
}

export type ShieldUserAccountInfo = {
  availableBalance: SldDecimal;
  lockedMargin: SldDecimal;
  orderTotalCount: number;
  activeOrderIDArr: BigNumber[];
};

export type ShieldOrderInfo = {
  id: BigNumber;
  takerAddress: string;
  indexUnderlying: IndexUnderlyingType;
  token: TokenErc20;
  optionType: ShieldOptionType;
  orderState: ShieldOrderState;
  orderAmount: SldDecimal;
  openPrice: SldDecPrice;
  openTime: number;
  fundingFee: {
    initial: SldDecimal; // the first day funding amount
    paid: SldDecimal; // user really paid funding fee
  };
  tradingFee: SldDecimal;
  closePrice: SldDecPrice;
  maintenanceMargin: SldDecimal;
  closeTime?: number;
  markPrice?: SldDecPrice;
  phaseInfo?: ShieldOrderFundPhaseInfo;
  pnl?: {
    unrealizedPnl: SldDecimal;
    profit: SldDecimal;
    pnl: SldDecimal;
  };
};
export type ShieldMakerOrderInfo = {
  id: BigNumber;
  indexInPool: BigNumber;
  taker: string;
  maker: string;
  orderStatus: ShieldOrderState;

  indexUnderlying: IndexUnderlyingType;
  token: TokenErc20;
  optionType: ShieldOptionType;
  openPrice: SldDecPrice;
  orderAmount: SldDecimal;
  openTime: number;

  fundingInfo: {
    init: SldDecimal;
    paid: SldDecimal;
    scheduleMigration: number;
    lastMigration: number;
  };

  makerMarginAmount: SldDecimal;
  makerMaintenanceLocked: SldDecimal;

  markPrice?: SldDecPrice;
  pnl?: {
    positionLoss: SldDecimal;
    premium: SldDecimal;
    pnl: SldDecimal;
  };
  liquidationPrice?: SldDecPrice;
};
export type ShieldOrderMigration = {
  id: BigNumber;
  lastSettlementTime: number;
  scheduleSettleTime: number;
  inPeriodHours: number;
};
export type ShieldOrderFundPhaseInfo = {
  id: BigNumber;
  nextPhase: number;
  laterPhases: {
    phaseIndex: number;
    fundingFee: SldDecimal;
  }[];
};

export type ShieldPoolInfo = {
  poolAddress: string;
  available: SldDecimal;
  locked: SldDecimal;
  total: SldDecimal;
};
export type ShieldPoolMetaInfo = {
  indexUnderlying: IndexUnderlyingType;
  token: TokenErc20;
};
export type ShieldTokenPoolInfo = ShieldPoolMetaInfo & {
  priInfo?: ShieldPoolInfo;
  pubInfo?: ShieldPoolInfo;
};
export type ShieldTokenPoolLiquidity = ShieldPoolMetaInfo & {
  privateLiquidity: SldDecimal;
  publicLiquidity: SldDecimal;
};
export type ShieldTokenPoolLiquidityList = {
  liquidity: ShieldTokenPoolLiquidity[];
  indexUnderlying: IndexUnderlyingType;
};
export type ShieldTokenPoolAddress = ShieldPoolMetaInfo & {
  priPoolAddress: string;
  pubPoolAddress: string;
};
export type ShieldOrderOpenResult = {
  phase0Fee: SldDecimal;
  fundingFee: SldDecimal;
  isLackLiquidity: boolean;
  isLackAvailable: boolean;
};
export type ShieldMakerPrivatePoolInfo = {
  priPoolAddress: string;
  indexUnderlying: IndexUnderlyingType;
  token: TokenErc20;
  holder: string;
  amount: SldDecimal;
  amountAvailable: SldDecimal;
  amountLocked: SldDecimal;
  marginFee: SldDecimal;
  isReject: boolean;
  isExclusive: boolean;
};
export type ShieldMakerPublicPoolShare = {
  poolAddress: string;
  token: TokenErc20;
  lp: TokenErc20;
  lpBalance: SldDecimal;
  lpTotalSupply: SldDecimal;
  lpShare: SldDecPercent;
  lpPrice: SldDecimal;
};

export type ShieldBrokerReward = {
  token: TokenErc20;
  amount: SldDecimal;
};
