import { BaseStateComponent } from '../../../../state-manager/base-state-component';
import { P } from '../../../../state-manager/page/page-state-parser';
import { bindStyleMerger, styleMerge } from '../../../../util/string';
import styles from './lang-switch.module.less';
import { SldSelect, SldSelectOption } from '../../../common/selects/select';
import { getLanguage, setLanguage } from '../../../../locale/i18n';
import { asyncScheduler } from 'rxjs';

type IState = {
  isMobile: boolean;
  curLang: string;
};
type IProps = {
  size?: 'small' | 'tiny';
  isDark?: boolean;
};

export class LangSwitch extends BaseStateComponent<IProps, IState> {
  state: IState = {
    isMobile: P.Layout.IsMobile.get(),
    curLang: 'en',
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

    return [
      {
        value: 'en',
        label: <div className={styleMerge(styles.optionText, sizeCss)}>EN</div>,
      },
      {
        value: 'zh',
        label: <div className={styleMerge(styles.optionText, sizeCss)}>简体</div>,
      },
      {
        value: 'zhHK',
        label: <div className={styleMerge(styles.optionText, sizeCss)}>繁體</div>,
      },
      {
        value: 'ko',
        label: <div className={styleMerge(styles.optionText, sizeCss)}>한국어</div>,
      },
    ];
  }

  render() {
    const mobileCss = this.state.isMobile ? styles.mobile : '';
    const styleMr = bindStyleMerger(mobileCss);

    const sizeCss = this.props.size === 'tiny' ? styles.sizeTiny : styles.sizeSmall;
    const themeCss = this.props.isDark ? styles.themeDark : styles.themeLight;
    const dropdownCss = this.props.isDark ? styles.dropdownDark : styles.dropdown;

    return (
      <div className={styleMr(styles.langWrapper)}>
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
      </div>
    );
  }
}
