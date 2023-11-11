import { BaseStateComponent } from '../../../../../../state-manager/base-state-component';
import { P } from '../../../../../../state-manager/page/page-state-parser';
import { bindStyleMerger } from '../../../../../../util/string';
import styles from './extend-trigger.module.less';
import { I18n } from '../../../../../i18n/i18n';
import { IconDropdown } from '../../../../../common/icon/dropdown';
import { fontCss } from '../../../../../i18n/font-switch';

type IState = {
  isMobile: boolean;
};
type IProps = {
  className?: string;
  isExt?: boolean;
  onClick: () => void;
};

export class ExtendTrigger extends BaseStateComponent<IProps, IState> {
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
      <div className={styleMr(styles.trigger, this.props.className)} onClick={this.props.onClick}>
        <div className={styleMr(styles.text, fontCss.medium)}>
          {this.props.isExt ? (
            <I18n id={'trade-market-close'} textUpper={'uppercase'} />
          ) : this.state.isMobile ? (
            <I18n id={'trade-select'} textUpper={'uppercase'} />
          ) : (
            <I18n id={'trade-market-select'} textUpper={'uppercase'} />
          )}
        </div>

        <IconDropdown width={10} pointTo={this.props.isExt ? 'top' : 'down'} />
      </div>
    );
  }
}
