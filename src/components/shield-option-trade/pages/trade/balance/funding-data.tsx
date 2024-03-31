import { BaseStateComponent } from '../../../../../state-manager/base-state-component';
import { P } from '../../../../../state-manager/page/page-state-parser';
import { bindStyleMerger } from '../../../../../util/string';
import styles from './funding-data.module.less';
import { HorizonItem } from '../../../../common/content/horizon-item';
import { I18n } from '../../../../i18n/i18n';
import { TokenAmountInline } from '../../../../common/content/token-amount-inline';
import {
  ShieldOrderInfo,
  ShieldUnderlyingType,
  ShieldUserAccountInfo,
  TokenErc20,
} from '../../../../../state-manager/state-types';
import { SldDecimal } from '../../../../../util/decimal';
import { PendingHolder } from '../../../../common/progress/pending-holder';
import { S } from '../../../../../state-manager/contract/contract-state-parser';
import { displayDuration } from '../../../../../util/time';
import { combineLatest, interval, Observable } from 'rxjs';
import { filter, map, startWith } from 'rxjs/operators';
import { BigNumber } from 'ethers';
import { SldTips } from '../../../../common/tips/tips';
import { fontCss } from '../../../../i18n/font-switch';
import { isSameToken } from '../../../../../util/token';
import { SLD_ENV_CONF } from '../../../const/env';

type IState = {
  isMobile: boolean;
  quoteToken: TokenErc20 | null;
  underlying: ShieldUnderlyingType;
  userAccount: ShieldUserAccountInfo | undefined;
  activeOrderList: ShieldOrderInfo[];
  nextFund: SldDecimal;
  countDown: string;
};
type IProps = {};

export class FundingData extends BaseStateComponent<IProps, IState> {
  state: IState = {
    isMobile: P.Layout.IsMobile.get(),
    quoteToken: P.Option.Trade.Pair.Quote.get(),
    underlying: P.Option.Trade.Pair.Base.get(),
    userAccount: undefined,
    activeOrderList: [],
    nextFund: SldDecimal.ZERO,
    countDown: '',
  };

  componentDidMount() {
    this.registerIsMobile('isMobile');
    this.registerState('quoteToken', P.Option.Trade.Pair.Quote);
    this.registerState('underlying', P.Option.Trade.Pair.Base);
    this.registerState('userAccount', S.Option.User.Account.Info);
    this.registerObservable('countDown', this.mergeFundingCountdown());
    this.registerObservable('nextFund', this.mergeNextFund());
    this.registerState('activeOrderList', P.Option.Trade.OrderList.ActiveList);
  }

  componentWillUnmount() {
    this.destroyState();
  }

  mergeFundingCountdown(): Observable<string> {
    const period$ = S.Option.Params.Funding.Period.watch();
    const now$ = interval(1000).pipe(
      startWith(0),
      map(() => Math.ceil(new Date().getTime() / 1000))
    );

    return combineLatest([period$, now$]).pipe(
      map(([period, now]) => {
        const next = this.computeNextFundTime(period, now);
        const delta = next - now;
        const deltaTime = displayDuration(delta);

        return deltaTime.hours + ':' + deltaTime.minutes + ':' + deltaTime.seconds;
      })
    );
  }

  mergeNextFund(): Observable<SldDecimal> {
    const orders$ = P.Option.Trade.OrderList.ActiveList.watch();
    const token$: Observable<TokenErc20> = P.Option.Trade.Pair.Quote.watch().pipe(filter(Boolean));

    return combineLatest([orders$, token$]).pipe(
      map(([orders, token]: [ShieldOrderInfo[], TokenErc20]) => {
        if (orders.length === 0) {
          return SldDecimal.ZERO;
        }

        const nextFund: SldDecimal = orders
          .filter((order: ShieldOrderInfo) => isSameToken(order.token, token))
          .map(order => order.phaseInfo!.laterPhases[0].fundingFee || SldDecimal.ZERO)
          .reduce((acc, cur) => {
            return acc.add(cur);
          }, SldDecimal.ZERO);

        return nextFund;
      })
    );
  }

  private computeNextFundTime(period: BigNumber, now: number): number {
    const periodSec = period.toNumber();
    const remain = now % (24 * 3600);
    const todayStart = now - remain;

    let fundTime = todayStart;

    do {
      fundTime += periodSec;
    } while (fundTime <= now);

    return fundTime;
  }

  render() {
    const mobileCss = this.state.isMobile ? styles.mobile : '';
    const styleMr = bindStyleMerger(mobileCss);

    return (
      <div className={styleMr(styles.wrapperData)}>
        <HorizonItem
          label={
            <div className={styleMr(styles.mmNameLabel)}>
              <I18n id={'trade-user-maintenance-margin'} />
              &nbsp;
              <SldTips
                wPadding={16}
                contentClassName={styleMr(styles.mmTipContent)}
                content={
                  <div className={styleMr(styles.mmTips)}>
                    <div className={styleMr(styles.mmTitle, fontCss.bold)}>
                      <I18n id={'trade-user-maintenance-margin'} />
                    </div>
                    <div className={styleMr(styles.mmDesc)}>
                      <I18n id={'trade-user-maintenance-margin-desc'} />
                    </div>
                  </div>
                }
              />
            </div>
          }
          align={'justify'}
          labelClass={styleMr(styles.label)}
          valueClass={styleMr(styles.value)}
        >
          <PendingHolder loading={this.state.userAccount === undefined} useIcon={true}>
            <TokenAmountInline
              amount={this.state.userAccount?.lockedMargin}
              token={this.state.quoteToken?.symbol || ''}
              symClassName={styleMr(styles.label)}
              short={true}
              fix={SLD_ENV_CONF.FixDigits.Open[this.state.underlying]}
              rmZero={true}
              precision={SLD_ENV_CONF.FixDigits.Open[this.state.underlying]}
            />
          </PendingHolder>
        </HorizonItem>

        <HorizonItem
          label={
            <div>
              <I18n id={'trade-user-funding'} /> | <span>{this.state.countDown}</span>
            </div>
          }
          align={'justify'}
          labelClass={styleMr(styles.label)}
          valueClass={styleMr(styles.value)}
        >
          <TokenAmountInline
            amount={this.state.nextFund}
            token={this.state.quoteToken?.symbol || ''}
            symClassName={styleMr(styles.label)}
            short={true}
            fix={SLD_ENV_CONF.FixDigits.Open[this.state.underlying]}
            rmZero={true}
            precision={SLD_ENV_CONF.FixDigits.Open[this.state.underlying]}
          />
        </HorizonItem>
      </div>
    );
  }
}
