import { BaseStateComponent } from '../../../../../../state-manager/base-state-component';
import { P } from '../../../../../../state-manager/page/page-state-parser';
import { bindStyleMerger } from '../../../../../../util/string';
import styles from './info.module.less';
import { BlockTitle } from '../../../common/block-title';
import { I18n } from '../../../../../i18n/i18n';
import { ItemsBox } from '../../../../../common/content/items-box';
import { HorizonItem } from '../../../../../common/content/horizon-item';
import {ShieldUnderlyingType, TokenErc20} from '../../../../../../state-manager/state-types';
import { TokenIndex } from '../../../common/token-index';
import { SldDecimal, SldDecPercent } from '../../../../../../util/decimal';
import { S } from '../../../../../../state-manager/contract/contract-state-parser';
import { TokenAmountInline } from '../../../../../common/content/token-amount-inline';

type IState = {
  isMobile: boolean;
  baseToken: ShieldUnderlyingType;
  quoteToken: TokenErc20 | null;
  riskFundBalance: SldDecimal;
  tradingFeeRate: SldDecPercent;
  maintenanceMarginRate: SldDecPercent;
};
type IProps = {};

export class TradeInfo extends BaseStateComponent<IProps, IState> {
  state: IState = {
    isMobile: P.Layout.IsMobile.get(),
    baseToken: P.Option.Trade.Pair.Base.get(),
    quoteToken: P.Option.Trade.Pair.Quote.get(),
    riskFundBalance: SldDecimal.ZERO,
    tradingFeeRate: SldDecPercent.ZERO,
    maintenanceMarginRate: SldDecPercent.ZERO,
  };

  componentDidMount() {
    this.registerIsMobile('isMobile');
    this.registerState('baseToken', P.Option.Trade.Pair.Base);
    this.registerState('quoteToken', P.Option.Trade.Pair.Quote);
    this.registerState('riskFundBalance', S.Option.Pool.RiskFundBalance);
    this.registerState('tradingFeeRate', S.Option.Params.Trading.FeeRate);
    this.registerState('maintenanceMarginRate', S.Option.Params.Funding.MMarginRate);
  }

  componentWillUnmount() {
    this.destroyState();
  }

  render() {
    const mobileCss = this.state.isMobile ? styles.mobile : '';
    const styleMr = bindStyleMerger(mobileCss);

    return (
      <div className={styleMr(styles.wrapperInfo)}>
        <BlockTitle title={<I18n id={'trade-info'} />} />

        <div className={styleMr(styles.infoCard)}>
          <ItemsBox gap={18}>
            <HorizonItem
              label={<I18n id={'trade-info-name-ticker-root'} />}
              align={'justify'}
              labelClass={styleMr(styles.label)}
              valueClass={styleMr(styles.value)}
            >
              <TokenIndex token={this.state.baseToken} />/{this.state.quoteToken?.symbol}
            </HorizonItem>

            <HorizonItem
              label={<I18n id={'trade-info-name-expiry-date'} />}
              align={'justify'}
              labelClass={styleMr(styles.label)}
              valueClass={styleMr(styles.value)}
            >
              <I18n id={'trade-info-expiry-date'} />
            </HorizonItem>

            <HorizonItem
              label={<I18n id={'trade-info-name-trade-fee-rate'} />}
              align={'justify'}
              labelClass={styleMr(styles.label)}
              valueClass={styleMr(styles.value)}
            >
              {this.state.tradingFeeRate.thousandthFormat({ removeZero: true })}‰
            </HorizonItem>

            <HorizonItem
              label={<I18n id={'trade-info-name-maintenance-margin-rate'} />}
              align={'justify'}
              labelClass={styleMr(styles.label)}
              valueClass={styleMr(styles.value)}
            >
              {this.state.maintenanceMarginRate.thousandthFormat({ removeZero: true })}‰
            </HorizonItem>

            <HorizonItem
              label={<I18n id={'trade-info-name-type'} />}
              align={'justify'}
              labelClass={styleMr(styles.label)}
              valueClass={styleMr(styles.value)}
            >
              <I18n id={'trade-info-type'} />
            </HorizonItem>

            <HorizonItem
              label={<I18n id={'trade-info-name-exercise'} />}
              align={'justify'}
              labelClass={styleMr(styles.label)}
              valueClass={styleMr(styles.value)}
            >
              <I18n id={'trade-info-exercise-manually'} />
            </HorizonItem>

            <HorizonItem
              label={<I18n id={'trade-info-name-insurance-fund'} />}
              align={'justify'}
              labelClass={styleMr(styles.label)}
              valueClass={styleMr(styles.value)}
            >
              <TokenAmountInline
                amount={this.state.riskFundBalance}
                token={this.state.quoteToken?.symbol || ''}
                short={true}
              />
            </HorizonItem>
          </ItemsBox>
        </div>
      </div>
    );
  }
}
