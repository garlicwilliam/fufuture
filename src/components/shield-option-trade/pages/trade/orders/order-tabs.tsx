import { BaseStateComponent } from '../../../../../state-manager/base-state-component';
import { P } from '../../../../../state-manager/page/page-state-parser';
import { bindStyleMerger, cssPick, StyleMerger } from '../../../../../util/string';
import styles from './order-tabs.module.less';
import { SldTabs } from '../../../../common/tabs/sld-tabs';
import { SldTabPanel } from '../../../../common/tabs/sld-tab-panel';
import { I18n } from '../../../../i18n/i18n';
import { ActiveOrderTable } from './active/active-table';
import { HistoryOrderTable } from './active/history-table';
import { ReactNode } from 'react';
import { RefreshIcon } from '../../../../common/svg/refresh';
import { D } from '../../../../../state-manager/database/database-state-parser';
import { S } from '../../../../../state-manager/contract/contract-state-parser';
enum TabId {
  Active = 'Active',
  History = 'History',
}

type IState = {
  isMobile: boolean;
  curTabId: TabId;
  refTick: number;
};
type IProps = {};

export class OrderTabs extends BaseStateComponent<IProps, IState> {
  state: IState = {
    isMobile: P.Layout.IsMobile.get(),
    curTabId: TabId.Active,
    refTick: 0,
  };

  componentDidMount() {
    this.registerIsMobile('isMobile');
  }

  componentWillUnmount() {
    this.destroyState();
  }

  genRefreshBtn(styleMr: StyleMerger): ReactNode {
    const rotate: number = this.state.refTick * -360;
    return (
      <div
        className={styleMr(styles.tabRefresh, styles.pending1)}
        style={{ transform: `rotate(${rotate}deg)` }}
        onClick={this.onRefresh.bind(this)}
      >
        <RefreshIcon height={18} width={18} />
      </div>
    );
  }

  onRefresh() {
    this.updateState({ refTick: this.state.refTick + 1 });
    if (this.state.curTabId === TabId.History) {
      D.Option.HistoryOrders.tick();
    } else {
      S.Option.Order.ActiveList.tick();
    }
  }

  onTabChange(tabId: TabId) {
    this.updateState({ curTabId: tabId });
  }

  render() {
    const mobileCss = this.state.isMobile ? styles.mobile : '';
    const styleMr = bindStyleMerger(mobileCss);

    return (
      <div className={styleMr(styles.wrapperTabs)}>
        <SldTabs
          tabStyle={'light'}
          tabParam={{ light: { banPadding: true, noBg: true } }}
          tabTools={this.genRefreshBtn(styleMr)}
          tabChange={tabId => this.onTabChange(tabId as TabId)}
        >
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
