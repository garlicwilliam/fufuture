import { EthereumProviderName } from '../constant';
import { Observable, of } from 'rxjs';
import { EthereumProviderInterface } from './metamask-like-types';
import { filter } from 'rxjs/operators';
declare const window: Window & { ethereum: any } & any;

function checkEthereum(checkField: string, not?: string[]): boolean {
  return !!window.ethereum && window.ethereum[checkField] && !(not || []).some(one => !!window.ethereum[one]);
}

function checkEthereumProviders(checkField: string, not?: string[]): boolean {
  if (!window.ethereum || !window.ethereum.providers) {
    return false;
  }

  const find: any[] = (window.ethereum?.providers || [])
    .filter(provider => !!provider[checkField])
    .filter(provider => !(not || []).some(one => provider[one]));

  return find.length > 0;
}

function getEthereum(checkField: string, not?: string[]): EthereumProviderInterface | null {
  if (checkEthereum(checkField, not)) {
    return window.ethereum;
  } else {
    return null;
  }
}

function getEthereumProviders(checkField: string, not?: string[]): EthereumProviderInterface | null {
  if (!window.ethereum || !window.ethereum.providers) {
    return null;
  }

  const find = window.ethereum.providers.find(
    provider => !!provider[checkField] && !(not || []).some(one => !!provider[one])
  );

  return find || null;
}

function checkWalletInjection(checkField: string, not?: string[]): boolean {
  let isExist: boolean = checkEthereum(checkField, not);
  if (!isExist) {
    isExist = checkEthereumProviders(checkField, not);
  }

  return isExist;
}

function findWalletInjection(checkField: string, not?: string[]): EthereumProviderInterface | null {
  let provider = getEthereum(checkField, not);
  if (!provider) {
    provider = getEthereumProviders(checkField, not);
  }

  return provider;
}

const nonMetaMaskFields = [
  'isImToken',
  'isBitKeep',
  'isCoinbaseWallet',
  'isTokenPocket',
  'isMathWallet',
  'isOKExWallet',
  'isSafePal',
  'isTrust',
  'isONTO',
];

export const ProviderExistDetectors: { [key in EthereumProviderName]: () => boolean } = {
  [EthereumProviderName.MetaMask]: () => {
    return checkWalletInjection('isMetaMask', nonMetaMaskFields);
  },
  [EthereumProviderName.BitKeep]: () => !!window?.bitkeep && !!window.bitkeep.ethereum?.isBitKeep,
  [EthereumProviderName.MetaMaskLike]: () => !!window.ethereum,
  [EthereumProviderName.Coinbase]: () => {
    return checkWalletInjection('isCoinbaseWallet');
  },
  [EthereumProviderName.HyperPay]: () => {
    return !!window.hiWallet;
  },
  [EthereumProviderName.Onto]: () => {
    return !!window.onto || checkWalletInjection('isONTO');
  },
  [EthereumProviderName.TokenPocket]: () => {
    return checkWalletInjection('isTokenPocket', ['isTrust']);
  },
  [EthereumProviderName.MathWallet]: () => {
    return checkWalletInjection('isMathWallet');
  },
  [EthereumProviderName.OKXWallet]: () => {
    return (
      !!(window.okexchain && window.okexchain.isOKExWallet) || checkWalletInjection('isOKExWallet', ['isMathWallet'])
    );
  },
  [EthereumProviderName.Bitizen]: () => {
    return checkWalletInjection('isBtitzen');
  },
  [EthereumProviderName.ImToken]: () => {
    return checkWalletInjection('isImToken');
  },
  [EthereumProviderName.SafePal]: () => {
    return checkWalletInjection('isSafePal');
  },
  [EthereumProviderName.TrustWallet]: () => {
    return !!window.trustWallet || checkWalletInjection('isTrust', ['isTokenPocket']);
  },
};

export const ProviderGetters: { [key in EthereumProviderName]: () => Observable<EthereumProviderInterface> } = {
  [EthereumProviderName.MetaMask]: () => {
    return of(findWalletInjection('isMetaMask', nonMetaMaskFields)).pipe(filter(Boolean));
  },
  [EthereumProviderName.BitKeep]: () => of(window?.bitkeep?.ethereum),
  [EthereumProviderName.MetaMaskLike]: () => of(window?.ethereum),
  [EthereumProviderName.Coinbase]: () => {
    return of(findWalletInjection('isCoinbaseWallet')).pipe(filter(Boolean));
  },
  [EthereumProviderName.HyperPay]: () => of(window?.hiWallet),
  [EthereumProviderName.Onto]: () => {
    if (window.onto) {
      return of(window.onto);
    } else {
      return of(findWalletInjection('isONTO')).pipe(filter(Boolean));
    }
  },
  [EthereumProviderName.TokenPocket]: () => {
    return of(findWalletInjection('isTokenPocket')).pipe(filter(Boolean));
  },
  [EthereumProviderName.MathWallet]: () => {
    return of(findWalletInjection('isMathWallet')).pipe(filter(Boolean));
  },
  [EthereumProviderName.OKXWallet]: () => {
    return of(window.okexchain);
  },
  [EthereumProviderName.Bitizen]: () => {
    return of(findWalletInjection('isBtitzen')).pipe(filter(Boolean));
  },
  [EthereumProviderName.ImToken]: () => {
    return of(findWalletInjection('isImToken')).pipe(filter(Boolean));
  },
  [EthereumProviderName.SafePal]: () => {
    return of(findWalletInjection('isSafePal')).pipe(filter(Boolean));
  },
  [EthereumProviderName.TrustWallet]: () => {
    if (window.trustWallet) {
      return of(window.trustWallet);
    }

    return of(findWalletInjection('isTrust')).pipe(filter(Boolean));
  },
};
