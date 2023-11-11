import { BaseStateComponent } from '../../../../../state-manager/base-state-component';
import { P } from '../../../../../state-manager/page/page-state-parser';
import { bindStyleMerger, cssPick } from '../../../../../util/string';
import styles from './buy-switch.module.less';
import { I18n } from '../../../../i18n/i18n';
import { ShieldOptionType } from '../../../../../state-manager/state-types';

type IState = {
  isMobile: boolean;
  current: ShieldOptionType;
};
type IProps = {
  typeChange: (type: ShieldOptionType) => void;
};

export class BuySwitch extends BaseStateComponent<IProps, IState> {
  state: IState = {
    isMobile: P.Layout.IsMobile.get(),
    current: ShieldOptionType.Call,
  };

  componentDidMount() {
    this.registerIsMobile('isMobile');
    this.props.typeChange(this.state.current);
  }

  componentWillUnmount() {
    this.destroyState();
  }

  onSwitch(type: ShieldOptionType) {
    this.updateState({ current: type });
    this.props.typeChange(type);
  }

  render() {
    const mobileCss = this.state.isMobile ? styles.mobile : '';
    const styleMr = bindStyleMerger(mobileCss);

    return (
      <div className={styleMr(styles.wrapperSwitch)}>
        <div
          className={styleMr(styles.long, cssPick(this.state.current === ShieldOptionType.Call, styles.active))}
          onClick={() => this.onSwitch(ShieldOptionType.Call)}
        >
          <I18n id={'trade-option-type-call'} />
        </div>

        <div
          className={styleMr(
            cssPick(this.state.current === ShieldOptionType.Call, styles.dividerLong),
            cssPick(this.state.current === ShieldOptionType.Put, styles.dividerShort)
          )}
        />

        <div
          className={styleMr(styles.short, cssPick(this.state.current === ShieldOptionType.Put, styles.active))}
          onClick={() => this.onSwitch(ShieldOptionType.Put)}
        >
          <I18n id={'trade-option-type-put'} />
        </div>
      </div>
    );
  }
}
