import { BaseStateComponent } from '../../../../../../state-manager/base-state-component';
import { P } from '../../../../../../state-manager/page/page-state-parser';
import { bindStyleMerger, cssPick } from '../../../../../../util/string';
import styles from './extend-content.module.less';
import { IndexUnderlyingType } from '../../../../const/assets';
import { IndexUnderlyingAssetsIcon } from '../../../../const/imgs';
import { PoolsTable } from './pools-table';
import { fontCss } from '../../../../../i18n/font-switch';

type IState = {
  isMobile: boolean;
  curTab: IndexUnderlyingType;
};
type IProps = {};

export class MarketExtendContent extends BaseStateComponent<IProps, IState> {
  state: IState = {
    isMobile: P.Layout.IsMobile.get(),
    curTab: IndexUnderlyingType.BTC,
  };

  componentDidMount() {
    this.registerIsMobile('isMobile');
    this.registerState('curTab', P.Option.Trade.Select.IndexUnderlying);
  }

  componentWillUnmount() {
    this.destroyState();
  }

  render() {
    const mobileCss = this.state.isMobile ? styles.mobile : '';
    const styleMr = bindStyleMerger(mobileCss);

    const underlyingNames: IndexUnderlyingType[] = Object.values(IndexUnderlyingType);

    return (
      <div className={styleMr(styles.wrapperExt)}>
        <div className={styleMr(styles.menus)}>
          {underlyingNames.map((indexUnderlying: IndexUnderlyingType, index) => {
            return (
              <div
                key={indexUnderlying}
                className={styleMr(
                  styles.tabTitle,
                  fontCss.boldLatin,
                  cssPick(this.state.curTab === indexUnderlying, styles.active)
                )}
                onClick={() => P.Option.Trade.Select.IndexUnderlying.set(indexUnderlying)}
              >
                <img src={IndexUnderlyingAssetsIcon[indexUnderlying]} alt={''} height={20} />
                <span>{indexUnderlying}-INDEX</span>
              </div>
            );
          })}
        </div>

        <PoolsTable />
      </div>
    );
  }
}
