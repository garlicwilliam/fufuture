import { BaseStateComponent } from '../../../../state-manager/base-state-component';
import { P } from '../../../../state-manager/page/page-state-parser';
import { bindStyleMerger } from '../../../../util/string';
import styles from './tabs.module.less';
import { SldTabs } from '../../../common/tabs/sld-tabs';
import { SldTabPanel } from '../../../common/tabs/sld-tab-panel';
import { BecomeSpark } from './become-spark/become-spark';
import { TradeMyReferral } from './referral/my-referral';
import { fontCss } from '../../../i18n/font-switch';
import { I18n } from '../../../i18n/i18n';

enum TabId {
  Spark = 'Spark',
  Referral = 'Referral',
}

type IState = {
  isMobile: boolean;
  curTab: TabId;
};
type IProps = {};

export class TradeReferralTabs extends BaseStateComponent<IProps, IState> {
  state: IState = {
    isMobile: P.Layout.IsMobile.get(),
    curTab: TabId.Spark,
  };

  componentDidMount() {
    this.registerIsMobile('isMobile');
  }

  componentWillUnmount() {
    this.destroyState();
  }

  onChange(tab: TabId) {
    this.updateState({ curTab: tab });
  }

  render() {
    const mobileCss = this.state.isMobile ? styles.mobile : '';
    const styleMr = bindStyleMerger(mobileCss);

    return (
      <SldTabs
        curTabId={this.state.curTab}
        className={styles.refTabName}
        tabChange={(tab: string) => this.onChange(tab as TabId)}
      >
        <SldTabPanel
          tid={TabId.Spark}
          tab={
            <span className={styleMr(fontCss.bold)}>
              <I18n id={'trade-spark-program'} />
            </span>
          }
        >
          <BecomeSpark />
        </SldTabPanel>

        <SldTabPanel
          tid={TabId.Referral}
          tab={
            <span className={styleMr(fontCss.bold)}>
              <I18n id={'trade-my-referral'} />
            </span>
          }
        >
          <TradeMyReferral />
        </SldTabPanel>
      </SldTabs>
    );
  }
}
