import { BaseStateComponent } from '../../state-manager/base-state-component';
import { SelectButton } from '../common/buttons/select-btn';
import { EthereumProviderName, Wallet } from '../../constant';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { walletState } from '../../state-manager/wallet/wallet-state';
import { map } from 'rxjs/operators';
import {
  bitget,
  bitizen,
  coin98,
  coinbase,
  hyperpay,
  imtoken,
  math,
  metamask,
  okex,
  onto,
  safepal,
  tokenPocket,
  trust,
} from './wallet-icons';

import { P } from '../../state-manager/page/page-state-parser';
import { i18n } from '../i18n/i18n-fn';
import { WalletButtonStyleType } from './common-types';
import MetaMaskOnboarding from '@metamask/onboarding';
import Bowser from 'bowser';
import { ReactNode } from 'react';
import { fontCss } from '../i18n/font-switch';
import { cssPick } from '../../util/string';
import { metamaskProviderManager } from '../../wallet/metamask-like-manager';

const isImToken: boolean = (window as any).ethereum?.isImToken || false;
const isMetaMask: boolean = (window as any).ethereum?.isMetaMask || false;
const isTrustWallet: boolean = (window as any).ethereum?.isTrust || false;
const isMathWallet: boolean = (window as any).ethereum?.isMathWallet || false;
const isCoin98: boolean = (window as any).coin98?.provider?.isCoin98 || false;
const isBitKeep: boolean = (window as any).ethereum?.isBitKeep || false;
const isCoinBase: boolean =
  (window as any).ethereum?.isCoinbaseWallet || (window as any).ethereum?.selectedProvider?.isCoinbaseWallet;
const isHyperPay: boolean = !!(window as any).hiWallet || !!(window as any).isHyperPay || false;
const isOnto: boolean = !!(window as any).onto || (window as any).ethereum?.isONTO;
const isTokenPocket: boolean = (window as any).ethereum?.isTokenPocket || false;
const isOKXWallet: boolean = (window as any).okexchain?.isOKExWallet || false;
const isBitizen: boolean = (window as any).ethereum?.isBitizen || false;
const isSafePal: boolean = (window as any).ethereum?.isSafePal || false;

type IProps = {
  targetProvider: EthereumProviderName;
  onClick?: (wallet: Wallet) => void;
  styleType?: WalletButtonStyleType;
  disabled?: boolean;
};

type IState = {
  isProviderExist: boolean;
  isWalletSelected: boolean;
  isWalletActivate: boolean;
  isMobile: boolean;
};

export class MetamaskButton extends BaseStateComponent<IProps, IState> {
  state: IState = {
    isProviderExist: false,
    isWalletSelected: false,
    isWalletActivate: false,

    isMobile: P.Layout.IsMobile.get(),
  };

  private thisTargetProvider = new BehaviorSubject<EthereumProviderName>(this.props.targetProvider);

  componentDidMount() {
    this.registerIsMobile('isMobile');
    this.registerObservable('isWalletActivate', this.mergeMetamaskActive());
    this.registerObservable('isProviderExist', this.mergeProviderExist());
  }

  componentWillUnmount() {
    this.thisTargetProvider.complete();
    this.destroyState();
  }

  componentDidUpdate(prevProps: Readonly<IProps>, prevState: Readonly<IState>, snapshot?: any) {
    if (prevProps.targetProvider !== this.props.targetProvider) {
      this.thisTargetProvider.next(this.props.targetProvider);
    }
  }

  mergeMetamaskActive(): Observable<boolean> {
    const current$ = metamaskProviderManager.watchCurrentSelected().pipe(map(selected => selected?.name));
    const target$ = this.thisTargetProvider;
    const sameProvider$ = combineLatest([current$, target$]).pipe(
      map(([current, target]) => {
        return current === target;
      })
    );

    return combineLatest([walletState.WALLET_TYPE, walletState.IS_CONNECTED, sameProvider$]).pipe(
      map(([wallet, isConnected, isSame]) => {
        return wallet === Wallet.Metamask && isConnected && isSame;
      })
    );
  }

  mergeProviderExist(): Observable<boolean> {
    const target$ = this.thisTargetProvider;
    const exists$ = metamaskProviderManager.watchInjectedProviders();

    return combineLatest([target$, exists$]).pipe(
      map(([target, exists]) => {
        return exists.has(target);
      })
    );
  }

  onClickBtn() {
    if (this.state.isProviderExist) {
      walletState.connectToWallet(Wallet.Metamask, this.props.targetProvider);
    } else {
      this.onInstallEthereumProvider();
    }
  }

  onInstallEthereumProvider() {
    if (this.props.targetProvider === EthereumProviderName.SafePal) {
      const chromeUrl =
        'https://chrome.google.com/webstore/detail/safepal-extension-wallet/lgmpcpglpngdoalbgeoldeajfclnhafa';
      const firefoxUrl = 'https://addons.mozilla.org/en-US/firefox/addon/safepal-extension-wallet';
      const otherUrl = 'https://www.safepal.com/extension';

      const type = this.detectBrowser();
      const url = type === 'CHROME' ? chromeUrl : type === 'FIREFOX' ? firefoxUrl : otherUrl;
      window.open(url, '_blank');
    } else if (this.props.targetProvider === EthereumProviderName.MetaMask) {
      const boarding = new MetaMaskOnboarding({
        forwarderMode: 'INJECT',
      });
      boarding.startOnboarding();
    } else if (this.props.targetProvider === EthereumProviderName.BitKeep) {
      const chromeUrl =
        'https://chrome.google.com/webstore/detail/bitget-wallet-formerly-bi/jiidiaalihmmhddjgbnbgdfflelocpak';
      const otherUrl = 'https://web3.bitget.com/en/wallet-download';

      const url = this.detectBrowser() === 'CHROME' ? chromeUrl : otherUrl;
      window.open(url, '_blank');
    } else if (this.props.targetProvider === EthereumProviderName.Coinbase) {
      const chromeUrl =
        'https://chrome.google.com/webstore/detail/coinbase-wallet-extension/hnfanknocfeofbddgcijnmhnfnkdnaad';
      const otherUrl = 'https://www.coinbase.com/wallet';

      const url = this.detectBrowser() === 'CHROME' ? chromeUrl : otherUrl;
      window.open(url, '_blank');
    } else if (this.props.targetProvider === EthereumProviderName.Onto) {
      const chromeUrl = 'https://chrome.google.com/webstore/detail/onto-wallet/ifckdpamphokdglkkdomedpdegcjhjdp';
      const otherUrl = 'https://onto.app/zh/download/?mode=extension';

      const url = this.detectBrowser() === 'CHROME' ? chromeUrl : otherUrl;
      window.open(url, '_blank');
    } else if (this.props.targetProvider === EthereumProviderName.TokenPocket) {
      const chromeUrl =
        'https://chrome.google.com/webstore/detail/tokenpocket/mfgccjchihfkkindfppnaooecgfneiii/related';
      const otherUrl = 'https://extension.tokenpocket.pro/';

      const url = this.detectBrowser() ? chromeUrl : otherUrl;
      window.open(url, '_blank');
    } else if (this.props.targetProvider === EthereumProviderName.MathWallet) {
      const chromeUrl = 'https://chrome.google.com/webstore/detail/math-wallet/afbcbjpbpfadlkmhmclhkeeodmamcflc';
      const otherUrl = 'https://mathwallet.org';

      const url = this.detectBrowser() ? chromeUrl : otherUrl;
      window.open(url, '_blank');
    } else if (this.props.targetProvider === EthereumProviderName.OKXWallet) {
      const chromeUrl = 'https://chrome.google.com/webstore/detail/okx-wallet/mcohilncbfahbmgdjkbpemcciiolgcge';
      const firefoxUrl = 'https://addons.mozilla.org/zh-CN/firefox/addon/okexwallet/';
      const otherUrl = 'https://www.okx.com/web3';
      const browser = this.detectBrowser();
      const url = browser === 'CHROME' ? chromeUrl : browser === 'FIREFOX' ? firefoxUrl : otherUrl;

      window.open(url, '_blank');
    } else if (this.props.targetProvider === EthereumProviderName.TrustWallet) {
      const chromeUrl = 'https://chrome.google.com/webstore/detail/trust-wallet/egjidjbpglichdcondbcbdnbeeppgdph';
      const otherUrl = 'https://trustwallet.com/browser-extension';
      const browser = this.detectBrowser();
      const url = browser === 'CHROME' ? chromeUrl : otherUrl;

      window.open(url, '_blank');
    } else if (this.props.targetProvider === EthereumProviderName.Coin98) {
      const chromeUrl = 'https://chromewebstore.google.com/detail/coin98-wallet/aeachknmefphepccionboohckonoeemg';
      const otherUrl = 'https://coin98.com/wallet';
      const browser = this.detectBrowser();
      const url = browser === 'CHROME' ? chromeUrl : otherUrl;

      window.open(url, '_blank');
    }
  }

  private detectBrowser(): 'FIREFOX' | 'CHROME' | null {
    const browserInfo = Bowser.parse(window.navigator.userAgent);
    if (browserInfo.browser.name === 'Firefox') {
      return 'FIREFOX';
    } else if (['Chrome', 'Chromium'].includes(browserInfo.browser.name || '')) {
      return 'CHROME';
    }

    return null;
  }

  private confirmWalletName(): { icon: string; name: string } {
    // for install Chrome extension
    if (!this.state.isProviderExist) {
      if (this.props.targetProvider === EthereumProviderName.MetaMask) {
        return { icon: metamask, name: 'MetaMask' };
      } else if (this.props.targetProvider === EthereumProviderName.Bitizen) {
        return { icon: bitizen, name: 'Bitizen' };
      } else if (this.props.targetProvider === EthereumProviderName.SafePal) {
        return { icon: safepal, name: 'SafePal' };
      } else if (this.props.targetProvider === EthereumProviderName.ImToken) {
        return { icon: imtoken, name: 'imToken' };
      } else if (this.props.targetProvider === EthereumProviderName.BitKeep) {
        return { icon: bitget, name: 'Bitget Wallet' };
      } else if (this.props.targetProvider === EthereumProviderName.MetaMaskLike) {
        return { icon: metamask, name: 'MetaMask' };
      } else if (this.props.targetProvider === EthereumProviderName.Onto) {
        return { icon: onto, name: 'ONTO Wallet' };
      } else if (this.props.targetProvider === EthereumProviderName.TokenPocket) {
        return { icon: tokenPocket, name: 'TokenPocket' };
      } else if (this.props.targetProvider === EthereumProviderName.MathWallet) {
        return { icon: math, name: 'MathWallet' };
      } else if (this.props.targetProvider === EthereumProviderName.OKXWallet) {
        return { icon: okex, name: 'OKX Wallet' };
      } else if (this.props.targetProvider === EthereumProviderName.TrustWallet) {
        return { icon: trust, name: 'Trust Wallet' };
      } else if (this.props.targetProvider === EthereumProviderName.Coin98) {
        return { icon: coin98, name: 'Coin98' };
      }
    }

    // for partner wallet
    if (this.props.targetProvider === EthereumProviderName.Bitizen) {
      return { icon: bitizen, name: 'Bitizen' };
    } else if (this.props.targetProvider === EthereumProviderName.ImToken) {
      return { icon: imtoken, name: 'imToken' };
    } else if (this.props.targetProvider === EthereumProviderName.SafePal) {
      return { icon: safepal, name: 'SafePal' };
    } else if (this.props.targetProvider === EthereumProviderName.BitKeep) {
      return { icon: bitget, name: 'Bitget Wallet' };
    } else if (this.props.targetProvider === EthereumProviderName.MetaMask) {
      return { icon: metamask, name: 'MetaMask' };
    } else if (this.props.targetProvider === EthereumProviderName.Coinbase) {
      return { icon: coinbase, name: 'Coinbase Wallet' };
    } else if (this.props.targetProvider === EthereumProviderName.HyperPay) {
      return { icon: hyperpay, name: 'HyperPay' };
    } else if (this.props.targetProvider === EthereumProviderName.Onto) {
      return { icon: onto, name: 'ONTO Wallet' };
    } else if (this.props.targetProvider === EthereumProviderName.TokenPocket) {
      return { icon: tokenPocket, name: 'TokenPocket' };
    } else if (this.props.targetProvider === EthereumProviderName.MathWallet) {
      return { icon: math, name: 'MathWallet' };
    } else if (this.props.targetProvider === EthereumProviderName.OKXWallet) {
      return { icon: okex, name: 'OKX Wallet' };
    } else if (this.props.targetProvider === EthereumProviderName.TrustWallet) {
      return { icon: trust, name: 'Trust Wallet' };
    } else if (this.props.targetProvider === EthereumProviderName.Coin98) {
      return { icon: coin98, name: 'Coin98' };
    } else if (this.props.targetProvider === EthereumProviderName.MetaMaskLike) {
      if (isBitizen) {
        return { icon: bitizen, name: 'Bitizen' };
      } else if (isBitKeep) {
        return { icon: bitget, name: 'Bitget Wallet' };
      } else if (isSafePal) {
        return { icon: safepal, name: 'SafePal' };
      } else if (isImToken) {
        return { icon: imtoken, name: 'imToken' };
      } else if (isCoinBase) {
        return { icon: coinbase, name: 'Coinbase Wallet' };
      } else if (isHyperPay) {
        return { icon: hyperpay, name: 'HyperPay' };
      } else if (isTokenPocket) {
        return { icon: tokenPocket, name: 'TokenPocket' };
      } else if (isMathWallet) {
        return { icon: math, name: 'MathWallet' };
      } else if (isOKXWallet) {
        return { icon: okex, name: 'OKX Wallet' };
      } else if (isCoin98) {
        return { icon: coin98, name: 'Coin98' };
      } else if (isOnto) {
        return { icon: onto, name: 'ONTO Wallet' };
      } else if (isMetaMask) {
        return { icon: metamask, name: 'MetaMask' };
      } else if (isTrustWallet) {
        return { icon: trust, name: 'Trust Wallet' };
      } else {
        return { icon: '', name: 'Wallet' };
      }
    }

    return { icon: metamask, name: 'MetaMask' };
  }

  private messageInstallMetamask(walletName: string): ReactNode {
    return (
      <span className={cssPick(this.props.styleType === 'popup', fontCss.bold)}>
        {i18n('com-install-wallet', { wallet: walletName })}
      </span>
    );
  }

  private messageSwitchToWallet(walletName: string): ReactNode {
    return this.state.isWalletActivate ? (
      <span className={cssPick(this.props.styleType === 'popup', fontCss.bold)}>
        {walletName + ' (' + i18n('com-connected') + ')'}
      </span>
    ) : (
      <span className={cssPick(this.props.styleType === 'popup', fontCss.bold)}>{walletName}</span>
    );
  }

  private genIcon(): ReactNode {
    const { icon, name } = this.confirmWalletName();

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
        <img alt={name} src={icon} style={{ maxWidth: '20px', maxHeight: '20px', borderRadius: '2px' }} />
      </div>
    );
  }

  private genBtnIcon(): ReactNode {
    const { icon, name } = this.confirmWalletName();
    return (
      <div
        style={{
          lineHeight: '0px',
          width: '32px',
          height: '32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <img alt={name} src={icon} style={{ maxWidth: '32px', maxHeight: '32px', borderRadius: '2px' }} />
      </div>
    );
  }

  render() {
    const hidden: boolean = this.state.isMobile && !this.state.isProviderExist;
    const { icon, name } = this.confirmWalletName();
    const content: ReactNode = !this.state.isProviderExist
      ? this.messageInstallMetamask(name)
      : this.messageSwitchToWallet(name);

    const iconNode = this.props.styleType === 'popup' ? this.genBtnIcon() : this.genIcon();

    return hidden ? null : (
      <SelectButton
        isActivate={this.state.isWalletActivate}
        isSelected={this.state.isWalletSelected}
        onClick={this.onClickBtn.bind(this)}
        styleType={this.props.styleType}
        disabled={this.props.disabled}
      >
        {icon ? iconNode : <span />}
        {content}
      </SelectButton>
    );
  }
}
