import { providers } from 'ethers';
import { Network } from '../constant/network';
import { RPC_URLS } from '../constant/chain-rpc';

export function getHttpProvider(network: Network): providers.JsonRpcProvider | null {
  const rpcUrl: string = RPC_URLS[network];

  return rpcUrl ? new providers.JsonRpcProvider(rpcUrl) : null;
}


