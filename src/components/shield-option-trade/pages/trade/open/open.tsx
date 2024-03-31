import { BaseStateComponent } from '../../../../../state-manager/base-state-component';
import { P } from '../../../../../state-manager/page/page-state-parser';
import { bindStyleMerger } from '../../../../../util/string';
import styles from './open.module.less';
import { SldDecimal, SldDecPrice } from '../../../../../util/decimal';
import { S } from '../../../../../state-manager/contract/contract-state-parser';
import { BuySwitch } from './buy-switch';
import { OpenAmount } from './open-amount';
import { ItemsBox } from '../../../../common/content/items-box';
import { HorizonItem } from '../../../../common/content/horizon-item';
import { I18n } from '../../../../i18n/i18n';
import { TokenAmountInline } from '../../../../common/content/token-amount-inline';
import {
  ShieldOptionType,
  ShieldOrderOpenResult,
  ShieldUnderlyingPrice,
  ShieldUnderlyingType,
  TokenErc20,
} from '../../../../../state-manager/state-types';
import { Calc } from './popup/calc';
import { OpenSetting } from './popup/setting';
import { TokenIndex } from '../../common/token-index';
import { PendingHolder } from '../../../../common/progress/pending-holder';
import { OpenConfirm } from './popup/open-confirm';
import { SLD_ENV_CONF } from '../../../const/env';

type IState = {
  isMobile: boolean;
  baseToken: ShieldUnderlyingType;
  curPrice: ShieldUnderlyingPrice | undefined;
  curOptionType: ShieldOptionType;
  quoteToken: TokenErc20 | null;

  openAmount: SldDecimal | null;
  openFundingFee: ShieldOrderOpenResult | null;
  openFundingFeePending: boolean;
  openTradingFee: SldDecimal;
  inputError: boolean;
};
type IProps = {
  className?: string;
};

export class OpenLabel extends BaseStateComponent<IProps, IState> {
  state: IState = {
    isMobile: P.Layout.IsMobile.get(),
    baseToken: P.Option.Trade.Pair.Base.get(),
    curPrice: undefined,
    curOptionType: P.Option.Trade.Open.OptionType.get(),
    quoteToken: P.Option.Trade.Pair.Quote.get(),

    openAmount: SldDecimal.ZERO,
    openFundingFee: null,
    openFundingFeePending: false,
    openTradingFee: SldDecimal.ZERO,
    inputError: false,
  };

  componentDidMount() {
    this.registerIsMobile('isMobile');
    this.registerState('baseToken', P.Option.Trade.Pair.Base);
    this.registerState('curPrice', S.Option.Oracle.CurBaseToken);
    this.registerState('quoteToken', P.Option.Trade.Pair.Quote);
    this.registerState('curOptionType', P.Option.Trade.Open.OptionType);

    this.registerState('openAmount', P.Option.Trade.Open.Amount);
    this.registerState('openFundingFee', S.Option.Order.Open.FundingFee);
    this.registerStatePending('openFundingFeePending', S.Option.Order.Open.FundingFee);
    this.registerState('openTradingFee', S.Option.Order.Open.TradingFee);
  }

  componentWillUnmount() {
    this.destroyState();
  }

  onTypeChange(type: ShieldOptionType) {
    P.Option.Trade.Open.OptionType.set(type);
  }

  render() {
    const mobileCss = this.state.isMobile ? styles.mobile : '';
    const styleMr = bindStyleMerger(mobileCss);

    return (
      <div className={styleMr(styles.wrapperOpen, this.props.className)}>
        <div className={styleMr(styles.price)}>
          <div className={styleMr(styles.text)}>
            <TokenIndex token={this.state.baseToken} />
            :&nbsp;
            <PendingHolder loading={!this.state.curPrice} width={80}>
              <span className={styleMr(styles.highlight)}>{this.state.curPrice?.price.format({ fix: 2 })}</span>
            </PendingHolder>
          </div>
          <div className={styleMr(styles.setting)}>
            <OpenSetting />
          </div>
        </div>

        <BuySwitch typeChange={this.onTypeChange.bind(this)} />

        <OpenAmount errorChange={isError => this.updateState({ inputError: isError })} />

        <ItemsBox gap={16}>
          <HorizonItem
            label={<I18n id={'trade-fees-trading'} />}
            align={'justify'}
            labelClass={styleMr(styles.label)}
            valueClass={styleMr(styles.value)}
          >
            <TokenAmountInline
              amount={this.state.openTradingFee}
              token={this.state.quoteToken?.symbol || ''}
              symClassName={styleMr(styles.label)}
              short={true}
              rmZero={true}
              fix={SLD_ENV_CONF.FixDigits.Open[this.state.baseToken]}
              precision={SLD_ENV_CONF.FixDigits.Open[this.state.baseToken]}
            />
          </HorizonItem>

          <HorizonItem
            label={
              <div className={styleMr(styles.feesLabel)}>
                <Calc />
              </div>
            }
            align={'justify'}
            labelClass={styleMr(styles.label)}
            valueClass={styleMr(styles.value)}
          >
            <PendingHolder loading={this.state.openFundingFeePending} useIcon={true}>
              <TokenAmountInline
                amount={this.state.openFundingFee ? this.state.openFundingFee.phase0Fee : SldDecimal.ZERO}
                token={this.state.quoteToken?.symbol || ''}
                symClassName={styleMr(styles.label)}
                short={true}
                rmZero={true}
                fix={SLD_ENV_CONF.FixDigits.Open[this.state.baseToken]}
                precision={SLD_ENV_CONF.FixDigits.Open[this.state.baseToken]}
              />
            </PendingHolder>
          </HorizonItem>
        </ItemsBox>

        <OpenConfirm
          disabled={this.state.openFundingFee?.isLackLiquidity}
          isLack={this.state.openFundingFee?.isLackLiquidity}
        />
      </div>
    );
  }
}
