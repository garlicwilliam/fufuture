import { BaseStateComponent } from '../../state-manager/base-state-component';
import { MetamaskButton } from './btn-metamask';
import { WalletConnectButton } from './btn-wallet-select';
import { AddressButton } from './btn-address';
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
import * as _ from 'lodash';
import { DeeplinkButton } from './btn-deeplink';
import {
  EthereumProviderName,
  SldWalletId,
  Wallet,
  WalletConnectWalletInfo,
  WalletConnectWalletName,
} from '../../wallet/define';

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

  getWalletProviderList(): { wallets: EthereumProviderName[]; existsSize: number } {
    const wallets: EthereumProviderName[] = [
      EthereumProviderName.MetaMask,
      EthereumProviderName.TrustWallet,
      EthereumProviderName.Coinbase,
      EthereumProviderName.BitKeep,
      EthereumProviderName.OKXWallet,
      EthereumProviderName.TokenPocket,
      EthereumProviderName.Coin98,
      EthereumProviderName.GateWallet,
    ];

    if (getAppName() === AppName.ShieldTrade) {
      wallets.push(...[EthereumProviderName.Onto, EthereumProviderName.MathWallet, EthereumProviderName.SafePal]);
    }

    if (this.state.ethereumProviderExists.size > 0) {
      wallets.sort((a, b) => {
        const old: number = wallets.indexOf(a) - wallets.indexOf(b);
        const hasA: boolean = this.state.ethereumProviderExists.has(a);
        const hasB: boolean = this.state.ethereumProviderExists.has(b);

        if (hasA && hasB) return old;
        if (hasA) return -1;
        if (hasB) return 1;

        return old;
      });
    }

    const existsSize: number = _.intersection(Array.from(this.state.ethereumProviderExists), wallets).length;

    return { wallets, existsSize };
  }

  getWalletLists(): SldWalletId[] {
    const { wallets, existsSize } = this.getWalletProviderList();

    const walletIds: SldWalletId[] = wallets.map(provider => {
      return { wallet: Wallet.Metamask, id: provider };
    });

    const wcIds: SldWalletId[] = [
      { wallet: Wallet.WalletConnect, id: WalletConnectWalletName.WalletConnect },
      { wallet: Wallet.WalletConnect, id: WalletConnectWalletName.Binance },
    ];

    walletIds.splice(existsSize, 0, ...wcIds);

    return walletIds;
  }

  confirmMobileProvider(): EthereumProviderName | null {
    let mobileDefaultProvider: EthereumProviderName | null = null;
    if (this.state.ethereumProviderExists.size > 0) {
      const exists = Array.from(this.state.ethereumProviderExists.values());
      mobileDefaultProvider = exists.find(one => one !== EthereumProviderName.MetaMaskLike) || exists[0];
    }

    return mobileDefaultProvider;
  }

  render() {
    const useDisconnect: boolean = this.useDisconnect();
    // mobile display
    const mobileDefaultProvider: EthereumProviderName | null = this.confirmMobileProvider();

    const wrapperCss = this.props.styleType === 'popup' && !this.state.isMobile ? styles.wrapperPop : styles.wrapper;
    const gapCss = this.props.styleType === 'union' ? styles.moreGap : '';
    const buttonType: WalletButtonStyleType =
      this.props.styleType === 'popup'
        ? this.state.isMobile
          ? 'normal'
          : 'popup'
        : (this.props.styleType as WalletButtonStyleType);

    const wallets: SldWalletId[] = this.getWalletLists();

    return (
      <div className={styleMerge(styles.wrapper, gapCss)}>
        <div className={styleMerge(wrapperCss, gapCss)}>
          {this.state.isMobile ? (
            <>
              {mobileDefaultProvider ? (
                <MetamaskButton
                  targetProvider={mobileDefaultProvider}
                  styleType={buttonType}
                  disabled={this.props.disableConnection}
                />
              ) : (
                <>
                  <DeeplinkButton name={EthereumProviderName.MetaMask} />
                  <Visible when={getAppName() === AppName.Stone || getAppName() === AppName.StoneOmni}>
                    <DeeplinkButton name={WalletConnectWalletName.Binance} />
                  </Visible>
                </>
              )}

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

              {wallets.map((walletId: SldWalletId) => {
                return walletId.wallet === Wallet.Metamask ? (
                  <MetamaskButton
                    key={walletId.id}
                    targetProvider={walletId.id as EthereumProviderName}
                    styleType={buttonType}
                    disabled={this.props.disableConnection}
                  />
                ) : (
                  <WalletConnectButton
                    key={walletId.id}
                    walletInfo={WalletConnectWalletInfo[walletId.id]}
                    styleType={buttonType}
                    disabled={this.props.disableConnection}
                  />
                );
              })}
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
