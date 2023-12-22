import { Network } from '../../constant/network';
import { ethers } from 'ethers';
import * as _ from 'lodash';

export type RpcProviderConf = { [n in Network]?: string };
export type RpcProviderGen = (network: Network) => ethers.providers.JsonRpcProvider | undefined;

export function genRpcProviderGetter(providerConf: RpcProviderConf): RpcProviderGen {
  const rpcProviderCache = {};

  return function (network: Network): ethers.providers.JsonRpcProvider | undefined {
    const rpcUrl: string | undefined = providerConf[network];

    if (rpcUrl) {
      const providerCache = _.get(rpcProviderCache, network);

      if (providerCache) {
        return providerCache;
      }

      const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
      _.set(provider, '_chainId_', Number(network));
      _.set(provider, '_network_', network);
      _.set(rpcProviderCache, network, provider);

      return provider;
    }

    return undefined;
  };
}

export function providerChainId(provider: ethers.providers.Provider): number | undefined {
  return _.get(provider, '_chainId_');
}

export function providerNetwork(provider: ethers.providers.Provider): Network | undefined {
  return _.get(provider, '_network_');
}
