import { RpcEvent, RpcMethod, WalletConnectOps, WcChainId } from '../../../constant/walletconnect';
import { NET_BNB } from '../../../constant/network';

export const ops: WalletConnectOps = {
  initProviderOps: {
    projectId: '4473e1279621240809d6ecaf56415dbb',
    metadata: {
      name: 'ShieldOption',
      url: 'https://shieldex.io',
      description: '',
      icons: [],
    },
  },
  defaultChain: WcChainId[NET_BNB],
  connectOps: {
    namespaces: {
      eip155: {
        chains: [WcChainId[NET_BNB]],
        defaultChain: WcChainId[NET_BNB],
        methods: RpcMethod,
        events: RpcEvent,
      },
    },
  },
};
