import { BaseStateComponent } from '../../../../state-manager/base-state-component';
import { P } from '../../../../state-manager/page/page-state-parser';
import { bindStyleMerger } from '../../../../util/string';
import styles from './form-footer.module.less';
import { ReactNode } from 'react';
import { SldButton } from '../../../common/buttons/sld-button';
import { I18n } from '../../../i18n/i18n';

type IState = {
  isMobile: boolean;
};
type IProps = {
  doneName: ReactNode;
  cancelName?: ReactNode;
  onDone: () => void;
  onCancel: () => void;
  pending?: boolean;
  disabled?: boolean;
};

export class TradeFormFooter extends BaseStateComponent<IProps, IState> {
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
      <div className={styleMr(styles.wrapperFooter)}>
        <SldButton
          size={'large'}
          type={'default'}
          className={styleMr(styles.btnDefault, styles.cancel)}
          onClick={() => this.props.onCancel()}
        >
          {this.props.cancelName ? this.props.cancelName : <I18n id={'trade-cancel'} textUpper={'uppercase'} />}
        </SldButton>

        <SldButton
          size={'large'}
          type={'primary'}
          className={styleMr(styles.btn, styles.confirm)}
          onClick={() => this.props.onDone()}
          disabled={this.props.disabled}
        >
          {this.props.doneName}
        </SldButton>
      </div>
    );
  }
}
