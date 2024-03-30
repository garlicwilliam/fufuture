import { UniversalProviderOpts } from '@walletconnect/universal-provider';
import { ALL_NETWORKS, Network } from './network';
import { ConnectParams } from '@walletconnect/universal-provider/dist/types/types';

export const RpcMethod = ['wallet_switchEthereumChain', 'personal_sign', 'eth_sendTransaction']; //['eth_sendTransaction', 'eth_accounts', 'eth_requestAccounts'];
export const RpcEvent = []; //['accountsChanged', 'chainChanged', 'message', 'disconnect', 'connect'];
export const enum WcNetNamespace {
  eip155 = 'eip155',
}

function wcChainId(network: Network): string {
  return WcNetNamespace.eip155 + ':' + network;
}

export const WcChainId: {} = {};

ALL_NETWORKS.forEach((network: Network) => {
  if (!WcChainId[network]) {
    WcChainId[network] = wcChainId(network);
  }
});

export type WalletConnectOps = {
  initProviderOps: UniversalProviderOpts;
  defaultChain: string;
  connectOps: ConnectParams;
};
