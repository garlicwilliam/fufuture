import ModalRender from '../modal-render/index';
import { BaseStateComponent } from '../../state-manager/base-state-component';
import { walletState } from '../../state-manager/wallet/wallet-state';
import { ConnectWalletPage } from './connect-wallet-page';
import { P } from '../../state-manager/page/page-state-parser';
import { ReactNode } from 'react';
import { Visible } from '../builtin/hidden';
import { Checkbox } from 'antd';
import styles from './connect-wallet.module.less';
import { CheckboxChangeEvent } from 'antd/es/checkbox';
import { walletAgree } from '../../state-manager/wallet/wallet-agree';
import { I18n } from '../i18n/i18n';

type IProps = {
  manualPopup?: boolean;
  customClass?: string;
  connectionAgree?: ReactNode;
};

type IState = {
  visible: boolean;
  account: string | null;
  isWalletConnected: boolean;
  isVisible: boolean;
  agree: boolean | undefined;
};

export class ConnectWallet extends BaseStateComponent<IProps, IState> {
  state: IState = {
    visible: false,
    account: null,
    isWalletConnected: true,

    isVisible: P.Layout.IsShowWalletModal.get(),
    agree: undefined,
  };

  componentDidMount() {
    this.registerObservable('account', walletState.USER_ADDR);
    this.registerObservable('isWalletConnected', walletState.IS_CONNECTED);
    this.registerState('isVisible', P.Layout.IsShowWalletModal);
    this.registerObservable('agree', walletAgree.IS_AGREE);
  }

  componentWillUnmount() {
    this.destroyState();
  }

  onShow() {
    this.setState({ visible: true });
  }

  onHide() {
    P.Layout.IsShowWalletModal.set(false);
  }

  onChangeAgree(checked: boolean) {
    walletAgree.setAgree(checked);
  }

  render() {
    const closeable: boolean = !!this.state.account || !!this.props.manualPopup;
    const visible: boolean = this.state.isVisible || (!this.state.isWalletConnected && !this.props.manualPopup);

    return (
      <div>
        <ModalRender
          visible={visible}
          title={<I18n id={'com-connect-wallet'} />}
          onCancel={this.onHide.bind(this)}
          onClose={this.onHide.bind(this)}
          height={300}
          width={600}
          closable={closeable}
          maskClosable={closeable}
          footer={null}
          className={this.props.customClass}
        >
          <Visible when={!!this.props.connectionAgree && (!walletAgree.INIT_AGREE || !this.state.agree)}>
            <div className={styles.agree}>
              <div className={styles.box}>
                <Checkbox
                  checked={this.state.agree}
                  onChange={(event: CheckboxChangeEvent) => {
                    this.onChangeAgree(event.target.checked);
                  }}
                />
              </div>
              <div className={styles.terms}>{this.props.connectionAgree}</div>
            </div>
          </Visible>

          <ConnectWalletPage styleType={'popup'} disableConnection={!this.state.agree} />
        </ModalRender>
      </div>
    );
  }
}
