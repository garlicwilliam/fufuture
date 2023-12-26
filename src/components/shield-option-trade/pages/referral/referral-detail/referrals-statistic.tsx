import { BaseStateComponent } from '../../../../../state-manager/base-state-component';
import { P } from '../../../../../state-manager/page/page-state-parser';
import { bindStyleMerger } from '../../../../../util/string';
import styles from './referrals-statictis.module.less';
import { fontCss } from '../../../../i18n/font-switch';
import { ShieldBrokerInfo } from '../../../../../state-manager/state-types';
import { TokenAmountInline } from '../../../../common/content/token-amount-inline';
import { PendingHolder } from '../../../../common/progress/pending-holder';
import { HorizonItem } from '../../../../common/content/horizon-item';
import { I18n } from '../../../../i18n/i18n';
import { Visible } from '../../../../builtin/hidden';
import { SldEmpty } from '../../../../common/content/empty';

type IState = {
  isMobile: boolean;
};
type IProps = {
  broker?: ShieldBrokerInfo | null;
};

export class ReferralsStatistic extends BaseStateComponent<IProps, IState> {
  state: IState = {
    isMobile: P.Layout.IsMobile.get(),
  };

  componentDidMount() {
    this.registerIsMobile('isMobile');
  }

  componentWillUnmount() {
    this.destroyState();
  }

  render() {
    const mobileCss = this.state.isMobile ? styles.mobile : '';
    const styleMr = bindStyleMerger(mobileCss);

    if (this.props.broker === undefined) {
      return (
        <div className={styleMr(styles.statistic)}>
          <div className={styleMr(styles.title, fontCss.bold)}>
            <I18n id={'trade-referral-statistic'} />
          </div>

          <PendingHolder loading={true} height={20}></PendingHolder>
          <PendingHolder loading={true} height={20}></PendingHolder>
        </div>
      );
    }

    return (
      <div className={styleMr(styles.statistic)}>
        <div className={styleMr(styles.title, fontCss.bold)}>
          <I18n id={'trade-referral-statistic'} />
        </div>
        <div className={styleMr(styles.content)}>
          <div className={styleMr(styles.items)}>
            <HorizonItem
              label={<I18n id={'trade-referral-sta-total-referred-count'} />}
              align={this.state.isMobile ? 'justify' : 'left'}
              separator={this.state.isMobile ? undefined : ':'}
              labelClass={styles.label}
              valueClass={styles.value}
            >
              {this.props.broker?.referralCount || 0}
            </HorizonItem>

            <HorizonItem
              label={<I18n id={'trade-referral-sta-total-order-count'} />}
              align={this.state.isMobile ? 'justify' : 'left'}
              separator={this.state.isMobile ? undefined : ':'}
              labelClass={styles.label}
              valueClass={styles.value}
            >
              {this.props.broker?.referralOrderCount || 0}
            </HorizonItem>
          </div>

          <div className={styleMr(styles.subTitle)}>
            <I18n id={'trade-referral-sta-trading-fee-paid'} />
            {this.state.isMobile ? '' : ':'}
          </div>

          <Visible when={this.props.broker === null}>
            <div className={styleMr(styles.noData)}>
              <I18n id={'com-no-data'} />
            </div>
          </Visible>

          <Visible when={this.props.broker !== null}>
            <div className={styleMr(styles.fees)}>
              {(this.props.broker?.tradingFee || []).map(fee => {
                return (
                  <TokenAmountInline
                    key={fee.token.address}
                    amount={fee.amount}
                    token={fee.token.symbol}
                    numClassName={styles.value}
                    symClassName={styles.label}
                    short={true}
                  />
                );
              })}
            </div>
          </Visible>
        </div>
      </div>
    );
  }
}
