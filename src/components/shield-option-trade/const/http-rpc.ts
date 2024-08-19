import { NET_ARBITRUM, NET_BASE, NET_BNB, NET_OP_BNB, NET_POLYGON, Network } from '../../../constant/network';
import { genRpcProviderGetter, RpcProviderGetter } from '../../../state-manager/contract/contract-provider-utils';
import { ethers } from 'ethers';

export const SHIELD_RPC_URLS = {
  [NET_BNB]: ['https://lb.drpc.org/ogrpc?network=bsc&dkey=AsR1YIpU_kKvvJ72MYgnTWB0PNcEKGMR76EwhkHL9tz4'],
  [NET_POLYGON]: ['https://lb.drpc.org/ogrpc?network=polygon&dkey=AsR1YIpU_kKvvJ72MYgnTWB0PNcEKGMR76EwhkHL9tz4'],
  [NET_OP_BNB]: ['https://lb.drpc.org/ogrpc?network=opbnb&dkey=AsR1YIpU_kKvvJ72MYgnTWB0PNcEKGMR76EwhkHL9tz4'],
  [NET_ARBITRUM]: ['https://lb.drpc.org/ogrpc?network=arbitrum&dkey=AsR1YIpU_kKvvJ72MYgnTWB0PNcEKGMR76EwhkHL9tz4'],
  [NET_BASE]: ['https://lb.drpc.org/ogrpc?network=base&dkey=AsR1YIpU_kKvvJ72MYgnTWB0PNcEKGMR76EwhkHL9tz4'],
};

export const getShieldRpcProvider: RpcProviderGetter = genRpcProviderGetter(SHIELD_RPC_URLS);

// ----------------------------------------

const cache = {
  [NET_BNB]: getShieldRpcProvider(NET_BNB)!,
  [NET_POLYGON]: getShieldRpcProvider(NET_POLYGON)!,
  [NET_OP_BNB]: getShieldRpcProvider(NET_OP_BNB)!,
  [NET_ARBITRUM]: getShieldRpcProvider(NET_ARBITRUM)!,
  [NET_BASE]: getShieldRpcProvider(NET_BASE)!,
};

export function getShieldRpcProviderCache(network: Network): ethers.providers.JsonRpcProvider {
  return cache[network];
}
