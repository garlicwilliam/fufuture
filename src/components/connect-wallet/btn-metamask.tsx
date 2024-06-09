import { BaseStateComponent } from '../../state-manager/base-state-component';
import { SelectButton } from '../common/buttons/select-btn';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { walletState } from '../../state-manager/wallet/wallet-state';
import { map } from 'rxjs/operators';
import {
  binance,
  bitget,
  bitizen,
  coin98,
  coinbase,
  gate,
  hyperpay,
  imtoken,
  math,
  metamask,
  okex,
  onekey,
  onto,
  rabby,
  safepal,
  tokenPocket,
  trust,
  WALLET_NAME_MAP,
} from './wallet-icons';

import { P } from '../../state-manager/page/page-state-parser';
import { WalletButtonStyleType } from './common-types';
import MetaMaskOnboarding from '@metamask/onboarding';
import Bowser from 'bowser';
import { ReactNode } from 'react';
import { fontCss } from '../i18n/font-switch';
import { cssPick, styleMerge } from '../../util/string';
import { metamaskProviderManager } from '../../wallet/metamask-like-manager';
import { EthereumProviderName, Wallet } from '../../wallet/define';
import { px } from '../common/svg/util-function';

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
const isBinance: boolean = (window as any).ethereum?.isBinance || false;
const isOneKey: boolean = !!window['$onekye']?.ethereum || false;

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
      walletState.connectToWallet(Wallet.Metamask, { provider: this.props.targetProvider });
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
    } else if (this.props.targetProvider === EthereumProviderName.GateWallet) {
      const chromeUrl = 'https://chromewebstore.google.com/detail/gate-wallet/cpmkedoipcpimgecpmgpldfpohjplkpp';
      const otherUrl = 'https://www.gate.io/zh/web3';
      const browser = this.detectBrowser();
      const url = browser === 'CHROME' ? chromeUrl : otherUrl;

      window.open(url, '_blank');
    } else if (this.props.targetProvider === EthereumProviderName.OneKey) {
      const chromeUrl = 'https://chromewebstore.google.com/detail/onekey/jnmbobjmhlngoefaiojfljckilhhlhcj';
      const edgeUrl = 'https://microsoftedge.microsoft.com/addons/detail/onekey/obffkkagpmohennipjokmpllocnlndac';
      const otherUrl = 'https://onekey.so/download?client=browserExtension';
      const browser = this.detectBrowser();
      const url: string = browser === 'CHROME' ? chromeUrl : browser === 'EDGE' ? edgeUrl : otherUrl;

      window.open(url, '_blank');
    } else if (this.props.targetProvider === EthereumProviderName.Rabby) {
      const chromeUrl: string =
        'https://chromewebstore.google.com/detail/rabby-wallet/acmacodkjbdgmoleebolmdjonilkdbch';
      const otherUrl: string = 'https://rabby.io/';
      const browser = this.detectBrowser();
      const url: string = browser === 'CHROME' ? chromeUrl : otherUrl;

      window.open(url, '_blank');
    }
  }

  private detectBrowser(): 'FIREFOX' | 'CHROME' | 'EDGE' | null {
    const browserInfo = Bowser.parse(window.navigator.userAgent);
    if (browserInfo.browser.name === 'Firefox') {
      return 'FIREFOX';
    } else if (['Chrome', 'Chromium'].includes(browserInfo.browser.name || '')) {
      return 'CHROME';
    } else if (browserInfo.browser.name === 'Edge') {
      return 'EDGE';
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
        return { icon: metamask, name: 'Injected' };
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
      } else if (this.props.targetProvider === EthereumProviderName.GateWallet) {
        return { icon: gate, name: 'Gate Wallet' };
      } else if (this.props.targetProvider === EthereumProviderName.OneKey) {
        return { icon: onekey, name: 'OneKey' };
      } else if (this.props.targetProvider === EthereumProviderName.Rabby) {
        return { icon: rabby, name: 'Rabby' };
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
    } else if (this.props.targetProvider === EthereumProviderName.GateWallet) {
      return { icon: gate, name: 'Gate Wallet' };
    } else if (this.props.targetProvider === EthereumProviderName.Binance) {
      return { icon: binance, name: WALLET_NAME_MAP[EthereumProviderName.Binance] };
    } else if (this.props.targetProvider === EthereumProviderName.OneKey) {
      return { icon: onekey, name: 'OneKey' };
    } else if (this.props.targetProvider === EthereumProviderName.Rabby) {
      return { icon: rabby, name: 'Rabby Wallet' };
    } else if (this.props.targetProvider === EthereumProviderName.MetaMaskLike) {
      if (isBitizen) {
        return { icon: bitizen, name: 'Bitizen' };
      } else if (isOneKey) {
        return { icon: onekey, name: 'OneKey' };
      } else if (isBitKeep) {
        return { icon: bitget, name: 'Bitget Wallet' };
      } else if (isBinance) {
        return { icon: binance, name: 'Binance Web3 Wallet' };
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
      } else if (isTrustWallet) {
        return { icon: trust, name: 'Trust Wallet' };
      } else if (isMetaMask) {
        return { icon: metamask, name: 'MetaMask' };
      } else {
        return { icon: '', name: 'Wallet' };
      }
    }

    return { icon: metamask, name: 'Injected' };
  }

  private messageInstallMetamask(walletName: string): ReactNode {
    const walletDisplay: ReactNode =
      walletName.toLowerCase() === 'metamask' ? (
        <span>
          <span>Meta</span>
          <span>Mask</span>
        </span>
      ) : (
        walletName
      );

    return <span className={styleMerge('install-wallet-name')}>{walletDisplay}</span>;
  }

  private messageSwitchToWallet(walletName: string): ReactNode {
    const walletDisplay: ReactNode =
      walletName.toLowerCase() === 'metamask' ? (
        <span>
          <span>Meta</span>
          <span>Mask</span>
        </span>
      ) : (
        walletName
      );

    return this.state.isWalletActivate ? (
      <div className={styleMerge('wallet-name', cssPick(this.props.styleType === 'popup', fontCss.bold))}>
        {walletDisplay}

        <span className={styleMerge('wallet-active')} />
      </div>
    ) : (
      <div className={'wallet-name'}>{walletDisplay}</div>
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
        {name.toLowerCase() === 'metamask' ? (
          <svg viewBox="0 0 397 355" xmlns="http://www.w3.org/2000/svg">
            <g fill="none" fill-rule="evenodd">
              <path
                d="M113.623 326.195l52.004 13.81v-18.059l4.246-4.25h29.717v36.12h-31.84l-39.269-16.997z"
                fill="#cdbdb2"
              />
              <path
                d="M283.434 326.195l-50.943 13.81v-18.059l-4.246-4.25h-29.717v36.12h31.84l39.269-16.997z"
                fill="#cdbdb2"
              />
              <path
                d="M169.873 286.89l-4.246 35.056 5.307-4.25h55.189l6.368 4.25-4.246-35.056-8.49-5.312-42.453 1.062z"
                fill="#393939"
              />
              <path
                d="M141.217 49.992l25.472 59.49 11.674 173.158h41.392l12.736-173.158 23.349-59.49z"
                fill="#f89c35"
              />
              <path
                d="M29.778 180.657L.061 266.705l74.293-4.249h47.76v-37.181l-2.123-76.487-10.614 8.498z"
                fill="#f89d35"
              />
              <path d="M86.028 190.218l87.029 2.125-9.552 44.617-41.392-10.623z" fill="#d87c30" />
              <path d="M86.028 191.28l36.085 33.995v33.994z" fill="#ea8d3a" />
              <path d="M122.113 226.337l42.453 10.623 13.797 45.68-9.552 5.312-46.698-27.62z" fill="#f89d35" />
              <path d="M122.113 260.331l-8.49 65.864 56.25-39.305z" fill="#eb8f35" />
              <path d="M173.057 192.343l5.306 90.297-15.92-46.21z" fill="#ea8e3a" />
              <path d="M73.292 261.394l48.821-1.063-8.49 65.864z" fill="#d87c30" />
              <path d="M23.41 354.878l90.213-28.683-40.33-64.801L.06 266.705z" fill="#eb8f35" />
              <path d="M166.689 109.482l-45.637 38.243-35.024 42.493 87.029 3.187z" fill="#e8821e" />
              <path
                d="M113.623 326.195l56.25-39.305-4.246 33.994v19.122l-38.207-7.437zM283.434 326.195l-55.189-39.305 4.246 33.994v19.122l38.207-7.437z"
                fill="#dfcec3"
              />
              <path d="M149.708 211.465l11.674 24.433-41.391-10.623z" fill="#393939" />
              <path d="M22.35.062l144.339 109.42-24.41-59.49z" fill="#e88f35" />
              <path
                d="M22.35.062L3.244 58.49l10.613 63.74-7.429 4.249 10.613 9.56-8.49 7.437 11.674 10.623-7.429 6.374 16.981 21.247 79.6-24.434c38.914-31.161 58.018-47.096 57.31-47.804-.707-.709-48.82-37.182-144.339-109.42z"
                fill="#8e5a30"
              />
              <path
                d="M367.278 180.657l29.717 86.048-74.292-4.249h-47.76v-37.181l2.123-76.487 10.613 8.498z"
                fill="#f89d35"
              />
              <path d="M311.028 190.218L224 192.343l9.552 44.617 41.391-10.623z" fill="#d87c30" />
              <path d="M311.028 191.28l-36.085 33.995v33.994z" fill="#ea8d3a" />
              <path d="M274.943 226.337l-42.452 10.623-13.798 45.68 9.552 5.312 46.698-27.62z" fill="#f89d35" />
              <path d="M274.943 260.331l8.491 65.864-55.189-38.243z" fill="#eb8f35" />
              <path d="M224 192.343l-5.307 90.297 15.92-46.21z" fill="#ea8e3a" />
              <path d="M323.764 261.394l-48.82-1.063 8.49 65.864z" fill="#d87c30" />
              <path d="M373.646 354.878l-90.212-28.683 40.33-64.801 73.231 5.311z" fill="#eb8f35" />
              <path d="M230.368 109.482l45.637 38.243 35.023 42.493L224 193.405z" fill="#e8821e" />
              <path d="M247.35 211.465l-11.675 24.433 41.391-10.623z" fill="#393939" />
              <path d="M374.708.062l-144.34 109.42 24.41-59.49z" fill="#e88f35" />
              <path
                d="M374.708.062L393.81 58.49l-10.613 63.74 7.43 4.249-10.614 9.56 8.49 7.437-11.674 10.623 7.43 6.374-16.982 21.247-79.599-24.434c-38.915-31.161-58.019-47.096-57.311-47.804.707-.709 48.82-37.182 144.34-109.42z"
                fill="#8e5a30"
              />
            </g>
          </svg>
        ) : (
          <img alt={name} src={icon} style={{ maxWidth: '20px', maxHeight: '20px', borderRadius: '2px' }} />
        )}
      </div>
    );
  }

  private genBtnIcon(needInstall?: boolean): ReactNode {
    const { icon, name } = this.confirmWalletName();
    const iconSize: number = 40;

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
        {name.toLowerCase() === 'metamask' ? (
          <svg viewBox="0 0 397 355" xmlns="http://www.w3.org/2000/svg">
            <g fill="none" fill-rule="evenodd">
              <path
                d="M113.623 326.195l52.004 13.81v-18.059l4.246-4.25h29.717v36.12h-31.84l-39.269-16.997z"
                fill="#cdbdb2"
              />
              <path
                d="M283.434 326.195l-50.943 13.81v-18.059l-4.246-4.25h-29.717v36.12h31.84l39.269-16.997z"
                fill="#cdbdb2"
              />
              <path
                d="M169.873 286.89l-4.246 35.056 5.307-4.25h55.189l6.368 4.25-4.246-35.056-8.49-5.312-42.453 1.062z"
                fill="#393939"
              />
              <path
                d="M141.217 49.992l25.472 59.49 11.674 173.158h41.392l12.736-173.158 23.349-59.49z"
                fill="#f89c35"
              />
              <path
                d="M29.778 180.657L.061 266.705l74.293-4.249h47.76v-37.181l-2.123-76.487-10.614 8.498z"
                fill="#f89d35"
              />
              <path d="M86.028 190.218l87.029 2.125-9.552 44.617-41.392-10.623z" fill="#d87c30" />
              <path d="M86.028 191.28l36.085 33.995v33.994z" fill="#ea8d3a" />
              <path d="M122.113 226.337l42.453 10.623 13.797 45.68-9.552 5.312-46.698-27.62z" fill="#f89d35" />
              <path d="M122.113 260.331l-8.49 65.864 56.25-39.305z" fill="#eb8f35" />
              <path d="M173.057 192.343l5.306 90.297-15.92-46.21z" fill="#ea8e3a" />
              <path d="M73.292 261.394l48.821-1.063-8.49 65.864z" fill="#d87c30" />
              <path d="M23.41 354.878l90.213-28.683-40.33-64.801L.06 266.705z" fill="#eb8f35" />
              <path d="M166.689 109.482l-45.637 38.243-35.024 42.493 87.029 3.187z" fill="#e8821e" />
              <path
                d="M113.623 326.195l56.25-39.305-4.246 33.994v19.122l-38.207-7.437zM283.434 326.195l-55.189-39.305 4.246 33.994v19.122l38.207-7.437z"
                fill="#dfcec3"
              />
              <path d="M149.708 211.465l11.674 24.433-41.391-10.623z" fill="#393939" />
              <path d="M22.35.062l144.339 109.42-24.41-59.49z" fill="#e88f35" />
              <path
                d="M22.35.062L3.244 58.49l10.613 63.74-7.429 4.249 10.613 9.56-8.49 7.437 11.674 10.623-7.429 6.374 16.981 21.247 79.6-24.434c38.914-31.161 58.018-47.096 57.31-47.804-.707-.709-48.82-37.182-144.339-109.42z"
                fill="#8e5a30"
              />
              <path
                d="M367.278 180.657l29.717 86.048-74.292-4.249h-47.76v-37.181l2.123-76.487 10.613 8.498z"
                fill="#f89d35"
              />
              <path d="M311.028 190.218L224 192.343l9.552 44.617 41.391-10.623z" fill="#d87c30" />
              <path d="M311.028 191.28l-36.085 33.995v33.994z" fill="#ea8d3a" />
              <path d="M274.943 226.337l-42.452 10.623-13.798 45.68 9.552 5.312 46.698-27.62z" fill="#f89d35" />
              <path d="M274.943 260.331l8.491 65.864-55.189-38.243z" fill="#eb8f35" />
              <path d="M224 192.343l-5.307 90.297 15.92-46.21z" fill="#ea8e3a" />
              <path d="M323.764 261.394l-48.82-1.063 8.49 65.864z" fill="#d87c30" />
              <path d="M373.646 354.878l-90.212-28.683 40.33-64.801 73.231 5.311z" fill="#eb8f35" />
              <path d="M230.368 109.482l45.637 38.243 35.023 42.493L224 193.405z" fill="#e8821e" />
              <path d="M247.35 211.465l-11.675 24.433 41.391-10.623z" fill="#393939" />
              <path d="M374.708.062l-144.34 109.42 24.41-59.49z" fill="#e88f35" />
              <path
                d="M374.708.062L393.81 58.49l-10.613 63.74 7.43 4.249-10.614 9.56 8.49 7.437-11.674 10.623 7.43 6.374-16.982 21.247-79.599-24.434c-38.915-31.161-58.019-47.096-57.311-47.804.707-.709 48.82-37.182 144.34-109.42z"
                fill="#8e5a30"
              />
            </g>
          </svg>
        ) : (
          <img alt={''} src={icon} style={{ maxWidth: px(iconSize), maxHeight: px(iconSize), borderRadius: '4px' }} />
        )}
      </div>
    );
  }

  render() {
    const hidden: boolean = this.state.isMobile && !this.state.isProviderExist;
    const { icon, name } = this.confirmWalletName();
    const content: ReactNode = !this.state.isProviderExist
      ? this.messageInstallMetamask(name)
      : this.messageSwitchToWallet(name);

    const iconNode: ReactNode =
      this.props.styleType === 'popup' ? this.genBtnIcon(!this.state.isProviderExist) : this.genIcon();

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
