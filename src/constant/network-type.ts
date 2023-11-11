import { Network, NETWORKS_BNB, NETWORKS_ETH } from './network';

export type NetworkParamConfig = {
  chainId: string;
  chainName?: string;
  nativeCurrency?: { name: string; symbol: string; decimals: number };
  rpcUrls: string[];
  blockExplorerUrls: string[];
};

export type NetworkTypeETH = typeof NETWORKS_ETH[number];
export type NetworkTypeBNB = typeof NETWORKS_BNB[number];

export type NetworkConfMap<A extends Network, T> = { [k in A]: T };
export type NetworkConfPartialMap<T> = { [k in Network]?: T };
