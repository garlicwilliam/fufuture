import metamask from '../../assets/imgs/wallet/metamask.svg';
import imtoken from '../../assets/imgs/wallet/imtoken.svg';
import trust from '../../assets/imgs/wallet/trust-wallet.svg';
import math from '../../assets/imgs/wallet/math-wallet.svg';
import coin98 from '../../assets/imgs/wallet/coin98.svg';
import tokenPocket from '../../assets/imgs/wallet/token-pocket.svg';
import bitKeep from '../../assets/imgs/wallet/bitkeep.svg';
import bitget from '../../assets/imgs/wallet/bitget-wallet.svg';
import coinbase from '../../assets/imgs/wallet/coinbase.svg';
import hyperpay from '../../assets/imgs/wallet/hyperpay.svg';
import onto from '../../assets/imgs/wallet/onto.svg';
import okex from '../../assets/imgs/wallet/okex.svg';
import walletconnect from '../../assets/imgs/wallet/wallet-connect.svg';
import bitizen from '../../assets/imgs/wallet/bitizen.svg';
import safepal from '../../assets/imgs/wallet/safepal.svg';
import gate from '../../assets/imgs/wallet/gatewallet.svg';
import safe from '../../assets/imgs/wallet/safe.svg';
import binance from '../../assets/imgs/wallet/binance.svg';
import binance2 from '../../assets/imgs/wallet/binance2.svg';

import { ReactNode } from 'react';
import { EthereumProviderName, WalletConnectWalletInfo, WalletConnectWalletName } from '../../wallet/define';
export {
  metamask,
  imtoken,
  trust,
  math,
  coin98,
  tokenPocket,
  bitKeep,
  coinbase,
  hyperpay,
  onto,
  okex,
  walletconnect,
  bitizen,
  safepal,
  bitget,
  gate,
  safe,
  binance,
  binance2,
};

export const WALLET_ICONS_MAP: { [w in EthereumProviderName | WalletConnectWalletName]: string } = {
  [EthereumProviderName.MetaMask]: metamask,
  [EthereumProviderName.MathWallet]: math,
  [EthereumProviderName.BitKeep]: bitget,
  [EthereumProviderName.Onto]: onto,
  [EthereumProviderName.Coinbase]: coinbase,
  [EthereumProviderName.HyperPay]: hyperpay,
  [EthereumProviderName.TokenPocket]: tokenPocket,
  [EthereumProviderName.OKXWallet]: okex,
  [EthereumProviderName.MetaMaskLike]: metamask,
  [EthereumProviderName.Bitizen]: bitizen,
  [EthereumProviderName.ImToken]: imtoken,
  [EthereumProviderName.SafePal]: safepal,
  [EthereumProviderName.TrustWallet]: trust,
  [EthereumProviderName.Coin98]: coin98,
  [EthereumProviderName.GateWallet]: gate,
  [EthereumProviderName.Binance]: binance2,
  [WalletConnectWalletName.Binance]: binance,
  [WalletConnectWalletName.WalletConnect]: walletconnect,
};

export const WALLET_NAME_MAP: { [w in EthereumProviderName | WalletConnectWalletName]: string } = {
  [EthereumProviderName.MetaMask]: 'MetaMask',
  [EthereumProviderName.MathWallet]: 'Math Wallet',
  [EthereumProviderName.BitKeep]: 'Bitget Wallet',
  [EthereumProviderName.Onto]: 'Onto Wallet',
  [EthereumProviderName.Coinbase]: 'Coinbase Wallet',
  [EthereumProviderName.HyperPay]: 'HyperPay',
  [EthereumProviderName.TokenPocket]: 'TokenPocket',
  [EthereumProviderName.OKXWallet]: 'OKX Wallet',
  [EthereumProviderName.MetaMaskLike]: 'MetaMask',
  [EthereumProviderName.Bitizen]: 'Bitizen',
  [EthereumProviderName.ImToken]: 'ImToken',
  [EthereumProviderName.SafePal]: 'SafePal',
  [EthereumProviderName.TrustWallet]: 'Trust Wallet',
  [EthereumProviderName.Coin98]: 'Coin98 Wallet',
  [EthereumProviderName.GateWallet]: 'Gate Wallet',
  [EthereumProviderName.Binance]: 'Binance Web3 Wallet',
  [WalletConnectWalletName.Binance]:
    WalletConnectWalletInfo[WalletConnectWalletName.Binance]?.name || 'Binance Web3 Wallet',
  [WalletConnectWalletName.WalletConnect]: 'Wallet Connect',
};

export function iconNode(name: EthereumProviderName | WalletConnectWalletName): ReactNode {
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
        alt={WALLET_NAME_MAP[name]}
        src={WALLET_ICONS_MAP[name]}
        style={{ maxWidth: '20px', maxHeight: '20px', borderRadius: '2px' }}
      />
    </div>
  );
}
