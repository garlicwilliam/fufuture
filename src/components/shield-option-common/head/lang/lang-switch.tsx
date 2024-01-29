import { BaseStateComponent } from '../../../../state-manager/base-state-component';
import { P } from '../../../../state-manager/page/page-state-parser';
import { bindStyleMerger, cssPick, styleMerge, StyleMerger } from '../../../../util/string';
import styles from './lang-switch.module.less';
import { SldSelect, SldSelectOption } from '../../../common/selects/select';
import { getLanguage, setLanguage } from '../../../../locale/i18n';
import { asyncScheduler } from 'rxjs';
import { LanguageIcon } from '../../../common/svg/language';
import { SldOverlay } from '../../../common/overlay/overlay';
import { ReactNode } from 'react';
import { OverlayCard } from '../../../shield-option-trade/pages/common/overlay-card';

type IState = {
  isMobile: boolean;
  curLang: string;
};
type IProps = {
  useIcon?: boolean;
  size?: 'small' | 'tiny';
  isDark?: boolean;
};

export class LangSwitch extends BaseStateComponent<IProps, IState> {
  state: IState = {
    isMobile: P.Layout.IsMobile.get(),
    curLang: 'en',
  };

  readonly supports = {
    en: 'EN',
    zh: '简体',
    zhHK: '繁體',
    ko: '한국어',
  };

  componentDidMount() {
    this.registerIsMobile('isMobile');
    this.updateState({ curLang: getLanguage() });
  }

  componentWillUnmount() {
    this.destroyState();
  }

  onSwitch(value: string) {
    setLanguage(value);
    this.updateState({ curLang: value });

    asyncScheduler.schedule(() => {
      window.location.reload();
    });
  }

  genOption(): SldSelectOption[] {
    const sizeCss = this.props.size === 'tiny' ? styles.sizeTiny : styles.sizeSmall;

    return Object.keys(this.supports).map(key => {
      return {
        value: key,
        label: <div className={styleMerge(styles.optionText, sizeCss)}>{this.supports[key]}</div>,
      };
    });
  }

  genOverlay(styleMr: StyleMerger): ReactNode {
    const lang = Object.keys(this.supports);
    return (
      <OverlayCard className={styleMr(styles.overlay)}>
        {lang.map(key => {
          return (
            <div
              key={key}
              className={styleMr(styles.langItem, cssPick(this.state.curLang === key, styles.active))}
              onClick={() => this.onSwitch(key)}
            >
              {this.supports[key]}
            </div>
          );
        })}
      </OverlayCard>
    );
  }

  render() {
    const mobileCss = this.state.isMobile ? styles.mobile : '';
    const styleMr = bindStyleMerger(mobileCss);

    const sizeCss = this.props.size === 'tiny' ? styles.sizeTiny : styles.sizeSmall;
    const themeCss = this.props.isDark ? styles.themeDark : styles.themeLight;
    const dropdownCss = this.props.isDark ? styles.dropdownDark : styles.dropdown;

    return (
      <div className={styleMr(styles.langWrapper)}>
        {this.props.useIcon ? (
          <SldOverlay
            overlay={this.genOverlay(styleMr)}
            placement={'bottom-end'}
            zIndex={1100}
            useArrow={false}
            offset={2}
            trigger={'hover'}
          >
            <div className={styleMr(styles.lang)}>
              <LanguageIcon width={20} height={20} />
            </div>
          </SldOverlay>
        ) : (
          <SldSelect
            noBorder={true}
            dropdownSize={10}
            className={styleMr(sizeCss, themeCss)}
            dropdownClassName={styleMr(dropdownCss)}
            options={this.genOption()}
            zIndex={1100}
            offset={2}
            curSelected={this.state.curLang}
            onChangeSelect={op => this.onSwitch(op.value as string)}
          />
        )}
      </div>
    );
  }
}
