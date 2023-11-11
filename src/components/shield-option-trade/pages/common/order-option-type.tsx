import { BaseStateComponent } from '../../../../state-manager/base-state-component';
import { P } from '../../../../state-manager/page/page-state-parser';
import { ShieldOptionType } from '../../../../state-manager/state-types';
import { I18n } from '../../../i18n/i18n';
import styles from './order-option-type.module.less';
import { bindStyleMerger, cssPick } from '../../../../util/string';

type IState = {
  isMobile: boolean;
};
type IProps = {
  optionType: ShieldOptionType;
};

export class OrderOptionType extends BaseStateComponent<IProps, IState> {
  state: IState = {
    isMobile: P.Layout.IsMobile.get(),
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
      <span
        className={styleMr(
          styles.line1,
          cssPick(this.props.optionType === ShieldOptionType.Call, styles.long),
          cssPick(this.props.optionType === ShieldOptionType.Put, styles.short)
        )}
      >
        {this.props.optionType === ShieldOptionType.Call ? (
          <I18n id={'trade-option-type-call'} textUpper={'uppercase'} />
        ) : (
          <I18n id={'trade-option-type-put'} textUpper={'uppercase'} />
        )}
      </span>
    );
  }
}
