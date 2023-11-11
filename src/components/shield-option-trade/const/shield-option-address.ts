import { NET_BNB, NET_GOERLI } from '../../../constant/network';
import { NetworkConfPartialMap } from '../../../constant/network-type';

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

export const SHIELD_OPTION_TRADE_ADDRESS: NetworkConfPartialMap<ShieldOptionTradeConfigAddress> = {
  [NET_GOERLI]: {
    ethOracle: '0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e',
    btcOracle: '0xA39434A63A52E749F02807ae27335515BA4b07F7',
    optionTrade: '0xbAd413E3B2699B637861d04c7DA61e2ec72f27bf',
    liquidityManager: '0xb9452A85B1e041003b069e7b4bA4C3150a015Cb2',
    liquidityFactory: '0xff9B42e4a24484DeBd839EfbE8Db0aC97Cd6818b',
    underlyingETH: '0xF40954eA9ca79535E370f1eda5fE653Cb17e9fb7',
    underlyingBTC: '0x6B3A9e233D50eA58693C8D6Dc6d518ad2e4Bcd3B',
    broker: '0x97573fDa4C46e02d3610Bd2B8ED26f9E6afD7B7a',
  },
  [NET_BNB]: {
    ethOracle: '0x9ef1B8c0E4F7dc8bF5719Ea496883DC6401d5b2e',
    btcOracle: '0x264990fbd0A4796A3E3d8E37C4d5F87a3aCa5Ebf',
    optionTrade: '0x1e933E0957e6236E519e64CD13f967146Fcb4755',
    liquidityManager: '0x0CB5274a8Ff86b7b750933B09aba8B5eb3660977',
    liquidityFactory: '0x1ee04f7f223C620274b92a77c415eb10e1f47C9d',
    underlyingETH: '0xACe3062d01CAc4f2DC588d09D3cb09C71121C8c3',
    underlyingBTC: '0x5ff1c7Bde624eb694Ff6ab466DF5121Fc0c23949',
    broker: '0x787eCb23Cd23D52200fB5cb010d8f9D12c398cF9',
  },
};
