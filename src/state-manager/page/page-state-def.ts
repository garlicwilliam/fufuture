import {
  PriceDuration,
  ShieldMakerOrderInfo,
  ShieldMakerPrivatePoolInfo,
  ShieldMakerPublicPoolShare,
  ShieldOptionType,
  ShieldOrderInfo,
  ShieldTradePair,
  ShieldUnderlyingType,
  TokenErc20,
  TradeChartType,
} from '../state-types';
import { confirmIsMobile, Size } from '../../util/layout';
import { EMPTY_ADDRESS, Language } from '../../constant';
import { getLanguage } from '../../locale/i18n';
import { SldDecimal } from '../../util/decimal';

export const PAGE_STATE = {
  Lang: {
    _default: getLanguage() as Language,
  },
  Layout: {
    WindowSize: {
      _default: { w: window.innerWidth, h: window.innerHeight } as Size,
    },
    IsMobile: {
      _default: confirmIsMobile(),
    },
    IsNarrow: {
      _default: false,
    },
    IsMini: {
      _default: false,
    },
    IsShowWalletModal: {
      _default: false as boolean,
    },
    isLocalTest: {
      _default: window.location?.hostname === 'localhost' || window.location?.hostname === '127.0.0.1',
    },
  },
  Wallet: {
    Agree: {
      _default: false,
    },
  },
  Option: {
    Trade: {
      Select: {
        IndexUnderlying: {
          _default: ShieldUnderlyingType.BTC as ShieldUnderlyingType,
        },
        Extend: {
          _default: false as boolean,
        },
        SearchKey: {
          _default: '' as string,
        },
      },
      Pair: {
        Base: {
          _default: ShieldUnderlyingType.BTC as ShieldUnderlyingType,
        },
        Quote: {
          _default: null as TokenErc20 | null,
        },
      },
      SpecifiedMaker: {
        _default: EMPTY_ADDRESS as string,
      },
      Market: {
        ChartType: {
          _default: 'PRICE' as TradeChartType,
        },
        ChartDuration: {
          KLine: {
            _default: 3600 as number,
          },
          Price: {
            _default: 'DAY' as PriceDuration,
          },
        },
      },
      Open: {
        OptionType: {
          _default: ShieldOptionType.Call as ShieldOptionType,
        },
        Amount: {
          _default: null as SldDecimal | null,
        },
      },
      Calculator: {
        OpenAmount: {
          _default: null as SldDecimal | null,
        },
        PhaseHold: {
          _default: null as SldDecimal | null,
        },
      },
      OrderList: {
        Close: {
          Order: {
            _default: null as ShieldOrderInfo | null,
          },
          Visible: {
            _default: false as boolean,
          },
        }, // close modal
        ActiveList: {
          _default: [] as ShieldOrderInfo[],
        },
      },
      OrderHistory: {
        PageSize: {
          _default: 10 as number,
        },
        PageIndex: {
          _default: 0 as number,
        },
      },
      ShareOrder: {
        Visible: {
          _default: false as boolean,
        },
        CurOrder: {
          _default: null as ShieldOrderInfo | null,
        },
      },
    },
    Pools: {
      Private: {
        Liquidity: {
          Setting: {
            IsVisible: {
              _default: false as boolean,
            },
            Current: {
              _default: null as ShieldMakerPrivatePoolInfo | null,
            },
          },
          Add: {
            IsVisible: {
              _default: false as boolean,
            },
            CurrentPair: {
              _default: { indexUnderlying: ShieldUnderlyingType.ETH } as Partial<ShieldTradePair>,
            },
          },
          Withdraw: {
            IsVisible: {
              _default: false as boolean,
            },
            Current: {
              _default: null as ShieldMakerPrivatePoolInfo | null,
            },
          },
        },
        LockedDetails: {
          CurPool: {
            _default: null as ShieldMakerPrivatePoolInfo | null,
          },
          AddMargin: {
            IsVisible: {
              _default: false as boolean,
            },
            CurOrder: {
              _default: null as ShieldMakerOrderInfo | null,
            },
          },
        },
      },
      Public: {
        Liquidity: {
          Add: {
            CurrentToken: {
              _default: undefined as TokenErc20 | undefined,
            },
          },
          Withdraw: {
            IsVisible: {
              _default: false as boolean,
            },
            Current: {
              _default: null as ShieldMakerPublicPoolShare | null,
            },
            Amount: {
              _default: null as SldDecimal | null,
            },
          },
        },
      },
    },
    Token: {
      Search: {
        _default: undefined as string | undefined,
      },
    },
  },
};
