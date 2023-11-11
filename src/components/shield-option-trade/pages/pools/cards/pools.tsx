import { BaseStateComponent } from '../../../../../state-manager/base-state-component';
import { P } from '../../../../../state-manager/page/page-state-parser';
import { bindStyleMerger } from '../../../../../util/string';
import styles from './pools.module.less';
import { PageTitle } from '../../common/page-title';
import { I18n } from '../../../../i18n/i18n';
import { TradePoolCard } from './pool-card';
import pubPool from '../../../../../assets/imgs/pool/public-pool.svg';
import priPool from '../../../../../assets/imgs/pool/private-pool.svg';
import { RouteKey } from '../../../../../constant/routes';

type IState = {
  isMobile: boolean;
};
type IProps = {};

export class TradePools extends BaseStateComponent<IProps, IState> {
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
        <PageTitle title={<I18n id={'trade-pools'} textUpper={'uppercase'} />} />

        <div className={styleMr(styles.cards)}>
          <TradePoolCard
            icon={pubPool}
            iconSize={56}
            title={<I18n id={'trade-pool-public'} />}
            desc={<I18n id={'trade-pool-public-desc'} />}
            targetRoute={RouteKey.poolsPublic}
          />

          <TradePoolCard
            icon={priPool}
            iconSize={80}
            title={<I18n id={'trade-pool-private'} />}
            desc={<I18n id={'trade-pool-private-desc'} />}
            targetRoute={RouteKey.poolsPrivate}
          />
        </div>
      </div>
    );
  }
}
