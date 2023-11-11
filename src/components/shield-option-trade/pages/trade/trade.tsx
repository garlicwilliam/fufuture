import { BaseStateComponent } from '../../../../state-manager/base-state-component';
import { P } from '../../../../state-manager/page/page-state-parser';
import { bindStyleMerger } from '../../../../util/string';
import styles from './trade.module.less';
import { MarketSelect } from './market-select/market-select';
import { MarketPrices } from './market-prices/market-prices';
import { Balance } from './balance/balance';
import { OpenLabel } from './open/open';
import { Orders } from './orders/orders';
import { PoolsInfo } from './pool-info/pools-info';

type IState = {
  isMobile: boolean;
};
type IProps = {};

export class OptionTrade extends BaseStateComponent<IProps, IState> {
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

    return (
      <>
        <div className={styleMr(styles.wrapperTrade)}>
          <MarketSelect className={styles.mSelect} />

          <MarketPrices className={styles.mPrices} />

          <Balance className={styles.mBalance} />

          <OpenLabel className={styles.mTrade} />
        </div>

        <Orders />

        <PoolsInfo />
      </>
    );
  }
}
