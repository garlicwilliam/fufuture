// private variable, do not use out of this space
enum EthNetwork {
  eth = '1',
  sepolia = '11155111',
  bianTest = '97',
  bsc = '56',
  base = '8453',
  base_goerli = '84531',
  arbitrum = '42161',
  arbitrum_goerli = '421613',
  arbitrum_sepolia = '421614',
  polygon = '137',
  optimistic_ethereum = '10',
  linea_goerli = '59140',
  linea = '59144',
  mantle = '5000',
  mantle_test = '5001',
  ethereum_fork = '1337',
  manta_pacific = '169',
  manta_pacific_test = '3441005',
  mode_mainnet = '34443',
  astar_zkEVM = '3776',
  scroll = '534352',
}

export type Network = EthNetwork;

export const NET_ETHEREUM = EthNetwork.eth;
export const NET_SEPOLIA = EthNetwork.sepolia;
export const NET_BNB_TEST = EthNetwork.bianTest;
export const NET_BNB = EthNetwork.bsc;
export const NET_BASE = EthNetwork.base;
export const NET_BASE_GOERLI = EthNetwork.base_goerli;
export const NET_ARBITRUM = EthNetwork.arbitrum;
export const NET_ARBITRUM_GOERLI = EthNetwork.arbitrum_goerli;
export const NET_ARBITRUM_SEPOLIA = EthNetwork.arbitrum_sepolia;
export const NET_POLYGON = EthNetwork.polygon;
export const NET_OPT_ETH = EthNetwork.optimistic_ethereum;
export const NET_LINEA_GOERLI = EthNetwork.linea_goerli;
export const NET_LINEA = EthNetwork.linea;
export const NET_MANTLE = EthNetwork.mantle;
export const NET_MANTLE_TEST = EthNetwork.mantle_test;
export const NET_ETHEREUM_FORK = EthNetwork.ethereum_fork;
export const NET_MANTA_PACIFIC = EthNetwork.manta_pacific;
export const NET_MANTA_PACIFIC_TEST = EthNetwork.manta_pacific_test;
export const NET_MODE_MAINNET = EthNetwork.mode_mainnet;
export const NET_ASTAR_ZK_EVM = EthNetwork.astar_zkEVM;
export const NET_SCROLL = EthNetwork.scroll;

export const NETWORKS_ETH = [NET_ETHEREUM, NET_SEPOLIA] as const;
export const NETWORKS_BNB = [NET_BNB, NET_BNB_TEST] as const;
export const NETWORKS_MANTA = [NET_MANTA_PACIFIC, NET_MANTA_PACIFIC_TEST] as const;

export const ALL_NETWORKS: Network[] = Object.values(EthNetwork);
