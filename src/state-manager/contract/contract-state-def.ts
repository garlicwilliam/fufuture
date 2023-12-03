import { walletState } from '../wallet/wallet-state';
import { isObservable, NEVER, Observable, of } from 'rxjs';
import { ContractState, ContractStateTree, StateReference } from '../interface';
import _ from 'lodash';
import { filter, switchMap } from 'rxjs/operators';
import { P } from '../page/page-state-parser';
import { MappedState } from './contract-state-def.util-map';
import { erc20ApprovedAmountGetter, erc20UserBalanceGetter } from './contract-getter-sim-erc20';
import { linkAnswerGetter } from './contract-getter-sim-link';
import { shieldOptionTradeContracts } from '../../components/shield-option-trade/contract/shield-option-trade-contract';
import {
  brokerAllRewardsGetter,
  calculatorFundingFeeGetter,
  inviterGetter,
  makerAddLiquidityApprovedAmountGetter,
  makerPriPoolApprovedGetter,
  makerPriPoolDetailsGetter,
  makerPriPoolInfoByPairGetter,
  makerPriPoolInfoListGetter,
  makerPubPoolInfoListGetter,
  makerPubPoolWithdrawReceiveGetter,
  orderFundingFeeGetter,
  orderTradingFeeGetter,
  paramBrokerPortionGetter,
  paramFundingPeriodGetter,
  paramFundingRateMatrixGetter,
  paramFundingTimesGetter,
  paramMMarginRateGetter,
  paramTradingFeeRateGetter,
  poolLiquidityListGetter,
  poolTokenErc20ListGetter,
  riskFundBalanceGetter,
  searchTokenGetter,
  tokenPoolInfoGetter0,
  userAccountInfoGetter,
  userActiveOrderListGetter,
  userOpenMaxAmount,
} from './contract-getter-cpx-shield';

class StateHolder implements StateReference {
  private treeRoot: ContractStateTree<any> | null = null;

  constructor(private path: string | Observable<string>) {}

  public getRef(): Observable<any> {
    return this.curRefState().pipe(
      switchMap((state: ContractState<any>) => {
        return state.watch() as Observable<any>;
      })
    );
  }

  public watchCurState(): Observable<ContractState<any>> {
    return this.curRefState().pipe(filter(Boolean));
  }

  private curPath(): Observable<string> {
    return isObservable(this.path) ? this.path : of(this.path);
  }

  private curRefState(): Observable<ContractState<any>> {
    return this.curPath().pipe(
      switchMap((path: string) => {
        if (this.treeRoot && _.has(this.treeRoot, path)) {
          const curState = _.get(this.treeRoot, path) as ContractState<any>;
          return of(curState);
        } else {
          console.warn('state reference can not get a instance.', this.treeRoot, this.path);
          return NEVER;
        }
      })
    );
  }

  setRoot(root: ContractStateTree<any>) {
    this.treeRoot = root;
    return this;
  }
}

function Ref(path: string | Observable<string>): StateReference {
  return new StateHolder(path);
}

export const CONTRACT_STATE = {
  Option: {
    Market: {
      Select: {
        List: {
          _depend: [shieldOptionTradeContracts.CONTRACTS.liquidityManager, P.Option.Trade.Select.IndexUnderlying],
          _getter: poolLiquidityListGetter,
        },
      },
    },
    Oracle: {
      ETH: {
        _depend: [shieldOptionTradeContracts.CONTRACTS.ethOracle],
        _getter: linkAnswerGetter,
      },
      BTC: {
        _depend: [shieldOptionTradeContracts.CONTRACTS.btcOracle],
        _getter: linkAnswerGetter,
      },
      CurBaseToken: {
        _depend: [MappedState.OPTION_CUR_ORACLE],
        _getter: linkAnswerGetter,
      },
    },
    User: {
      Account: {
        Info: {
          _depend: [shieldOptionTradeContracts.CONTRACTS.optionTrade, walletState.USER_ADDR, P.Option.Trade.Pair.Quote],
          _getter: userAccountInfoGetter,
        },
      },
      Deposit: {
        Max: {
          _depend: [P.Option.Trade.Pair.Quote, walletState.USER_ADDR],
          _getter: erc20UserBalanceGetter,
        },
        Approved: {
          _depend: [
            walletState.USER_ADDR,
            P.Option.Trade.Pair.Quote,
            shieldOptionTradeContracts.CONTRACTS_ADDRESS.optionTrade,
          ],
          _getter: erc20ApprovedAmountGetter,
        },
      },
    },
    Pool: {
      Info: {
        _depend: [
          shieldOptionTradeContracts.CONTRACTS.liquidityManager,
          P.Option.Trade.Pair.Base,
          P.Option.Trade.Pair.Quote,
        ],
        _getter: tokenPoolInfoGetter0,
      },
      RiskFundBalance: {
        _depend: [shieldOptionTradeContracts.CONTRACTS.optionTrade, P.Option.Trade.Pair.Quote],
        _getter: riskFundBalanceGetter,
      },
      Maker: {
        Liquidity: {
          Private: {
            List: {
              _depend: [shieldOptionTradeContracts.CONTRACTS.liquidityManager, walletState.USER_ADDR],
              _getter: makerPriPoolInfoListGetter,
            },
            Add: {
              Current: {
                _depend: [
                  shieldOptionTradeContracts.CONTRACTS.liquidityManager,
                  walletState.USER_ADDR,
                  P.Option.Pools.Private.Liquidity.Add.CurrentPair,
                ],
                _getter: makerPriPoolInfoByPairGetter,
              },
              Approved: {
                _depend: [
                  P.Option.Pools.Private.Liquidity.Add.CurrentPair,
                  walletState.USER_ADDR,
                  shieldOptionTradeContracts.CONTRACTS_ADDRESS.liquidityManager,
                ],
                _getter: makerAddLiquidityApprovedAmountGetter,
              },
            },
          },
          Public: {
            List: {
              _depend: [shieldOptionTradeContracts.CONTRACTS.liquidityManager, walletState.USER_ADDR],
              _getter: makerPubPoolInfoListGetter,
            },
            Add: {
              Approved: {
                _depend: [
                  P.Option.Pools.Public.Liquidity.Add.CurrentToken,
                  walletState.USER_ADDR,
                  shieldOptionTradeContracts.CONTRACTS.liquidityManager,
                ],
                _getter: makerAddLiquidityApprovedAmountGetter,
              },
            },
            Withdraw: {
              Receive: {
                _depend: [
                  P.Option.Pools.Public.Liquidity.Withdraw.Current,
                  P.Option.Pools.Public.Liquidity.Withdraw.Amount,
                  walletState.watchSigner(),
                ],
                _getter: makerPubPoolWithdrawReceiveGetter,
              },
            },
          },
        },
        LockDetail: {
          _depend: [
            shieldOptionTradeContracts.CONTRACTS.optionTrade,
            P.Option.Pools.Private.LockedDetails.CurPool,
            walletState.watchWeb3Provider(),
          ],
          _getter: makerPriPoolDetailsGetter,
        },
        AddMarginApproved: {
          _depend: [
            P.Option.Pools.Private.LockedDetails.CurPool,
            walletState.USER_ADDR,
            walletState.watchWeb3Provider(),
          ],
          _getter: makerPriPoolApprovedGetter,
        },
      },
    },
    Token: {
      SelectList: {
        _depend: [shieldOptionTradeContracts.CONTRACTS.liquidityManager],
        _getter: poolTokenErc20ListGetter,
      },
      Search: {
        _depend: [P.Option.Token.Search, walletState.NETWORK, walletState.watchSigner()],
        _getter: searchTokenGetter,
      },
    },
    Order: {
      ActiveList: {
        _depend: [shieldOptionTradeContracts.CONTRACTS.optionTrade, walletState.USER_ADDR, P.Option.Trade.Pair.Quote],
        _getter: userActiveOrderListGetter,
      },
      Open: {
        Max: {
          _depend: [
            shieldOptionTradeContracts.CONTRACTS.optionTrade,
            P.Option.Trade.Pair.Base,
            P.Option.Trade.Pair.Quote,
            P.Option.Trade.Open.OptionType,
          ],
          _getter: userOpenMaxAmount,
        },
        FundingFee: {
          _depend: [
            shieldOptionTradeContracts.CONTRACTS.optionTrade,
            P.Option.Trade.Pair.Quote,
            P.Option.Trade.SpecifiedMaker,
            P.Option.Trade.Pair.Base,
            P.Option.Trade.Open.OptionType,
            P.Option.Trade.Open.Amount,
          ],
          _getter: orderFundingFeeGetter,
        },
        TradingFee: {
          _depend: [
            shieldOptionTradeContracts.watchUnderlyingAddress(P.Option.Trade.Pair.Base.watch()),
            P.Option.Trade.Open.Amount,
            Ref('Option.Oracle.CurBaseToken'),
            walletState.watchSigner(),
          ],
          _getter: orderTradingFeeGetter,
        },
      },
      Calc: {
        FundingFee: {
          _depend: [
            shieldOptionTradeContracts.CONTRACTS.optionTrade,
            P.Option.Trade.Pair.Quote,
            P.Option.Trade.SpecifiedMaker,
            P.Option.Trade.Pair.Base,
            P.Option.Trade.Open.OptionType,
            P.Option.Trade.Calculator.OpenAmount,
          ],
          _getter: calculatorFundingFeeGetter,
        },
      },
    },
    Params: {
      Funding: {
        Period: {
          _depend: [shieldOptionTradeContracts.CONTRACTS.optionTrade],
          _getter: paramFundingPeriodGetter,
        },
        DailyTimes: {
          _depend: [shieldOptionTradeContracts.CONTRACTS.optionTrade],
          _getter: paramFundingTimesGetter,
        },
        MMarginRate: {
          _depend: [
            shieldOptionTradeContracts.watchUnderlyingAddress(P.Option.Trade.Pair.Base.watch()),
            walletState.watchSigner(),
          ],
          _getter: paramMMarginRateGetter,
        },
        FundRateMatrix: {
          _depend: [shieldOptionTradeContracts.CONTRACTS.optionTrade],
          _getter: paramFundingRateMatrixGetter,
        },
      },
      Trading: {
        FeeRate: {
          _depend: [
            shieldOptionTradeContracts.watchUnderlyingAddress(P.Option.Trade.Pair.Base.watch()),
            walletState.watchSigner(),
          ],
          _getter: paramTradingFeeRateGetter,
        },
      },
      Broker: {
        Portion: {
          _depend: [shieldOptionTradeContracts.CONTRACTS.optionTrade],
          _getter: paramBrokerPortionGetter,
        },
      },
    },
    Broker: {
      MyRewards: {
        _depend: [
          shieldOptionTradeContracts.CONTRACTS.liquidityManager,
          shieldOptionTradeContracts.CONTRACTS.broker,
          walletState.USER_ADDR,
        ],
        _getter: brokerAllRewardsGetter,
      },
      MyInviter: {
        _depend: [shieldOptionTradeContracts.CONTRACTS.broker, walletState.USER_ADDR],
        _getter: inviterGetter,
      },
    },
  },
};
