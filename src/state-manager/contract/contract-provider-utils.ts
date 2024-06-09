import { Network } from '../../constant/network';
import { ethers } from 'ethers';
import * as _ from 'lodash';
import { arrayRandomSelect } from '../../util/array';

export type RpcProviderConf = { [n in Network]?: string | string[] };
export type RpcProviderGetter = (network: Network) => ethers.providers.JsonRpcProvider | undefined;

export function genRpcProviderGetter(providerConf: RpcProviderConf): RpcProviderGetter {
  const rpcProviderCache: { [n in Network]?: ethers.providers.JsonRpcProvider[] } = {};

  return function (network: Network): ethers.providers.JsonRpcProvider | undefined {
    const rpcUrl: string | string[] | undefined = providerConf[network];

    if (rpcUrl) {
      const providerCache: ethers.providers.JsonRpcProvider[] | undefined = _.get(rpcProviderCache, network);

      if (providerCache) {
        return arrayRandomSelect(providerCache);
      }

      const urls: string[] = Array.isArray(rpcUrl) ? rpcUrl : [rpcUrl];

      const providers: ethers.providers.JsonRpcProvider[] = urls.map(url => {
        const provider = new ethers.providers.JsonRpcProvider(url);
        _.set(provider, '_chainId_', Number(network));
        _.set(provider, '_network_', network);
        return provider;
      });

      _.set(rpcProviderCache, network, providers);

      return arrayRandomSelect(providers);
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
