import { WcWalletInfo } from '../services/wc-modal/wc-modal.service';
import binance from '../assets/imgs/wallet/binance.svg';

export enum Wallet {
  Metamask = 'Metamask',
  WalletConnect = 'Wallet Connect',
  SafeWallet = 'SafeWallet',
}

export enum EthereumProviderName {
  MetaMask = 'MetaMask',
  BitKeep = 'BitKeep',
  Binance = 'Binance',
  Coinbase = 'Coinbase',
  HyperPay = 'HyperPay',
  Onto = 'Onto',
  TokenPocket = 'TokenPocket',
  MathWallet = 'MathWallet',
  OKXWallet = 'OKX Wallet',
  Bitizen = 'Bitizen',
  ImToken = 'imToken',
  SafePal = 'SafePal',
  TrustWallet = 'TrustWallet',
  Coin98 = 'Coin98',
  GateWallet = 'Gate Wallet',

  MetaMaskLike = 'MetaMaskLike', // Not Include bitKeep,
}

export enum WalletConnectWalletName {
  WalletConnect = 'WalletConnect',
  Binance = 'BinanceWeb3Wallet',
}

export type SldWalletId = {
  wallet: Wallet;
  id: EthereumProviderName | WalletConnectWalletName;
};

export const EthereumProviderUUIDtoName: { [k: string]: EthereumProviderName } = {
  'coin98.com': EthereumProviderName.Coin98,
  'io.metamask': EthereumProviderName.MetaMask,
  'com.trustwallet.app': EthereumProviderName.TrustWallet,
  'pro.tokenpocket': EthereumProviderName.TokenPocket,
  'com.bitget.web3': EthereumProviderName.BitKeep,
  'io.gate.wallet': EthereumProviderName.GateWallet,
  'com.okex.wallet': EthereumProviderName.OKXWallet,
  'https://www.safepal.com/download': EthereumProviderName.SafePal,
  'com.coinbase.wallet': EthereumProviderName.Coinbase,
};

export const WalletConnectWalletInfo: { [w in WalletConnectWalletName]: WcWalletInfo | null } = {
  [WalletConnectWalletName.WalletConnect]: null,
  [WalletConnectWalletName.Binance]: {
    name: 'Binance Web3 Wallet',
    nameShort: 'Binance',
    icon: binance,
    download: {
      ios: 'https://apps.apple.com/US/app/id1436799971',
      android: 'https://play.google.com/store/apps/details?id=com.binance.dev',
    },
    uri: '',
    peer: {
      name: 'Binance',
      url: 'binance.com',
    },
  },
};

export function checkRegisteredWalletConnectPeer(peer: { name: string; url: string }): boolean {
  const keys: string[] = Object.keys(WalletConnectWalletInfo);
  const has: boolean = keys.some((key: string) => {
    const info: WcWalletInfo = WalletConnectWalletInfo[key as WalletConnectWalletName] as WcWalletInfo;

    if (!info) {
      return false;
    }

    if (
      (info && peer.name.toLowerCase().indexOf(info.peer.name.toLowerCase()) >= 0) ||
      peer.url.toLowerCase().indexOf(info.peer.url.toLowerCase()) >= 0
    ) {
      return true;
    }
  });

  return has;
}

export function checkIsMatchWalletInfo(peer: { name: string; url: string }, info: WcWalletInfo): boolean {
  return (
    peer.name.toLowerCase().indexOf(info.peer.name.toLowerCase()) >= 0 ||
    peer.url.toLowerCase().indexOf(info.peer.url.toLowerCase()) >= 0
  );
}
