import { ShieldUnderlyingType } from '../../../state-manager/state-types';

export const SHIELD_OPTION_TRADE_CONFIG_KEYS = [
  'optionTrade',
  'liquidityManager',
  'liquidityFactory',
  'broker',
] as const;

export type ShieldOptionTradeField = typeof SHIELD_OPTION_TRADE_CONFIG_KEYS[number];
export type ShieldOptionTradeContracts = { [k in ShieldOptionTradeField]: string };
export type ShieldOptionTradeABIs = { [k in ShieldOptionTradeField]: any[] };
export type ShieldUnderlyingContracts = { [k in ShieldUnderlyingType]?: string };
