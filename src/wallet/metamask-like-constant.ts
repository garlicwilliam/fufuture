import { EMPTY, NEVER, Observable, of } from 'rxjs';
import { EthereumProviderInterface } from './metamask-like-types';
import { filter } from 'rxjs/operators';
import * as _ from 'lodash';
import { EthereumProviderName } from './define';

declare const window: Window & { ethereum: any } & any;

export const nonMetaMaskFields = [
  'isImToken',
  'isBitKeep',
  'isCoinbaseWallet',
  'isTokenPocket',
  'isMathWallet',
  'isOKExWallet',
  'isSafePal',
  'isTrust',
  'isONTO',
  'isCoin98',
  'isBinance',
  'isOneKey',
  'isRabby',
  'isOKExWallet',
  'isOkxWallet',
];

function isGateWalletProvider(provider: any): boolean {
  return _.get(provider, 'providerInfo.injectedNamespace') === 'gatewallet';
}

function metamaskDetect(): boolean {
  const hasWeb3: boolean = checkWeb3('isMetaMask', nonMetaMaskFields);
  const hasEthereum: boolean =
    checkWalletInjection('isMetaMask', nonMetaMaskFields) && !isGateWalletProvider(window.ethereum);

  return hasWeb3 || hasEthereum;
}

function metamaskGetter(): Observable<EthereumProviderInterface> {
  const hasWeb3: boolean = !!window.web3 && !!window.web3.currentProvider && !!window.web3.currentProvider.isMetaMask;
  if (hasWeb3) {
    return of(window.web3.currentProvider);
  } else {
    const provider: EthereumProviderInterface | null = findWalletInjection('isMetaMask', nonMetaMaskFields);

    return !!provider && isGateWalletProvider(provider) ? NEVER : of(provider as EthereumProviderInterface);
  }
}

function providerConfirm(provider: any, checkField: string, not?: string[]): boolean {
  return provider[checkField] && !(not || []).some(one => !!provider[one] || !!provider.target?.[one]);
}

function checkEthereum(checkField: string, not?: string[]): boolean {
  const provider = window.ethereum;

  if (provider) {
    return providerConfirm(provider, checkField, not);
  } else {
    return false;
  }
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

function checkWeb3(checkField: string, not?: string[]): boolean {
  const provider = window.web3?.currentProvider;

  if (provider) {
    return providerConfirm(provider, checkField, not);
  } else {
    return false;
  }
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
  let provider: EthereumProviderInterface | null = getEthereum(checkField, not);
  if (!provider) {
    provider = getEthereumProviders(checkField, not);
  }

  return provider;
}

export const ProviderExistDetectors: { [key in EthereumProviderName]: () => boolean } = {
  [EthereumProviderName.MetaMask]: () => metamaskDetect(),
  [EthereumProviderName.BitKeep]: () => !!window?.bitkeep && !!window.bitkeep.ethereum?.isBitKeep,
  [EthereumProviderName.Binance]: () => !!window.ethereum && window.ethereum.isBinance,
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
  [EthereumProviderName.Coin98]: () => {
    return !!window.coin98;
  },
  [EthereumProviderName.GateWallet]: () => {
    return !!window.gatewallet;
  },
  [EthereumProviderName.OneKey]: () => {
    return !!window.$onekey?.ethereum;
  },
  [EthereumProviderName.Rabby]: () => {
    return false;
  },
  [EthereumProviderName.Tomo]: () => {
    return window.tomo_evm && window.tomo_evm.isTomo;
  },
};

export const ProviderGetters: { [key in EthereumProviderName]: () => Observable<EthereumProviderInterface> } = {
  [EthereumProviderName.MetaMask]: () => metamaskGetter(),
  [EthereumProviderName.BitKeep]: () => of(window?.bitkeep?.ethereum),
  [EthereumProviderName.Binance]: () => of(window?.ethereum),
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
  [EthereumProviderName.Coin98]: () => {
    return of(window.coin98.provider);
  },
  [EthereumProviderName.GateWallet]: () => {
    return of(window.gatewallet);
  },
  [EthereumProviderName.OneKey]: () => {
    return of(window.$onekey?.ethereum);
  },
  [EthereumProviderName.Rabby]: () => {
    return EMPTY;
  },
  [EthereumProviderName.Tomo]: () => {
    return of(window.tomo_evm);
  },
};
