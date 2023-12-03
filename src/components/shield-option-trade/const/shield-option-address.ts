export const SHIELD_OPTION_TRADE_CONFIG_KEYS = [
  'ethOracle',
  'btcOracle',
  'optionTrade',
  'liquidityManager',
  'liquidityFactory',
  'underlyingETH',
  'underlyingBTC',
  'broker',
] as const;

export type ShieldOptionTradeConfigField = typeof SHIELD_OPTION_TRADE_CONFIG_KEYS[number];
export type ShieldOptionTradeConfigAddress = { [k in ShieldOptionTradeConfigField]: string };
export type ShieldOptionTradeConfigAbi = { [k in ShieldOptionTradeConfigField]: any[] };
