import { Network, NETWORKS_BNB, NETWORKS_ETH } from './network';
import { NetworkTypeBNB, NetworkTypeETH } from './network-type';

export const isEthNetworkGroup = (network: Network): boolean => {
  return NETWORKS_ETH.indexOf(network as NetworkTypeETH) >= 0;
};

export const isBscNetworkGroup = (network: Network): boolean => {
  return NETWORKS_BNB.indexOf(network as NetworkTypeBNB) >= 0;
};

export const isInNetworkGroup = (network: Network | null | undefined, networks: readonly Network[] | string[]): boolean => {
  if (!network) {
    return false;
  }

  return networks.indexOf(network) >= 0;
};

export function networkHex(network: Network): string {
  return Number(network).toString(16);
}
