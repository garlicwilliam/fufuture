import { BaseStateComponent } from '../../../../../state-manager/base-state-component';
import { P } from '../../../../../state-manager/page/page-state-parser';
import { bindStyleMerger } from '../../../../../util/string';
import styles from './funding-state.module.less';
import full from '../../../../../assets/imgs/trade/funding-full.png';
import warn from '../../../../../assets/imgs/trade/funding-warn.png';
import lack from '../../../../../assets/imgs/trade/funding-lack.png';
import { ShieldOrderFundPhaseInfo, ShieldOrderInfo } from '../../../../../state-manager/state-types';
import { map } from 'rxjs/operators';
import { combineLatest, Observable } from 'rxjs';
import { SldDecimal } from '../../../../../util/decimal';
import { S } from '../../../../../state-manager/contract/contract-state-parser';
import * as _ from 'lodash';

type IState = {
  isMobile: boolean;
  activeOrderList: ShieldOrderInfo[];
  fundState: string;
};
type IProps = {};

export class FundingState extends BaseStateComponent<IProps, IState> {
  state: IState = {
    isMobile: P.Layout.IsMobile.get(),
    activeOrderList: [],
    fundState: '',
  };

  componentDidMount() {
    this.registerIsMobile('isMobile');
    this.registerState('activeOrderList', P.Option.Trade.OrderList.ActiveList);
    this.registerObservable('fundState', this.mergeFundState());
  }

  componentWillUnmount() {
    this.destroyState();
  }

  mergeFundState(): Observable<string> {
    return combineLatest([
      P.Option.Trade.Pair.Quote.watch(),
      P.Option.Trade.OrderList.ActiveList.watch(),
      S.Option.User.Account.Info.watch(),
    ]).pipe(
      map(([token, orders, account]) => {
        const orderArr = orders.filter(order => _.isEqual(order.token, token));

        return { orders: orderArr, account };
      }),
      map(({ orders, account }) => {
        const orderPhaseInfo = orders.map(order => order.phaseInfo).filter(Boolean) as ShieldOrderFundPhaseInfo[];

        let phase1 = SldDecimal.ZERO;
        let phase2 = SldDecimal.ZERO;
        let phase3 = SldDecimal.ZERO;

        orderPhaseInfo.forEach(phaseInfo => {
          phase1 = phase1.add(phaseInfo.laterPhases[0].fundingFee);
          phase2 = phase2.add(phaseInfo.laterPhases[1].fundingFee);
          phase3 = phase3.add(phaseInfo.laterPhases[2].fundingFee);
        });

        return { phase1, phase2, phase3, account };
      }),
      map(({ phase1, phase2, phase3, account }) => {
        const phase1Fee = phase1;
        const phase2Fee = phase1Fee.add(phase2);
        const phase3Fee = phase2Fee.add(phase3);

        const url =
          phase3Fee.isZero() || account.availableBalance.gt(phase3Fee)
            ? full
            : account.availableBalance.gt(phase2Fee)
            ? warn
            : account.availableBalance.gt(phase1)
            ? lack
            : lack;

        return url;
      })
    );
  }

  render() {
    const mobileCss = this.state.isMobile ? styles.mobile : '';
    const styleMr = bindStyleMerger(mobileCss);
    const imgUrl = this.state.fundState || full;

    return (
      <div className={styleMr(styles.fundingState)}>
        <img src={imgUrl} alt={''} width={23} />
      </div>
    );
  }
}
