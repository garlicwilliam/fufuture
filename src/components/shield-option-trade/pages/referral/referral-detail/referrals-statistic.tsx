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

type IState = {
  isMobile: boolean;
};
type IProps = {
  broker?: ShieldBrokerInfo;
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

    if (!this.props.broker) {
      return (
        <div className={styleMr(styles.statistic)}>
          <PendingHolder loading={true} height={20}></PendingHolder>
        </div>
      );
    }

    return (
      <div className={styleMr(styles.statistic)}>
        <div className={styleMr(styles.title, fontCss.bold)}>Statistic</div>
        <div className={styleMr(styles.content)}>
          <div className={styleMr(styles.items)}>
            <HorizonItem
              label={<I18n id={'trade-referral-count'} />}
              align={'left'}
              separator={':'}
              labelClass={styles.label}
              valueClass={styles.value}
            >
              {this.props.broker.referralCount}
            </HorizonItem>

            <HorizonItem
              label={<I18n id={'trade-referral-total-order-count'} />}
              align={'left'}
              separator={':'}
              labelClass={styles.label}
              valueClass={styles.value}
            >
              {this.props.broker.referralOrderCount}
            </HorizonItem>
          </div>

          <div className={styleMr(styles.subTitle, fontCss.bold)}>Total Fees Takers Paid</div>
          <div className={styleMr(styles.fees)}>
            {this.props.broker.tradingFee.map(fee => {
              return (
                <>
                  <TokenAmountInline
                    amount={fee.amount}
                    token={fee.token.symbol}
                    numClassName={styles.value}
                    symClassName={styles.label}
                    short={true}
                  />
                </>
              );
            })}
          </div>
        </div>
      </div>
    );
  }
}
