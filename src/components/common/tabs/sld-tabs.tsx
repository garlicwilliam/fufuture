import { BaseStateComponent } from '../../../state-manager/base-state-component';
import styles from './sld-tabs.module.less';
import { SldTabPanel } from './sld-tab-panel';
import { Children, ReactElement, ReactNode } from 'react';
import _ from 'lodash';
import { bindStyleMerger, cssPick, pxStr } from '../../../util/string';
import { filter } from 'rxjs/operators';
import { asyncScheduler } from 'rxjs';
import { Resize } from '../utils/resize';
import { fontCss } from '../../i18n/font-switch';
import { Visible } from '../../builtin/hidden';

type IState = {
  curTabId: string | null;
  isMobile: boolean;
  contentHeight?: number;
};

type IProps = {
  children?: any;
  curTabId?: string;
  tabStyle?: 'normal' | 'light' | 'offset';
  tabParam?: {
    normal?: { align?: 'left'; noBg?: boolean };
    light?: { banPadding?: boolean; noBg?: boolean };
    offset?: { minWidth?: number; noBg?: boolean; align?: 'left' };
  };
  tabTools?: ReactNode;
  noAnimation?: boolean;
  className?: string;
  tabClassName?: string;
  title?: ReactNode;
  tabChange?: (tabKey: string) => void;
  darkMode?: boolean;
};

export class SldTabs extends BaseStateComponent<IProps, IState> {
  state: IState = {
    curTabId: null,
    isMobile: false,
    contentHeight: undefined,
  };

  componentDidMount() {
    this.registerIsMobile('isMobile');

    const tab$ = this.watchStateChange('curTabId').pipe(filter(Boolean));

    this.sub(tab$, (tabId: string) => {
      asyncScheduler.schedule(() => {
        if (this.props.tabChange) {
          this.props.tabChange(tabId);
        }
      });
    });
  }

  componentWillUnmount() {
    this.destroyState();
  }

  static getDerivedStateFromProps(nextProps: IProps, preState: IState): Partial<IState> | null {
    const tabList: ReactElement[] = [];
    Children.map(nextProps.children || [], (child: ReactElement, index: number) => {
      if (!child) {
        return;
      }

      if (child.type === SldTabPanel) {
        tabList.push(child);
      }
    });

    const tabId: string | undefined = nextProps.curTabId;
    const rs: Partial<IState> = {};

    if (tabId && !_.isEqual(tabId, preState.curTabId)) {
      rs.curTabId = tabId;
    }

    if (!_.isEmpty(rs)) {
      return rs;
    }

    return null;
  }

  onChangeTab(tabId: string) {
    const curTab: ReactElement | undefined = this.selectCurTab(tabId);

    if (curTab) {
      if (curTab?.props.disabled) {
        return;
      }

      if (_.isEqual(this.state.curTabId, tabId)) {
        return;
      }
      this.updateState({ curTabId: tabId });
    }
  }

  private selectCurTab(tabId: string | null): ReactElement | undefined {
    const tabs: ReactElement[] = Children.map(this.props.children, tab => tab);
    let curTab: ReactElement | undefined = undefined;

    if (tabId) {
      curTab = tabs.find(tab => tab.props.tid === tabId);
    }

    if (!curTab) {
      const defaultSelect = tabs.find(one => !one.props.disabled);
      curTab = defaultSelect ? defaultSelect : tabs.length > 0 ? tabs[0] : undefined;
    }

    return curTab;
  }

  private onContentHeightChange(height: number) {
    this.updateState({ contentHeight: height });
  }

  render() {
    const mobileCss = this.state.isMobile ? styles.mobile : '';
    const styleMr = bindStyleMerger(mobileCss);

    const tabs: ReactElement[] = Children.map(this.props.children, tab => tab);
    const curTab: ReactElement | undefined = this.selectCurTab(this.state.curTabId);
    const curTabId = curTab?.props.tid;

    const lightPadCss: string = this.props.tabParam?.light?.banPadding ? '' : styles.lightPadding;
    const darkCss: string = this.props.darkMode ? styles.darkMode : '';

    const tabStyle = this.props.tabStyle ? this.props.tabStyle : 'normal';
    const alignLeft: boolean = !!this.props.tabParam?.normal?.align;

    const activeFirst: boolean = tabStyle === 'normal' && curTabId === tabs[0].props.tid;
    const activeLast: boolean = !alignLeft && tabStyle === 'normal' && curTabId === tabs[tabs.length - 1].props.tid;

    const noBg: boolean =
      this.props.tabParam?.offset?.noBg === true ||
      this.props.tabParam?.normal?.noBg === true ||
      this.props.tabParam?.light?.noBg == true;

    return (
      <div className={styleMr(styles.sldTab, this.props.className, darkCss)}>
        {this.props.title ? <div className={styles.title}>{this.props.title}</div> : null}

        <Visible when={tabStyle === 'light'}>
          <div
            className={styleMr(
              styles.lightTabNames,
              'sld-tabs-name-light',
              lightPadCss,
              cssPick(noBg, styles.noBg),
              this.props.tabClassName
            )}
          >
            {tabs.map((tab: ReactElement) => {
              return (
                <div
                  className={styleMr(
                    styles.lightItem,
                    fontCss.bold,
                    'sld_tab_item',
                    cssPick(tab.props.tid === curTabId, 'sld_tab_item_active'),
                    cssPick(tab.props.tid === curTabId, styles.active),
                    cssPick(tab.props.disabled, 'sld_tab_item_disabled')
                  )}
                  key={tab.props.tid}
                  onClick={() => this.onChangeTab(tab.props.tid)}
                >
                  {tab.props.tab}
                </div>
              );
            })}

            {this.props.tabTools}
          </div>
        </Visible>

        <Visible when={tabStyle === 'offset'}>
          <div className={styleMr(styles.offsetNames, 'sld-tabs-name-offset', this.props.tabClassName)}>
            {tabs.map((tab: ReactElement, index: number) => {
              return (
                <div
                  key={tab.props.tid}
                  className={styleMr(
                    styles.offsetItem,
                    'sld_tab_item',
                    cssPick(index === 0, 'sld_tab_item_first'),
                    cssPick(index === tabs.length - 1, 'sld_tab_item_last'),
                    cssPick(tab.props.tid === curTabId, 'sld_tab_item_active', fontCss.bold),
                    cssPick(tab.props.disabled, 'sld_tab_item_disabled'),
                    cssPick(tab.props.tid === curTabId, styles.active),
                    cssPick(tab.props.tid !== curTabId, fontCss.medium)
                  )}
                  style={{ minWidth: pxStr(this.props.tabParam?.offset?.minWidth) }}
                  onClick={() => this.onChangeTab(tab.props.tid)}
                >
                  {tab.props.tab}
                </div>
              );
            })}
          </div>
        </Visible>

        <Visible when={tabStyle === 'normal'}>
          <div
            className={styleMr(
              alignLeft ? styles.tabNamesAlign : styles.tabNames,
              'sld-tabs-name-normal',
              this.props.tabClassName
            )}
          >
            {tabs.map((tab: ReactElement, index: number) => {
              return (
                <div
                  key={tab.props.tid}
                  className={styleMr(
                    styles.tabItem,
                    'sld_tab_item',
                    cssPick(index === 0, 'sld_tab_item_first'),
                    cssPick(index === tabs.length - 1, 'sld_tab_item_last'),
                    cssPick(tab.props.tid === curTabId, 'sld_tab_item_active', fontCss.bold),
                    cssPick(tab.props.disabled, 'sld_tab_item_disabled'),
                    cssPick(tab.props.tid === curTabId, styles.active)
                  )}
                  onClick={() => this.onChangeTab(tab.props.tid)}
                >
                  {tab.props.tab}
                </div>
              );
            })}
          </div>
        </Visible>

        <div
          className={styleMr(
            styles.tabContent,
            'sld_tab_content',
            cssPick(activeFirst, 'sld_tab_content_first_active'),
            cssPick(activeLast, 'sld_tab_content_last_active'),
            cssPick(this.props.noAnimation !== true, styles.animation),
            cssPick(noBg, styles.noBg),
            cssPick(tabStyle === 'light', styles.light),
            cssPick(activeFirst, styles.activeFirst),
            cssPick(activeLast, styles.activeLast)
          )}
          style={{ height: this.props.noAnimation ? undefined : this.state.contentHeight }}
        >
          <Resize onHeightResize={this.onContentHeightChange.bind(this)}>{curTab}</Resize>
        </div>
      </div>
    );
  }
}
