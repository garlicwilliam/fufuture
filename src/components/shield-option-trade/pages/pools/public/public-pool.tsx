import { BaseStateComponent } from '../../../../../state-manager/base-state-component';
import { P } from '../../../../../state-manager/page/page-state-parser';
import { bindStyleMerger } from '../../../../../util/string';
import styles from './public-pool.module.less';
import { PageTitle } from '../../common/page-title';
import { I18n } from '../../../../i18n/i18n';
import { RouteKey } from '../../../../../constant/routes';
import { AddPublicLiquidity } from './add-liquidity/add-liquidity';
import { PoolShare } from './pool-share/pool-share';
import { FixPadding } from '../../../../common/content/fix-padding';

type IState = {
  isMobile: boolean;
};
type IProps = {};

export class PublicPool extends BaseStateComponent<IProps, IState> {
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
      <div className={styleMr(styles.wrapperPublic)}>
        <PageTitle backRoute={RouteKey.pools} title={<I18n id={'trade-pool-public'} textUpper={'uppercase'} />} />

        <AddPublicLiquidity />

        <FixPadding top={40} bottom={0} mobTop={20} mobBottom={0}>
          <PoolShare />
        </FixPadding>
      </div>
    );
  }
}
