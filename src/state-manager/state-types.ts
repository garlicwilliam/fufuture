import { BigNumber } from 'ethers';
import { Network } from '../constant/network';
import { DecimalJson, SldDecimal, SldDecPercent, SldDecPrice } from '../util/decimal';
import { DexType } from '../constant';

export const ArgIllegal = Symbol('illegal');
export const StateNull = Symbol('null');

export type StateNullType = typeof StateNull;
export type TokenPriceHistory = {
  duration: PriceDuration;
  underlying: ShieldUnderlyingType;
  network: Network;
  curPrice: number;
  history: [number, number][];
  minPrice: number;
  maxPrice: number;
  priceChange: number;
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

export type UniSwapPair = {
  pairAddress: string;
  token0: string;
  token1: string;
};
export type UniSwapPairInfo = {
  pairAddress: string;
  token0: TokenErc20;
  token1: TokenErc20;
};
export type UniSwapReserve = {
  reserve0: BigNumber;
  reserve1: BigNumber;
};
export type UniSwapSlot0 = {
  sqrtPriceX96: BigNumber;
  tick: number;
};
export type UniSwapV3PosNftPrice = SldDecPrice | 'MIN' | 'MAX';
export type UniSwapV3PosNft = {
  id: BigNumber;
  token0: TokenErc20;
  token1: TokenErc20;
  liquidity: BigNumber;
  tickLower: number;
  tickUpper: number;
  minBasePrice: UniSwapV3PosNftPrice;
  maxBasePrice: UniSwapV3PosNftPrice;
  baseTokenAmount: UniSwapV3TokenAmount;
  quoteTokenAmount: UniSwapV3TokenAmount;
  tier: BigNumber;
  feeRate: SldDecPercent;
};
export type UniSwapV3TokenAmount = {
  token: TokenErc20;
  amount: SldDecimal;
};
export type UniSwapV3PosNftAmount = {
  amount0: UniSwapV3TokenAmount;
  amount1: UniSwapV3TokenAmount;
};

export type IzumiState = {
  sqrtPrice_96: BigNumber;
  currentPoint: BigNumber;
};
export type DexVersion = { dex: DexType; ver: number; net: Network };
export type DexFactory = DexVersion & { factory: string };

// ---------------------------------------------------------------------------------------------------------------------

export type StoneStrategy = {
  network: Network;
  address: string;
  allocation: SldDecPercent;
};
export type StoneStrategyInfo = {
  name: string;
  contract: string;
  network: Network;
  amount: SldDecimal;
  targetAllocation: SldDecPercent;
};
export enum StoneProposalType {
  AddStrategy,
  UpdatePortfolio,
}
export type StoneProposalAddStrategy = {
  type: StoneProposalType;
  address: string;
};
export type StoneProposalUpdatePortfolio = {
  type: StoneProposalType;
  strategies: {
    address: string;
    portfolio: SldDecPercent;
  }[];
};
export type StoneProposalDetail = {
  address: string;
  deadline: number;
  support: SldDecimal;
  oppose: SldDecimal;
  executed: boolean;
  executeTime: number;
  data: string;
  details: StoneProposalAddStrategy | StoneProposalUpdatePortfolio;
};
export type StoneUserInfo = {
  request: {
    round: BigNumber;
    stoneAmount: SldDecimal;
  };
  withdrawableEth: SldDecimal;
};
export type StoneApyPrimaryData = {
  round: number;
  time: number;
  price: SldDecimal;
};
export type StateAssetTypeForGNFT = 'nft' | 'erc20';
export type StonePoolInfo = {
  chainId: Network;
  chainIcon: string;
  lpAddress: string;
  lpName: string;
  lpUrl?: string;
  miningAddress: string;
  gNftAddress: string;
  protocolUrl: string;
  protocolIcon: string;
  protocolName: string;
  stakeType: StateAssetTypeForGNFT;
  displayCheckId?: string;
};
export type StonePoolHasStaked = {
  poolAddr: string;
  user: string;
  hasPosition: boolean;
};
export type StonePoolUserStartTime = {
  user: string;
  start: number;
};
export type StoneBridgeType = 'layerZero' | 'standard';
export type StoneBridgeCrossCache = {
  bridgeType: StoneBridgeType;
  srcNetwork: Network;
  disNetwork: Network;
  txHash: string;
  amount: DecimalJson;
};
export type StoneBridgeCrossCapacity = {
  max: SldDecimal;
  remain: SldDecimal;
};
export enum StoneColorType {
  Color1,
  Color2,
}
export enum StoneBgImgType {
  Stake,
  Short,
  Normal,
  Blank,
}
// ---------------------------------------------------------------------------------------------------------------------

export enum ShieldUnderlyingType {
  BTC = 'BTC',
  ETH = 'ETH',
}

export type ShieldTradePair = {
  indexUnderlying: ShieldUnderlyingType;
  quoteToken: TokenErc20;
};
export enum ShieldOptionType {
  Call = 'Call',
  Put = 'Put',
}
export enum ShieldOrderState {
  ACTIVE = 0,
  CLOSED = 1,
  TAKER_LIQUIDATED = 2,
  MAKER_LIQUIDATED = 3,
  POOL_LIQUIDATED = 4,
  MAKER_AGREEMENT_LIQUIDATED = 5,
  POOL_AGREEMENT_LIQUIDATED = 6,
  TAKER_MAKER_AGREEMENT_LIQUIDATED = 7,
  TAKER_POOL_AGREEMENT_LIQUIDATED = 8,
}
export type ShieldPoolAddress = {
  poolAddress: string;
  tokenAddress: string;
  network: Network;
};
export type ShieldPoolAddressList = {
  private: ShieldPoolAddress[];
  public: ShieldPoolAddress[];
  network: Network;
};
export type ShieldUserAccountInfo = {
  availableBalance: SldDecimal;
  lockedMargin: SldDecimal;
  orderTotalCount: number;
  activeOrderIDArr: BigNumber[];
};
export type ShieldTokenTradingVolume = {
  token: string;
  volume: SldDecimal;
};
export type ShieldTradingVolume = {
  network: Network;
  indexUnderlying: ShieldUnderlyingType;
  total: SldDecimal;
  tokens: ShieldTokenTradingVolume[];
};
export type ShieldOpenInterest = {
  network: Network;
  underlying: ShieldUnderlyingType;
  amount: SldDecimal;
  tokens: ShieldTokenOpenInterest[];
};
export type ShieldTokenOpenInterest = {
  network: Network;
  underlying: ShieldUnderlyingType;
  tokenAddr: string;
  amount: SldDecimal;
};

export type ShieldOrderFundingInfo = {
  init: SldDecimal;
  paid: SldDecimal;
  scheduleMigration: number;
  lastMigration: number;
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

export type ShieldOrderBase = {
  id: BigNumber;
  underlying: ShieldUnderlyingType;
  token: TokenErc20;
  optionType: ShieldOptionType;
  takerAddress: string;
  orderAmount: SldDecimal;
  openPrice: SldDecPrice;
  openTime: number;
  tradingFee: SldDecimal;
  fundingFeePaid: SldDecimal;
};
export type ShieldOrderInfo = {
  id: BigNumber;
  takerAddress: string;
  indexUnderlying: ShieldUnderlyingType;
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
export type ShieldOrderInfoRs = {
  network: Network;
  taker: string;
  orders: ShieldOrderInfo[];
};
export type ShieldHistoryOrderRs = {
  orders: ShieldOrderInfo[];
  taker: string;
  network: Network;
};

export type ShieldActiveOrderInfo = ShieldOrderBase & {
  migrationInfo: ShieldOrderMigration;
};
export type ShieldActiveOrderInfoRs = {
  network: Network;
  orders: ShieldActiveOrderInfo[];
};

export type ShieldClosedOrderInfo = ShieldOrderBase & {
  orderState: ShieldOrderState;
  tradingFee: SldDecimal;
  closePrice: SldDecPrice;
  closeTime: number;
  pnl: SldDecimal;
};
export type ShieldClosedOrderInfoRs = {
  orders: ShieldClosedOrderInfo[];
  taker: string;
  network: Network;
};

export type ShieldMakerOrderInfo = ShieldOrderBase & {
  indexInPool: BigNumber;
  maker: string;
  orderStatus: ShieldOrderState;
  fundingInfo: ShieldOrderFundingInfo;
  makerMarginAmount: SldDecimal;
  makerMaintenanceLocked: SldDecimal;
  markPrice?: SldDecPrice;
  pnl?: {
    positionLoss: SldDecimal;
    premium: SldDecimal;
    pnl: SldDecimal;
  };
  liquidationPrice?: SldDecPrice;
  couldLiquidation?: boolean;
};
export type ShieldMakerOrderInfoRs = {
  network: Network;
  maker: string;
  pool: string;
  orders: ShieldMakerOrderInfo[];
};

export type ShieldTokenSearchList = {
  tokens: TokenErc20[];
  network: Network;
};
export type ShieldPoolInfo = {
  poolAddress: string;
  network: Network;
  token: TokenErc20;
  available: SldDecimal;
  locked: SldDecimal;
  total: SldDecimal;
};
export type ShieldPoolMetaInfo = {
  indexUnderlying: ShieldUnderlyingType;
  token: TokenErc20;
};
export type ShieldTokenPoolInfo = ShieldPoolMetaInfo & {
  priInfo?: ShieldPoolInfo;
  pubInfo?: ShieldPoolInfo;
};
export type ShieldTokenPoolLiquidity = ShieldPoolMetaInfo & {
  privateLiquidity: SldDecimal;
  publicLiquidity: SldDecimal;
  volume?: SldDecimal;
};
export type ShieldTokenPoolLiquidityList = {
  liquidity: ShieldTokenPoolLiquidity[];
  indexUnderlying: ShieldUnderlyingType;
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
  network: Network;
  priPoolAddress: string;
  holder: string;
  token: TokenErc20;
  indexUnderlying: ShieldUnderlyingType;
  amount: SldDecimal;
  amountAvailable: SldDecimal;
  amountLocked: SldDecimal;
  marginFee: SldDecimal;
  isReject: boolean;
  isExclusive: boolean;
};
export type ShieldMakerPrivatePoolInfoRs = {
  pools: ShieldMakerPrivatePoolInfo[];
  maker: string;
  network: Network;
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
export type ShieldMakerPublicPoolShareRs = {
  pools: ShieldMakerPublicPoolShare[];
  network: Network;
  maker: string;
};
export type ShieldTradingFee = {
  token: TokenErc20;
  amount: SldDecimal;
};
export type ShieldTakerTradingFee = ShieldTradingFee & { taker: string };
export type ShieldBrokerReferralInfo = {
  takerAddress: string;
  invitationTime: number;
  orderCount: number;
  lastOpenTime: number;
  tradingFee: ShieldTakerTradingFee[];
};
export type ShieldBrokerReferralRs = {
  takers: ShieldBrokerReferralInfo[];
  pageOffset: number;
  broker: ShieldBrokerInfo;
  network: Network;
};
export type ShieldBrokerInfo = {
  brokerAddress: string;
  referralCount: number;
  firstReferralTime: number;
  lastReferralTime: number;
  referralOrderCount: number;
  tradingFee: ShieldBrokerTradingFee[];
};
export type ShieldBrokerTradingFee = ShieldTradingFee & { broker: string };
export type ShieldBrokerReward = {
  token: TokenErc20;
  amount: SldDecimal;
};
export type ShieldUnderlyingPrice = {
  underlying: ShieldUnderlyingType;
  network: Network;
  price: SldDecPrice;
};

// --------------------------------------------------------------------------

export type OmniTeamMemberMeta = {
  address: string;
  isBoost: boolean;
};
export type OmniStoneLocked = {
  primary: SldDecimal;
  boost: SldDecimal;
};

export type OmniTeamMember = OmniTeamMemberMeta & {
  primaryLocked: SldDecimal;
  boostLocked: SldDecimal;
};
