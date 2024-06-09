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
import { genQrCode } from '../lib/wc-qrcode/wc-qrcode';
import { WalletConnectModal } from './wallet-connect.modal';
import { WcModalEvent, wcModalService, WcWalletInfo } from '../../services/wc-modal/wc-modal.service';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

type IProps = {
  manualPopup?: boolean;
  customClass?: string;
  connectionAgree?: ReactNode;
};

type IState = {
  account: string | null;
  isWalletConnected: boolean;
  isVisible: boolean;
  autoClose: boolean;
  agree: boolean | undefined;

  walletConnectVisible: boolean;
  walletConnectWallet?: WcWalletInfo;
};

export class ConnectWallet extends BaseStateComponent<IProps, IState> {
  state: IState = {
    account: null,
    isWalletConnected: true,
    isVisible:
      typeof P.Layout.IsShowWalletModal.get() === 'boolean'
        ? P.Layout.IsShowWalletModal.get()
        : P.Layout.IsShowWalletModal.get()['show'],
    autoClose: false,
    agree: undefined,

    walletConnectVisible: false,
    walletConnectWallet: undefined,
  };

  componentDidMount() {
    this.registerObservable('account', walletState.USER_ADDR);
    this.registerObservable('isWalletConnected', walletState.IS_CONNECTED);
    this.registerMultiState(this.mergeVisible());
    this.registerObservable('agree', walletAgree.IS_AGREE);

    this.mergeWcModalEvent();
    this.registerMultiState(this.mergeWcModalEvent());
  }

  componentWillUnmount() {
    this.destroyState();
  }

  mergeVisible(): Observable<Partial<IState>> {
    return P.Layout.IsShowWalletModal.watch().pipe(
      map((visible: boolean | { show: boolean; autoClose: boolean }) => {
        if (typeof visible === 'boolean') {
          return { isVisible: visible, autoClose: false };
        } else {
          return { isVisible: visible.show, autoClose: visible.autoClose };
        }
      })
    );
  }

  private mergeWcModalEvent(): Observable<Partial<IState>> {
    return wcModalService.watchEvent().pipe(
      map((event: WcModalEvent) => {
        switch (event.type) {
          case 'show': {
            return { walletConnectVisible: true, walletConnectWallet: event.walletInfo };
          }
          case 'hide': {
            return { walletConnectVisible: false };
          }
          default: {
            return { walletConnectVisible: false };
          }
        }
      })
    );
  }

  onHide() {
    P.Layout.IsShowWalletModal.set(false);
  }

  onChangeAgree(checked: boolean) {
    walletAgree.setAgree(checked);
  }

  private isShowVisible(): boolean {
    const isClose: boolean = this.state.isWalletConnected && this.state.autoClose;
    return isClose ? false : this.state.isVisible || (!this.state.isWalletConnected && !this.props.manualPopup);
  }

  render(): JSX.Element {
    const closeable: boolean = !!this.state.account || !!this.props.manualPopup;
    const visible: boolean = this.isShowVisible();

    return (
      <div>
        <ModalRender
          visible={visible}
          title={<I18n id={'com-connect-wallet'} />}
          onCancel={this.onHide.bind(this)}
          onClose={this.onHide.bind(this)}
          height={320}
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

          <ConnectWalletPage disableConnection={!this.state.agree} />
        </ModalRender>

        <WalletConnectModal visible={this.state.walletConnectVisible} walletInfo={this.state.walletConnectWallet} />
      </div>
    );
  }
}
