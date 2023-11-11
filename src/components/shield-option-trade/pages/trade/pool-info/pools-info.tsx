import { BaseStateComponent } from '../../../../../state-manager/base-state-component';
import { P } from '../../../../../state-manager/page/page-state-parser';
import { bindStyleMerger } from '../../../../../util/string';
import styles from './pools-info.module.less';
import { LiquidityInfo } from './liquidity/liquidity';
import { TradeInfo } from './info/info';

type IState = {
  isMobile: boolean;
};
type IProps = {};

export class PoolsInfo extends BaseStateComponent<IProps, IState> {
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
      <div className={styleMr(styles.wrapperPools)}>
        <LiquidityInfo />

        <TradeInfo />
      </div>
    );
  }
}
