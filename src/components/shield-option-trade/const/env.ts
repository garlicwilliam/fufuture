import { NET_BNB, Network } from '../../../constant/network';
import { ShieldTradePair, ShieldUnderlyingType } from '../../../state-manager/state-types';
import { ShieldOptionTradeConfigAddress } from './shield-option-address';
import fufutureLogoDark from '../../../assets/imgs/logo/fufuture/fufuture-1-dark.svg';
import fufutureLogo from '../../../assets/imgs/logo/fufuture/fufuture-1-light.svg';
import fufutureMobile from '../../../assets/imgs/logo/fufuture/fufuture-1.svg';

type ImgConf = { url: string; size: { w: number; h: number } };
type EnvConfig = {
  CurNetwork: Network;
  DefaultPair: ShieldTradePair;
  SubGraphUrl: string;
  Addresses: ShieldOptionTradeConfigAddress;
  TokenIcon: string;
  Logo: {
    Web: ImgConf;
    WebDark: ImgConf;
    Mobile: ImgConf;
  };
  Brand: {
    Domain: string;
    Project: string;
  };
};

enum Env {
  Fufuture,
}

const env: { [k in Env]: EnvConfig } = {
  [Env.Fufuture]: {
    CurNetwork: NET_BNB,
    DefaultPair: {
      indexUnderlying: ShieldUnderlyingType.BTC,
      quoteToken: {
        symbol: 'POT',
        address: '0x5150404c61706b6874cF43DC34c9CA88DaA5F9e3',
        decimal: 18,
        network: NET_BNB,
      },
    },
    SubGraphUrl: 'https://api.thegraph.com/subgraphs/name/garlicwilliam/fufutrue-history-bsc',
    Addresses: {
      ethOracle: '0x9ef1B8c0E4F7dc8bF5719Ea496883DC6401d5b2e',
      btcOracle: '0x264990fbd0A4796A3E3d8E37C4d5F87a3aCa5Ebf',
      optionTrade: '0x1e933E0957e6236E519e64CD13f967146Fcb4755',
      liquidityManager: '0x0CB5274a8Ff86b7b750933B09aba8B5eb3660977',
      liquidityFactory: '0x1ee04f7f223C620274b92a77c415eb10e1f47C9d',
      underlyingETH: '0xACe3062d01CAc4f2DC588d09D3cb09C71121C8c3',
      underlyingBTC: '0x5ff1c7Bde624eb694Ff6ab466DF5121Fc0c23949',
      broker: '0x787eCb23Cd23D52200fB5cb010d8f9D12c398cF9',
    },
    TokenIcon: 'https://static.fufuture.io/token-icon.json',
    Logo: {
      Web: { url: fufutureLogo, size: { w: 370, h: 102 } },
      WebDark: { url: fufutureLogoDark, size: { w: 370, h: 102 } },
      Mobile: { url: fufutureMobile, size: { w: 95, h: 102 } },
    },
    Brand: {
      Domain: 'fufuture.io',
      Project: 'Fufuture',
    },
  },
};

export const SLD_ENV_CONF = env[Env.Fufuture];
