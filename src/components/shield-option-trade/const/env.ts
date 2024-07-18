import { NET_ARBITRUM, NET_BNB, NET_POLYGON, NET_OP_BNB, Network, NET_BASE } from '../../../constant/network';
import { ShieldUnderlyingType, TokenErc20 } from '../../../state-manager/state-types';
import { ShieldOptionTradeContracts, ShieldUnderlyingContracts } from './shield-option-address';
import fufutureLogoDark from '../../../assets/imgs/logo/fufuture/fufuture-1-dark.svg';
import fufutureLogo from '../../../assets/imgs/logo/fufuture/fufuture-1-light.svg';
import fufutureMobile from '../../../assets/imgs/logo/fufuture/fufuture-1.svg';

type ImgConf = {
  url: string;
  size: {
    w: number;
    h: number;
  };
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
        SubGraphUrl:
          'https://gateway-arbitrum.network.thegraph.com/api/c7536e819321ccf5b100d72663fe1e2f/subgraphs/id/5sxFk8gzWhRseZh39SbWpCt7UWM9gnGu14TLUdcesfpj',
        SubGraphOracleUrl:
          'https://gateway-arbitrum.network.thegraph.com/api/c7536e819321ccf5b100d72663fe1e2f/subgraphs/id/EA3FYEqMLXg3fATwr2yUdfgyvDz7g3FDssC5pN7Emyra',
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
        SubGraphUrl: 'https://api.studio.thegraph.com/query/77308/fufuture-arb/version/latest',
        SubGraphOracleUrl:
          'https://gateway-arbitrum.network.thegraph.com/api/c7536e819321ccf5b100d72663fe1e2f/subgraphs/id/9997gh5T5sEXs8YpxgRcV8MsyuGekZ7rd215yT27ERE8',
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
        ClosePriceNeedFix: false,
      },
      [NET_POLYGON]: {
        CurNetwork: NET_POLYGON,
        DefaultToken: {
          symbol: 'POT',
          address: '0x4Cbfcb5772A79E8f08A0D9eaE06279176392FbC3',
          decimal: 18,
          network: NET_POLYGON,
        },
        SubGraphUrl: 'https://api.studio.thegraph.com/query/77308/fufuture-matic/version/latest',
        SubGraphOracleUrl:
          'https://gateway-arbitrum.network.thegraph.com/api/4e42a7432f2828f4b4617ccd5d3f13b5/subgraphs/id/EA3FYEqMLXg3fATwr2yUdfgyvDz7g3FDssC5pN7Emyra',
        Addresses: {
          trade: {
            optionTrade: '0xe52adac17dcfc9be6975ce99c1637e38336c8931',
            liquidityManager: '0xb711ba37fa74b99e70c27e82def0b15a50ac7a9e',
            liquidityFactory: '0x95fd2771a95caf4a89e83d744c8f28e1d041da4e',
            broker: '0x502c7c64692b94c6c8f4d755878cc50e768566ce',
          },
          underlying: {
            ETH: '0x11d7b1dd7ba4f93f04a94d5301f5fe397495380e',
            BTC: '0x38e11092e0c935db3beed7929ee023acd86ae7c8',
          },
        },
        ClosePriceNeedFix: false,
      },
      [NET_OP_BNB]: {
        CurNetwork: NET_OP_BNB,
        DefaultToken: {
          symbol: 'USDT',
          address: '0x9e5aac1ba1a2e6aed6b32689dfcf62a509ca96f3',
          decimal: 18,
          network: NET_OP_BNB,
        },
        SubGraphUrl: 'https://api.subquery.network/sq/graphaccount/fufuture_opbnb_v1',
        SubGraphOracleUrl:
          'https://gateway-arbitrum.network.thegraph.com/api/4e42a7432f2828f4b4617ccd5d3f13b5/subgraphs/id/EA3FYEqMLXg3fATwr2yUdfgyvDz7g3FDssC5pN7Emyra',
        Addresses: {
          trade: {
            optionTrade: '0xa5a6B19aDC9e92C1be1720b0e2E2eC03Ac16845d',
            liquidityManager: '0x755773F8e288Ec4B4c5E9b823F29ebDf84CFA7e2',
            liquidityFactory: '0x689E95a1D62a2f616c1F540f7463aD4942c4A29D',
            broker: '0xd3B7E0117487682c6a099CbBB4910c6e209f7061',
          },
          underlying: {
            ETH: '0xFe99d4B8941E53a05759a9E545b7d21c58fBa66A',
            BTC: '0xa8862D494a32b2Def6276bbD00372fF50a7894a8',
          },
        },
        ClosePriceNeedFix: true,
      },
      [NET_BASE]: {
        CurNetwork: NET_BASE,
        DefaultToken: {
          symbol: 'USDC',
          address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
          decimal: 6,
          network: NET_BASE,
        },
        SubGraphUrl: 'https://api.studio.thegraph.com/query/77308/fufuture-base/v0.0.1',
        SubGraphOracleUrl:
          'https://gateway-arbitrum.network.thegraph.com/api/4e42a7432f2828f4b4617ccd5d3f13b5/subgraphs/id/EA3FYEqMLXg3fATwr2yUdfgyvDz7g3FDssC5pN7Emyra',
        Addresses: {
          trade: {
            optionTrade: '0xB78356C8030A76b355C752B76225e19892982fC7',
            liquidityManager: '0xB711ba37Fa74b99E70C27E82DEF0B15A50AC7A9e',
            liquidityFactory: '0x95Fd2771a95Caf4A89E83D744C8f28E1d041da4E',
            broker: '0x502c7c64692b94C6c8F4D755878cc50E768566cE',
          },
          underlying: {
            ETH: '0x0e1E15b77DE5924650dA76F9E1ae46B07F493AEc',
            BTC: '0x76739E2c513a68b70f6E6E8AD20CfCa485940659',
          },
        },
        ClosePriceNeedFix: true,
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

export const SLD_ENV_CONF: EnvConfig = env2[Env.Fufuture];
