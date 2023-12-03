import { BaseStateComponent } from '../../../state-manager/base-state-component';
import { P } from '../../../state-manager/page/page-state-parser';
import { styleMerge } from '../../../util/string';
import styles from './connect-wallet.module.less';
import { I18n } from '../../i18n/i18n';
import { SldButton } from '../../common/buttons/sld-button';

type IState = {
  isMobile: boolean;
};
type IProps = {
  className?: string;
  size?: 'large' | 'huge' | 'small' | 'tiny';
};

export class ConnectWallet extends BaseStateComponent<IProps, IState> {
  state: IState = {
    isMobile: P.Layout.IsMobile.get(),
  };

  componentDidMount() {
    this.registerIsMobile('isMobile');
  }

  componentWillUnmount() {
    this.destroyState();
  }

  onConnect() {
    P.Layout.IsShowWalletModal.set(true);
  }

  render() {
    return (
      <SldButton
        size={this.props.size || 'small'}
        type={'none'}
        className={styleMerge('shield-btn', styles.wrapperWallet)}
        onClick={this.onConnect.bind(this)}
      >
        <I18n id={'com-connect-wallet'} />
      </SldButton>
    );
  }
}
