import { UniversalProviderOpts } from '@walletconnect/universal-provider';
import {
  NET_ARBITRUM,
  NET_ARBITRUM_GOERLI,
  NET_BASE,
  NET_BASE_GOERLI,
  NET_BNB,
  NET_BNB_TEST,
  NET_ETHEREUM,
  NET_GOERLI,
  NET_LINEA,
  NET_LINEA_GOERLI,
  NET_MANTA_PACIFIC,
  NET_MANTA_PACIFIC_TEST,
  NET_MANTLE,
  NET_MANTLE_TEST,
} from './network';
import { ConnectParams } from '@walletconnect/universal-provider/dist/types/types';

export const RpcMethod = ['wallet_switchEthereumChain']; //['eth_sendTransaction', 'eth_accounts', 'eth_requestAccounts'];
export const RpcEvent = []; //['accountsChanged', 'chainChanged', 'message', 'disconnect', 'connect'];
export const enum WcNetNamespace {
  eip155 = 'eip155',
}
export const WcChainId = {
  [NET_ETHEREUM]: WcNetNamespace.eip155 + ':' + NET_ETHEREUM,
  [NET_GOERLI]: WcNetNamespace.eip155 + ':' + NET_GOERLI,
  [NET_BNB]: WcNetNamespace.eip155 + ':' + NET_BNB,
  [NET_BNB_TEST]: WcNetNamespace.eip155 + ':' + NET_BNB_TEST,
  [NET_ARBITRUM]: WcNetNamespace.eip155 + ':' + NET_ARBITRUM,
  [NET_ARBITRUM_GOERLI]: WcNetNamespace.eip155 + ':' + NET_ARBITRUM_GOERLI,
  [NET_LINEA]: WcNetNamespace.eip155 + ':' + NET_LINEA,
  [NET_LINEA_GOERLI]: WcNetNamespace.eip155 + ':' + NET_LINEA_GOERLI,
  [NET_MANTLE]: WcNetNamespace.eip155 + ':' + NET_MANTLE,
  [NET_MANTLE_TEST]: WcNetNamespace.eip155 + ':' + NET_MANTLE_TEST,
  [NET_BASE]: WcNetNamespace.eip155 + ':' + NET_BASE,
  [NET_BASE_GOERLI]: WcNetNamespace.eip155 + ':' + NET_BASE_GOERLI,
  [NET_MANTA_PACIFIC]: WcNetNamespace.eip155 + ':' + NET_MANTA_PACIFIC,
  [NET_MANTA_PACIFIC_TEST]: WcNetNamespace.eip155 + ':' + NET_MANTA_PACIFIC_TEST,
};

export type WalletConnectOps = {
  initProviderOps: UniversalProviderOpts;
  defaultChain: string;
  connectOps: ConnectParams;
};
