import { BaseStateComponent } from '../../../../../state-manager/base-state-component';
import { P } from '../../../../../state-manager/page/page-state-parser';
import { bindStyleMerger } from '../../../../../util/string';
import styles from './private-pool.module.less';
import { PageTitle } from '../../common/page-title';
import { I18n } from '../../../../i18n/i18n';
import { RouteKey } from '../../../../../constant/routes';
import { YourLiquidity } from './your-liquidity/your-liquidity';
import { TradeLockedLiquidity } from './locked-liquidity/locked-liquidity';

type IState = {
  isMobile: boolean;
};
type IProps = {};

export class PrivatePool extends BaseStateComponent<IProps, IState> {
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
      <div className={styleMr(styles.wrapperPriPool)}>
        <PageTitle backRoute={RouteKey.pools} title={<I18n id={'trade-pool-private'} textUpper={'uppercase'} />} />

        <YourLiquidity />

        <TradeLockedLiquidity />
      </div>
    );
  }
}
