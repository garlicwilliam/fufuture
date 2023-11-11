import { BaseStateComponent } from '../../state-manager/base-state-component';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { message } from 'antd';
import { walletState } from '../../state-manager/wallet/wallet-state';
import { shortAddress } from '../../util';
import { I18n } from '../i18n/i18n';
import { WalletButtonStyleType } from './common-types';
import styles from './btn-address.module.less';
import { CopyOutlined } from '@ant-design/icons';
import { Visible } from '../builtin/hidden';

type IProps = {
  styleType?: WalletButtonStyleType;
};

type IState = {
  account: string | null;
  connected: boolean;
};

export class AddressButton extends BaseStateComponent<IProps, IState> {
  state: IState = {
    account: null,
    connected: true,
  };

  componentDidMount() {
    this.registerObservable('account', walletState.USER_ADDR);
    this.registerObservable('connected', walletState.IS_CONNECTED);
  }

  componentWillUnmount() {
    this.destroyState();
  }

  onCopyAddress() {
    message.success(<I18n id={'com-copied'} />);
  }

  render() {
    const hasAccount = this.state.connected && this.state.account !== null && this.state.account.length === 42;
    const copyCss = this.props.styleType === 'popup' ? styles.wrapperPop : styles.wrapperCopy;

    return (
      <Visible when={hasAccount}>
        <CopyToClipboard onCopy={this.onCopyAddress.bind(this)} text={this.state.account || ''}>
          <div className={copyCss}>
            {shortAddress(this.state.account || '', true)} <CopyOutlined />
          </div>
        </CopyToClipboard>
      </Visible>
    );
  }
}
