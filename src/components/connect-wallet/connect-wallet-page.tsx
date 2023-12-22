import { BaseStateComponent } from '../../state-manager/base-state-component';
import { MetamaskButton } from './btn-metamask';
import { WalletConnectButton } from './btn-wallet-select';
import { AddressButton } from './btn-address';
import { EthereumProviderName, Wallet } from '../../constant';
import { walletState } from '../../state-manager/wallet/wallet-state';
import styles from './connect-wallet-page.module.less';
import { DisconnectButton } from './btn-disconnect';
import { styleMerge } from '../../util/string';
import { P } from '../../state-manager/page/page-state-parser';
import { WalletButtonStyleType } from './common-types';
import { metamaskProviderManager } from '../../wallet/metamask-like-manager';
import { finalize, map } from 'rxjs/operators';
import { Visible } from '../builtin/hidden';
import { AppName, getAppName } from '../../util/app';

type IProps = {
  styleType?: WalletButtonStyleType;
  disableConnection?: boolean;
};
type IState = {
  isMobile: boolean;
  account: string | null;
  curWalletType: Wallet | null;
  isWalletConnected: boolean;
  ethereumProviderExists: Set<EthereumProviderName>;
  ethereumProviderCurrent: EthereumProviderName | null;
  isClosing: boolean;
};

export class ConnectWalletPage extends BaseStateComponent<IProps, IState> {
  state: IState = {
    isMobile: P.Layout.IsMobile.get(),
    curWalletType: null,
    account: null,
    isWalletConnected: true,
    ethereumProviderExists: new Set<EthereumProviderName>(),
    ethereumProviderCurrent: null,
    isClosing: false,
  };

  componentDidMount() {
    this.registerIsMobile('isMobile');
    this.registerObservable('account', walletState.USER_ADDR);
    this.registerObservable('curWalletType', walletState.WALLET_TYPE);
    this.registerObservable('isWalletConnected', walletState.IS_CONNECTED);
    this.registerObservable('ethereumProviderExists', metamaskProviderManager.watchInjectedProviders());
    this.registerObservable(
      'ethereumProviderCurrent',
      metamaskProviderManager.watchCurrentSelected().pipe(map(selected => selected?.name || null))
    );
  }

  componentWillUnmount() {
    this.destroyState();
  }

  onDisconnectWallet() {
    this.updateState({ isClosing: true });

    walletState
      .disconnectWallet(this.state.curWalletType)
      .pipe(
        finalize(() => {
          this.updateState({ isClosing: false });
        })
      )
      .subscribe();
  }

  useDisconnect() {
    return (
      (this.state.curWalletType === Wallet.WalletConnect && this.state.isWalletConnected) ||
      (this.state.curWalletType === Wallet.Metamask &&
        this.state.ethereumProviderCurrent === EthereumProviderName.Coinbase &&
        !this.state.isMobile)
    );
  }

  render() {
    const useDisconnect: boolean = this.useDisconnect();
    // mobile display
    let mobileDefaultProvider: EthereumProviderName = EthereumProviderName.MetaMaskLike;

    if (this.state.ethereumProviderCurrent) {
      if (this.state.ethereumProviderExists.has(this.state.ethereumProviderCurrent)) {
        mobileDefaultProvider = this.state.ethereumProviderCurrent;
      }
    } else {
      if (this.state.ethereumProviderExists.size > 1) {
        for (const one of this.state.ethereumProviderExists) {
          if (one !== EthereumProviderName.MetaMaskLike) {
            mobileDefaultProvider = one;
            break;
          }
        }
      } else if (this.state.ethereumProviderExists.size === 1) {
        mobileDefaultProvider = this.state.ethereumProviderExists.values().next().value;
      }
    }

    const wrapperCss = this.props.styleType === 'popup' && !this.state.isMobile ? styles.wrapperPop : styles.wrapper;
    const gapCss = this.props.styleType === 'union' ? styles.moreGap : '';
    const buttonType: WalletButtonStyleType =
      this.props.styleType === 'popup'
        ? this.state.isMobile
          ? 'normal'
          : 'popup'
        : (this.props.styleType as WalletButtonStyleType);

    const appName: AppName = getAppName();

    return (
      <div className={styleMerge(styles.wrapper, gapCss)}>
        <div className={styleMerge(wrapperCss, gapCss)}>
          {this.state.isMobile ? (
            <>
              <MetamaskButton
                targetProvider={mobileDefaultProvider}
                styleType={buttonType}
                disabled={this.props.disableConnection}
              />
              <WalletConnectButton styleType={buttonType} disabled={this.props.disableConnection} />
            </>
          ) : (
            <>
              <Visible when={this.state.ethereumProviderCurrent === EthereumProviderName.MetaMaskLike}>
                <MetamaskButton
                  targetProvider={EthereumProviderName.MetaMaskLike}
                  styleType={buttonType}
                  disabled={this.props.disableConnection}
                />
              </Visible>

              <MetamaskButton
                targetProvider={EthereumProviderName.MetaMask}
                styleType={buttonType}
                disabled={this.props.disableConnection}
              />
              <WalletConnectButton styleType={buttonType} disabled={this.props.disableConnection} />
              <MetamaskButton
                targetProvider={EthereumProviderName.TrustWallet}
                styleType={buttonType}
                disabled={this.props.disableConnection}
              />
              <MetamaskButton
                targetProvider={EthereumProviderName.Coinbase}
                styleType={buttonType}
                disabled={this.props.disableConnection}
              />
              <MetamaskButton
                targetProvider={EthereumProviderName.BitKeep}
                styleType={buttonType}
                disabled={this.props.disableConnection}
              />
              <MetamaskButton
                targetProvider={EthereumProviderName.OKXWallet}
                styleType={buttonType}
                disabled={this.props.disableConnection}
              />
              <MetamaskButton
                targetProvider={EthereumProviderName.TokenPocket}
                styleType={buttonType}
                disabled={this.props.disableConnection}
              />

              <MetamaskButton
                targetProvider={EthereumProviderName.Coin98}
                styleType={buttonType}
                disabled={this.props.disableConnection}
              />

              <Visible when={appName !== AppName.Stone}>
                <MetamaskButton
                  targetProvider={EthereumProviderName.Onto}
                  styleType={buttonType}
                  disabled={this.props.disableConnection}
                />
                <MetamaskButton
                  targetProvider={EthereumProviderName.MathWallet}
                  styleType={buttonType}
                  disabled={this.props.disableConnection}
                />
                <MetamaskButton
                  targetProvider={EthereumProviderName.SafePal}
                  styleType={buttonType}
                  disabled={this.props.disableConnection}
                />
              </Visible>
            </>
          )}
        </div>

        <div className={styleMerge(styles.wrapper, gapCss)}>
          <AddressButton styleType={buttonType} />

          <Visible when={useDisconnect}>
            <DisconnectButton
              styleType={buttonType}
              pending={this.state.isClosing}
              onClick={this.onDisconnectWallet.bind(this)}
            />
          </Visible>
        </div>
      </div>
    );
  }
}
