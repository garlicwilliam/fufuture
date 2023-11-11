import { BaseStateComponent } from '../../../../../../state-manager/base-state-component';
import { P } from '../../../../../../state-manager/page/page-state-parser';
import { bindStyleMerger, cssPick, StyleMerger } from '../../../../../../util/string';
import styles from './setting.module.less';
import { IconSetting } from '../../../../../common/icon/setting';
import { SldOverlay, TriggerEvent } from '../../../../../common/overlay/overlay';
import { ReactNode } from 'react';
import { OverlayCard } from '../../../common/overlay-card';
import { I18n } from '../../../../../i18n/i18n';
import { fontCss } from '../../../../../i18n/font-switch';
import { ItemsBox } from '../../../../../common/content/items-box';
import { SldDecimal, SldDecPercent } from '../../../../../../util/decimal';
import { DecimalNumInput } from '../../../../../common/input/num-input-decimal';
import { OverlayClose } from '../../../../../common/icon/overlay-close';
import { C } from '../../../../../../state-manager/cache/cache-state-parser';
import { DEFAULT_DEADLINE, DEFAULT_SLIPPAGE, SLIPPAGE } from '../../../../const/default';
import { map, Observable } from 'rxjs';

type MState = {
  isMobile: boolean;
};

type MProps = {
  value: SldDecPercent;
  isActive: boolean;
  onSelect?: (value: SldDecPercent) => void;
};

export class SlippageMenu extends BaseStateComponent<MProps, MState> {
  state: MState = {
    isMobile: P.Layout.IsMobile.get(),
  };

  componentDidMount() {
    this.registerIsMobile('isMobile');
  }

  componentWillUnmount() {
    this.destroyState();
  }

  onSelect() {
    if (this.props.onSelect) {
      this.props.onSelect(this.props.value);
    }
  }

  render() {
    const mobileCss = this.state.isMobile ? styles.mobile : '';
    const styleMr = bindStyleMerger(mobileCss);

    return (
      <div
        className={styleMr(styles.selectMenu, cssPick(this.props.isActive, styles.active))}
        onClick={this.onSelect.bind(this)}
      >
        {this.props.value.percentFormat({ removeZero: true })}%
      </div>
    );
  }
}

// --------------------------------------------------------------------

type IState = {
  isMobile: boolean;
  selectedSlippage: SldDecPercent | undefined;
  forceTrigger: TriggerEvent | undefined;
  deadline: SldDecimal;
};
type IProps = {};

export class OpenSetting extends BaseStateComponent<IProps, IState> {
  state: IState = {
    isMobile: P.Layout.IsMobile.get(),
    selectedSlippage: undefined,
    forceTrigger: undefined,
    deadline: DEFAULT_DEADLINE,
  };

  maxSlippage = SldDecimal.fromNumeric('100', 2);

  componentDidMount() {
    this.registerIsMobile('isMobile');
    this.registerObservable('selectedSlippage', this.mergeSlippage());
    this.registerObservable('deadline', this.mergeDeadline());
  }

  componentWillUnmount() {
    this.destroyState();
  }

  mergeSlippage(): Observable<SldDecPercent> {
    return C.Option.Trade.Setting.Slippage.watch().pipe(
      map(slp => {
        return slp ? slp : DEFAULT_SLIPPAGE;
      })
    );
  }

  mergeDeadline(): Observable<SldDecimal> {
    return C.Option.Trade.Setting.Deadline.watch().pipe(
      map(deadline => {
        return deadline ? deadline : DEFAULT_DEADLINE;
      })
    );
  }

  onChangeSlippage(value: SldDecPercent) {
    C.Option.Trade.Setting.Slippage.set(value);
  }

  onChangeDeadline(value: SldDecimal | null) {
    if (!value) {
      return;
    }

    C.Option.Trade.Setting.Deadline.set(value);
  }

  onClose() {
    this.updateState({ forceTrigger: { date: new Date(), action: 'hide' } });
  }

  isSelectedOption(): boolean {
    return (
      !this.state.selectedSlippage ||
      this.state.selectedSlippage.eq(SLIPPAGE.A) ||
      this.state.selectedSlippage.eq(SLIPPAGE.B) ||
      this.state.selectedSlippage.eq(SLIPPAGE.C)
    );
  }

  genOverlay(styleMr: StyleMerger): ReactNode {
    const slippageFormValue = this.isSelectedOption()
      ? null
      : this.state.selectedSlippage?.toPercentVal().castDecimal(2);
    return (
      <OverlayCard>
        <div className={styleMr(styles.overlay)}>
          <OverlayClose padding={4} onClose={this.onClose.bind(this)} />
          <ItemsBox gap={20}>
            <div className={styleMr(styles.title, fontCss.bold)}>
              <I18n id={'trade-setting'} />
            </div>

            <ItemsBox gap={12}>
              <div className={styleMr(styles.subTitle)}>
                <I18n id={'trade-setting-slippage-tolerance'} />
              </div>

              <div className={styleMr(styles.selectionList)}>
                <SlippageMenu
                  isActive={!this.state.selectedSlippage || this.state.selectedSlippage.eq(SLIPPAGE.A)}
                  value={SLIPPAGE.A}
                  onSelect={this.onChangeSlippage.bind(this)}
                />
                <SlippageMenu
                  isActive={this.state.selectedSlippage?.eq(SLIPPAGE.B) || false}
                  value={SLIPPAGE.B}
                  onSelect={this.onChangeSlippage.bind(this)}
                />
                <SlippageMenu
                  isActive={this.state.selectedSlippage?.eq(SLIPPAGE.C) || false}
                  value={SLIPPAGE.C}
                  onSelect={this.onChangeSlippage.bind(this)}
                />

                <DecimalNumInput
                  originDecimal={2}
                  fix={2}
                  banDefaultStyle={true}
                  parentClassName={styleMr(styles.decNumInput, cssPick(slippageFormValue !== null, styles.selected))}
                  className={styleMr(styles.pInput)}
                  max={this.maxSlippage}
                  suffix={'%'}
                  value={slippageFormValue}
                  onChange={val => {
                    const slp = val ? SldDecPercent.genPercent(val.format(), 18) : DEFAULT_SLIPPAGE;
                    this.onChangeSlippage(slp);
                  }}
                />
              </div>
            </ItemsBox>

            <ItemsBox gap={12}>
              <div className={styleMr(styles.subTitle)}>
                <I18n id={'trade-setting-transaction-deadline'} />
              </div>

              <div className={styleMr(styles.deadline)}>
                <DecimalNumInput
                  originDecimal={0}
                  banDefaultStyle={true}
                  parentClassName={styleMr(styles.decNumInput)}
                  className={styleMr(styles.mInput)}
                  value={this.state.deadline}
                  min={SldDecimal.ZERO}
                  minIllegal={true}
                  onChange={this.onChangeDeadline.bind(this)}
                />

                <div className={styleMr()}>
                  <I18n id={'trade-minute'} />
                </div>
              </div>
            </ItemsBox>
          </ItemsBox>
        </div>
      </OverlayCard>
    );
  }

  render() {
    const mobileCss = this.state.isMobile ? styles.mobile : '';
    const styleMr = bindStyleMerger(mobileCss);

    return (
      <div className={styleMr(styles.wrapperSetting)}>
        <SldOverlay
          useArrow={false}
          offset={4}
          trigger={'click'}
          overlay={this.genOverlay(styleMr)}
          placement={'bottom-end'}
          forceTriggerEvent={this.state.forceTrigger}
        >
          <div className={styleMr(styles.settingTrigger)}>
            <IconSetting width={18} />
          </div>
        </SldOverlay>
      </div>
    );
  }
}
