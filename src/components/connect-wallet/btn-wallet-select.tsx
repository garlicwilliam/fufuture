import { BaseStateComponent } from '../../state-manager/base-state-component';
import { SelectButton } from '../common/buttons/select-btn';
import { combineLatest, Observable, of, switchMap, zip } from 'rxjs';
import { walletState } from '../../state-manager/wallet/wallet-state';
import { map, take, tap } from 'rxjs/operators';
import walletConnect from '../../assets/imgs/wallet/wallet-connect.svg';
import { i18n } from '../i18n/i18n-fn';
import { WalletButtonStyleType } from './common-types';
import { ReactNode } from 'react';
import { cssPick, styleMerge } from '../../util/string';
import { fontCss } from '../i18n/font-switch';
import { WalletInterface } from '../../wallet/wallet-interface';
import { WcWalletInfo } from '../../services/wc-modal/wc-modal.service';
import { checkIsMatchWalletInfo, checkRegisteredWalletConnectPeer, Wallet } from '../../wallet/define';
import { px } from '../common/svg/util-function';
import { Visible } from '../builtin/hidden';
import { P } from '../../state-manager/page/page-state-parser';

type IProps = {
  onClick?: (wallet: Wallet) => void;
  styleType?: WalletButtonStyleType;
  disabled?: boolean;
  walletInfo?: WcWalletInfo | null;
};
type IState = {
  isMobile: boolean;
  isWalletConnectActivate: boolean;
  isWalletConnectSelected: boolean;
  peerName?: string;
  peerIcon?: string;
};

export class WalletConnectButton extends BaseStateComponent<IProps, IState> {
  state: IState = {
    isMobile: P.Layout.IsMobile.get(),
    isWalletConnectActivate: false,
    isWalletConnectSelected: false,
    peerName: undefined,
    peerIcon: undefined,
  };

  componentDidMount() {
    this.registerIsMobile('isMobile');
    this.registerObservable('isWalletConnectActivate', this.mergeWalletConnectActive());
  }

  componentWillUnmount() {
    this.destroyState();
  }

  private mergeWalletConnectActive(): Observable<boolean> {
    return combineLatest([walletState.WALLET_TYPE, walletState.IS_CONNECTED]).pipe(
      map(([wallet, isConnected]) => {
        return wallet === Wallet.WalletConnect && isConnected;
      }),
      switchMap((isActive: boolean) => {
        if (isActive) {
          return walletState.watchWalletInstance().pipe(
            take(1),
            switchMap((wallet: WalletInterface) => {
              const icon$ = wallet.walletIcon().pipe(take(1));
              const peer$ = of(wallet.walletName() as { url: string; name: string });

              return zip(icon$, peer$);
            }),
            tap(([icon, peer]) => {
              this.updateState({ peerName: peer.name, peerIcon: icon });
            }),
            map(([icon, peer]): boolean => {
              if (this.props.walletInfo) {
                return checkIsMatchWalletInfo(peer, this.props.walletInfo);
              } else {
                return this.state.isMobile ? isActive : !checkRegisteredWalletConnectPeer(peer);
              }
            })
          );
        } else {
          return of(isActive);
        }
      })
    );
  }

  private onClickBtn() {
    if (this.state.isWalletConnectActivate) {
      return;
    }
    walletState.connectToWallet(Wallet.WalletConnect, { walletInfo: this.props.walletInfo || undefined });
  }

  private genIcon(): ReactNode {
    return (
      <div
        style={{
          lineHeight: '0px',
          width: '20px',
          height: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <img
          alt={''}
          src={
            this.props.walletInfo
              ? this.props.walletInfo.icon
              : this.state.peerIcon && this.state.isMobile
              ? this.state.peerIcon
              : walletConnect
          }
          style={{ maxWidth: '20px', maxHeight: '20px' }}
        />
      </div>
    );
  }

  private genBtnIcon(): ReactNode {
    const iconSize = 40;
    return (
      <div
        style={{
          lineHeight: '0px',
          width: px(iconSize),
          height: px(iconSize),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <img
          alt={''}
          src={
            this.props.walletInfo
              ? this.props.walletInfo.icon
              : this.state.peerIcon && this.state.isMobile
              ? this.state.peerIcon
              : walletConnect
          }
          style={{ maxWidth: px(iconSize), maxHeight: px(iconSize), borderRadius: '4px' }}
        />
      </div>
    );
  }

  render() {
    const realWallet: string = this.props.walletInfo
      ? this.props.walletInfo.name
      : this.state.peerName
      ? this.state.peerName
      : 'WalletConnect.';

    const displayWallet: string = this.state.isWalletConnectActivate
      ? realWallet
      : this.props.walletInfo?.name || 'WalletConnect.';

    return (
      <>
        <SelectButton
          isActivate={this.state.isWalletConnectActivate}
          isSelected={this.state.isWalletConnectSelected}
          onClick={this.onClickBtn.bind(this)}
          styleType={this.props.styleType}
          disabled={this.props.disabled}
        >
          <div>{this.props.styleType === 'popup' ? this.genBtnIcon() : this.genIcon()}</div>
          <div
            className={styleMerge(
              'wallet-name',
              cssPick(this.state.isWalletConnectActivate && this.props.styleType === 'popup', fontCss.bold)
            )}
          >
            {displayWallet}
            <Visible when={this.state.isWalletConnectActivate}>
              <span className={styleMerge('wallet-active')} />
            </Visible>
          </div>
        </SelectButton>
      </>
    );
  }
}
