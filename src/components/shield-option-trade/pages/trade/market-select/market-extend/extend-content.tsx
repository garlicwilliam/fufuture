import { BaseStateComponent } from '../../../../../../state-manager/base-state-component';
import { P } from '../../../../../../state-manager/page/page-state-parser';
import { bindStyleMerger, cssPick } from '../../../../../../util/string';
import styles from './extend-content.module.less';
import { IndexUnderlyingAssetsIcon } from '../../../../const/imgs';
import { PoolsTable } from './pools-table';
import { fontCss } from '../../../../../i18n/font-switch';
import { StringInput } from '../../../../../common/input/string-input';
import { FixPadding } from '../../../../../common/content/fix-padding';
import { CloseCircleOutlined, SearchOutlined } from '@ant-design/icons';
import { i18n } from '../../../../../i18n/i18n-fn';
import {ShieldUnderlyingType} from "../../../../../../state-manager/state-types";

type IState = {
  isMobile: boolean;
  curTab: ShieldUnderlyingType;
  searchKey: string;
};
type IProps = {};

export class MarketExtendContent extends BaseStateComponent<IProps, IState> {
  state: IState = {
    isMobile: P.Layout.IsMobile.get(),
    curTab: ShieldUnderlyingType.BTC,
    searchKey: P.Option.Trade.Select.SearchKey.get(),
  };

  componentDidMount() {
    this.registerIsMobile('isMobile');
    this.registerState('curTab', P.Option.Trade.Select.IndexUnderlying);
    this.registerState('searchKey', P.Option.Trade.Select.SearchKey);
  }

  componentWillUnmount() {
    this.destroyState();
  }

  render() {
    const mobileCss = this.state.isMobile ? styles.mobile : '';
    const styleMr = bindStyleMerger(mobileCss);

    const underlyingNames: ShieldUnderlyingType[] = Object.values(ShieldUnderlyingType);

    return (
      <div className={styleMr(styles.wrapperExt)}>
        <div className={styleMr(styles.menus)}>
          {underlyingNames.map((indexUnderlying: ShieldUnderlyingType, index) => {
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

        <FixPadding top={20} bottom={5} mobTop={20} mobBottom={5}>
          <StringInput
            className={styleMr(styles.searchForm)}
            onChange={(key: string) => P.Option.Trade.Select.SearchKey.set(key)}
            value={this.state.searchKey}
            prefix={
              <div className={styleMr(styles.prefix)}>
                <SearchOutlined />
              </div>
            }
            suffix={
              this.state.searchKey ? (
                <div className={styleMr(styles.suffix)} onClick={() => P.Option.Trade.Select.SearchKey.setToDefault()}>
                  <CloseCircleOutlined />
                </div>
              ) : (
                <></>
              )
            }
            placeholder={i18n('trade-market-search-placeholder')}
          />
        </FixPadding>

        <PoolsTable searchKey={this.state.searchKey} />
      </div>
    );
  }
}
