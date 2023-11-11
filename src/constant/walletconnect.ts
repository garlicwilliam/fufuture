import { UniversalProviderOpts } from '@walletconnect/universal-provider';
import { AppName, getAppName } from '../util/app';
import { NET_ARBITRUM, NET_ARBITRUM_GOERLI, NET_BNB, NET_BNB_TEST, NET_ETHEREUM, NET_GOERLI } from './network';
import { ConnectParams } from '@walletconnect/universal-provider/dist/types/types';

export const RpcMethod = []; //['eth_sendTransaction', 'eth_accounts', 'eth_requestAccounts'];
export const RpcEvent = []; //['accountsChanged', 'chainChanged', 'message', 'disconnect', 'connect'];
export const enum WcNetNamespace {
  eip155 = 'eip155',
}
export const WcChainId = {
  Ethereum: WcNetNamespace.eip155 + ':' + NET_ETHEREUM,
  Goerli: WcNetNamespace.eip155 + ':' + NET_GOERLI,
  Bnb: WcNetNamespace.eip155 + ':' + NET_BNB,
  BnbTest: WcNetNamespace.eip155 + ':' + NET_BNB_TEST,
  Arbitrum: WcNetNamespace.eip155 + ':' + NET_ARBITRUM,
  ArbitrumGoerli: WcNetNamespace.eip155 + ':' + NET_ARBITRUM_GOERLI,
};

export function wcProviderInitOps(): UniversalProviderOpts {
  return {
    projectId: '4473e1279621240809d6ecaf56415dbb',
    metadata: {
      name: 'Doption',
      url: 'https://doption.net',
      description: '',
      icons: [],
    },
  };
}

export function wcDefaultChain(): string {
  const appName: AppName = getAppName();

  switch (appName) {
    case AppName.ShieldTrade: {
      return WcChainId.Bnb;
    }
    default: {
      return WcChainId.Bnb;
    }
  }
}

export function wcConnectOps(): ConnectParams {
  return {
    namespaces: {
      eip155: {
        chains: [WcChainId.Bnb],
        defaultChain: WcChainId.Bnb,
        methods: RpcMethod,
        events: RpcEvent,
        rpcMap: {
          [WcChainId.BnbTest]: 'https://data-seed-prebsc-2-s2.binance.org:8545',
          [WcChainId.Bnb]: 'https://bscrpc.com',
        },
      },
    },
    optionalNamespaces: {
      eip155: {
        chains: [WcChainId.Bnb],
        defaultChain: WcChainId.Bnb,
        methods: RpcMethod,
        events: RpcEvent,
        rpcMap: {
          [WcChainId.BnbTest]: 'https://data-seed-prebsc-2-s2.binance.org:8545',
          [WcChainId.Bnb]: 'https://bscrpc.com',
        },
      },
    },
  };
}
