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

import { EthereumProviderName } from '../../constant';
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
};

export const WALLET_ICONS_MAP: { [w in EthereumProviderName]: string } = {
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
};
