import { BigNumber } from 'ethers';
import { WcWalletInfo } from '../services/wc-modal/wc-modal.service';
import binance from '../assets/imgs/wallet/binance.svg';

export enum Wallet {
  Metamask = 'Metamask',
  WalletConnect = 'Wallet Connect',
}

export enum EthereumProviderName {
  MetaMask = 'MetaMask',
  BitKeep = 'BitKeep',
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
  },
};

export enum Language {
  En = 'en',
  Ru = 'ru',
  Vi = 'vi',
  Ko = 'ko',
  Ja = 'ja',
  Zh = 'zh',
  ZhHk = 'zhHK',
}

export enum DexType {
  UNI = 'UNI',
  CAKE = 'PancakeSwap',
  IZUMI = 'iZUMi',
}

export const MAX_UINT_256 = BigNumber.from('0x' + new Array(64).fill('f').join(''));
export const DECIMAL18 = 18;
export const E18 = BigNumber.from('1000000000000000000');
export const Q192 = BigNumber.from(2).pow(192);
export const EMPTY_ADDRESS = '0x0000000000000000000000000000000000000000';
export const ZERO = BigNumber.from(0);
export const ETH_DECIMAL = DECIMAL18;
export const STONE_DECIMAL = DECIMAL18;

export const RESPONSIVE_MOBILE = 768;
export const RESPONSIVE_MOBILE_MINI = 350;
export const RESPONSIVE_NARROW = 900;
