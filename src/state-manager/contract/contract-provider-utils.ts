import { Network } from '../../constant/network';
import { ethers } from 'ethers';
import * as _ from 'lodash';
import { arrayRandomSelect } from '../../util/array';
import { from, mergeMap, Observable, of } from 'rxjs';
import { map, tap, toArray } from 'rxjs/operators';

export type RpcProviderConf = { [n in Network]?: string | string[] };
export type RpcProviderGetter = (network: Network) => ethers.providers.JsonRpcProvider | undefined;
export type RpcProviderGetterAsync = (network: Network) => Observable<ethers.providers.JsonRpcProvider | undefined>;

export function genRpcProviderGetter(providerConf: RpcProviderConf): RpcProviderGetter {
  const cacheMap = new Map<string, ethers.providers.JsonRpcProvider>();

  function cacheKey(network: Network, url: string): string {
    return `${network}-${url}`;
  }

  return function (network: Network): ethers.providers.JsonRpcProvider | undefined {
    const rpcUrl: string | string[] | undefined = providerConf[network];

    if (rpcUrl) {
      const urls: string[] = Array.isArray(rpcUrl) ? rpcUrl : [rpcUrl];
      const useUrl: string = arrayRandomSelect(urls);

      const cache: ethers.providers.JsonRpcProvider | undefined = cacheMap.get(cacheKey(network, useUrl));

      if (cache) {
        return cache;
      }

      const provider = new ethers.providers.JsonRpcProvider(useUrl);
      _.set(provider, '_chainId_', Number(network));
      _.set(provider, '_network_', network);

      cacheMap.set(cacheKey(network, useUrl), provider);

      return provider;
    }

    return undefined;
  };
}

export function genRpcProviderGetterAsync(providerConf: RpcProviderConf): RpcProviderGetterAsync {
  const rpcProviderCache: { [n in Network]?: ethers.providers.JsonRpcProvider[] } = {};

  return function (network: Network): Observable<ethers.providers.JsonRpcProvider | undefined> {
    const rpcUrl: string | string[] | undefined = providerConf[network];

    if (rpcUrl) {
      const providerCache: ethers.providers.JsonRpcProvider[] | undefined = _.get(rpcProviderCache, network);

      if (providerCache) {
        return of(arrayRandomSelect(providerCache));
      }

      const urls: string[] = Array.isArray(rpcUrl) ? rpcUrl : [rpcUrl];
      const providers: ethers.providers.JsonRpcProvider[] = urls.map(url => {
        const provider = new ethers.providers.JsonRpcProvider(url);
        _.set(provider, '_chainId_', Number(network));
        _.set(provider, '_network_', network);
        return provider;
      });

      return from(providers).pipe(
        mergeMap(provider => {
          return checkProviderValid(provider).pipe(
            map(valid => {
              return valid ? provider : undefined;
            })
          );
        }),
        toArray(),
        map(validProviders => {
          return validProviders.filter(Boolean);
        }),
        tap(valid => {
          _.set(rpcProviderCache, network, valid);
        }),
        map(valid => {
          return arrayRandomSelect(valid);
        })
      );
    }

    return of(undefined);
  };
}

export function providerChainId(provider: ethers.providers.Provider): number | undefined {
  return _.get(provider, '_chainId_');
}

export function providerNetwork(provider: ethers.providers.Provider): Network | undefined {
  return _.get(provider, '_network_');
}

export function checkProviderValid(provider: ethers.providers.Provider): Observable<boolean> {
  return from(provider.getNetwork()).pipe(
    map(net => {
      return net.chainId === providerChainId(provider);
    })
  );
}
