import { BaseStateComponent } from '../../../../../state-manager/base-state-component';
import { P } from '../../../../../state-manager/page/page-state-parser';
import { bindStyleMerger } from '../../../../../util/string';
import styles from './order-tabs.module.less';
import { SldTabs } from '../../../../common/tabs/sld-tabs';
import { SldTabPanel } from '../../../../common/tabs/sld-tab-panel';
import { I18n } from '../../../../i18n/i18n';
import { ActiveOrderTable } from './active/active-table';
import { HistoryOrderTable } from './active/history-table';

enum TabId {
  Active = 'Active',
  History = 'History',
}

type IState = {
  isMobile: boolean;
  curTabId: TabId;
};
type IProps = {};

export class OrderTabs extends BaseStateComponent<IProps, IState> {
  state: IState = {
    isMobile: P.Layout.IsMobile.get(),
    curTabId: TabId.Active,
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
      <div className={styleMr(styles.wrapperTabs)}>
        <SldTabs tabStyle={'light'} tabParam={{ light: { banPadding: true, noBg: true } }}>
          <SldTabPanel tid={TabId.Active} tab={<I18n id={'trade-orders-active'} textUpper={'uppercase'} />}>
            <div>
              <ActiveOrderTable />
            </div>
          </SldTabPanel>

          <SldTabPanel tid={TabId.History} tab={<I18n id={'trade-orders-history'} textUpper={'uppercase'} />}>
            <div>
              <HistoryOrderTable />
            </div>
          </SldTabPanel>
        </SldTabs>
      </div>
    );
  }
}
