import { NET_ARBITRUM, NET_BNB, Network } from '../../../constant/network';
import { ShieldUnderlyingType, TokenErc20 } from '../../../state-manager/state-types';
import { ShieldOptionTradeContracts, ShieldUnderlyingContracts } from './shield-option-address';
import fufutureLogoDark from '../../../assets/imgs/logo/fufuture/fufuture-1-dark.svg';
import fufutureLogo from '../../../assets/imgs/logo/fufuture/fufuture-1-light.svg';
import fufutureMobile from '../../../assets/imgs/logo/fufuture/fufuture-1.svg';

enum OracleType {
  ChainLink,
}

type ImgConf = {
  url: string;
  size: {
    w: number;
    h: number;
  };
};
export type OracleConf = {
  type: OracleType;
  address: string;
};
type EnvNetConfig = {
  CurNetwork: Network;
  DefaultToken: TokenErc20;
  SubGraphUrl: string;
  SubGraphOracleUrl: string;
  Addresses: {
    trade: ShieldOptionTradeContracts;
    underlying: ShieldUnderlyingContracts;
  };
  Oracles: { [k in ShieldUnderlyingType]?: OracleConf };
  ClosePriceNeedFix: boolean;
};
type EnvConfig = {
  Supports: { [n in Network]?: EnvNetConfig };
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
  FixDigits: {
    Open: { [u in ShieldUnderlyingType]: number };
  };
};

enum Env {
  Fufuture,
}

const env2: { [k in Env]: EnvConfig } = {
  [Env.Fufuture]: {
    Supports: {
      [NET_BNB]: {
        CurNetwork: NET_BNB,
        DefaultToken: {
          symbol: 'FU',
          address: '0x040f477b9bc3deab4a434631e1b98c193b7a1b5f',
          decimal: 6,
          network: NET_BNB,
        },
        SubGraphUrl: 'https://api.thegraph.com/subgraphs/name/garlicwilliam/fufutrue-history-bsc',
        SubGraphOracleUrl: 'https://api.thegraph.com/subgraphs/name/garlicwilliam/chainlink-price-bsc',
        Addresses: {
          trade: {
            optionTrade: '0x1e933E0957e6236E519e64CD13f967146Fcb4755',
            liquidityManager: '0x0CB5274a8Ff86b7b750933B09aba8B5eb3660977',
            liquidityFactory: '0x1ee04f7f223C620274b92a77c415eb10e1f47C9d',
            broker: '0x787eCb23Cd23D52200fB5cb010d8f9D12c398cF9',
          },
          underlying: {
            ETH: '0xACe3062d01CAc4f2DC588d09D3cb09C71121C8c3',
            BTC: '0x5ff1c7Bde624eb694Ff6ab466DF5121Fc0c23949',
          },
        },
        Oracles: {
          ETH: {
            type: OracleType.ChainLink,
            address: '0x9ef1B8c0E4F7dc8bF5719Ea496883DC6401d5b2e',
          },
          BTC: {
            type: OracleType.ChainLink,
            address: '0x264990fbd0A4796A3E3d8E37C4d5F87a3aCa5Ebf',
          },
        },
        ClosePriceNeedFix: true,
      },
      [NET_ARBITRUM]: {
        CurNetwork: NET_ARBITRUM,
        DefaultToken: {
          symbol: 'POT',
          address: '0xC981b2E422B7E096a25A8e229e4C0b1e8606a01F',
          decimal: 18,
          network: NET_ARBITRUM,
        },
        SubGraphUrl: 'https://api.thegraph.com/subgraphs/name/garlicwilliam/fufuture-history-arbitrum',
        SubGraphOracleUrl: 'https://api.thegraph.com/subgraphs/name/garlicwilliam/chainlink-price-arb',
        Addresses: {
          trade: {
            optionTrade: '0x1e933E0957e6236E519e64CD13f967146Fcb4755',
            liquidityManager: '0x0CB5274a8Ff86b7b750933B09aba8B5eb3660977',
            liquidityFactory: '0x1ee04f7f223C620274b92a77c415eb10e1f47C9d',
            broker: '0x787eCb23Cd23D52200fB5cb010d8f9D12c398cF9',
          },
          underlying: {
            ETH: '0xACe3062d01CAc4f2DC588d09D3cb09C71121C8c3',
            BTC: '0x5ff1c7Bde624eb694Ff6ab466DF5121Fc0c23949',
          },
        },
        Oracles: {
          ETH: {
            type: OracleType.ChainLink,
            address: '0x639Fe6ab55C921f74e7fac1ee960C0B6293ba612',
          },
          BTC: {
            type: OracleType.ChainLink,
            address: '0x6ce185860a4963106506C203335A2910413708e9',
          },
        },
        ClosePriceNeedFix: false,
      },
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
    FixDigits: {
      Open: {
        BTC: 8,
        ETH: 8,
      },
    },
  },
};

export const SLD_ENV_CONF = env2[Env.Fufuture];
