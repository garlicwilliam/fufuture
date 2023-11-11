import { BaseStateComponent } from '../../../../state-manager/base-state-component';
import { P } from '../../../../state-manager/page/page-state-parser';
import { bindStyleMerger } from '../../../../util/string';
import styles from './lang-switch.module.less';
import { SldSelect, SldSelectOption } from '../../../common/selects/select';
import { getLanguage, setLanguage } from '../../../../locale/i18n';
import { asyncScheduler } from 'rxjs';

type IState = {
  isMobile: boolean;
  curLang: string;
};
type IProps = {};

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
    return [
      {
        value: 'en',
        label: <div>EN</div>,
      },
      {
        value: 'zh',
        label: <div>简体</div>,
      },
      {
        value: 'zhHK',
        label: <div>繁體</div>,
      },
      {
        value: 'ko',
        label: <div>한국어</div>,
      },
    ];
  }

  render() {
    const mobileCss = this.state.isMobile ? styles.mobile : '';
    const styleMr = bindStyleMerger(mobileCss);

    return (
      <div className={styleMr(styles.langWrapper)}>
        <SldSelect
          noBorder={true}
          dropdownSize={10}
          className={styleMr(styles.langSelect)}
          dropdownClassName={styleMr(styles.dropdown)}
          options={this.genOption()}
          zIndex={1100}
          curSelected={this.state.curLang}
          onChangeSelect={op => this.onSwitch(op.value as string)}
        />
      </div>
    );
  }
}
