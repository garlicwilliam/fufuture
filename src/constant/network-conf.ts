import {
  NET_ARBITRUM,
  NET_ARBITRUM_GOERLI,
  NET_ARBITRUM_SEPOLIA,
  NET_BASE,
  NET_BASE_GOERLI,
  NET_BNB,
  NET_BNB_TEST,
  NET_ETHEREUM,
  NET_ETHEREUM_FORK,
  NET_GOERLI,
  NET_LINEA,
  NET_LINEA_GOERLI,
  NET_MANTA_PACIFIC,
  NET_MANTA_PACIFIC_TEST,
  NET_MANTLE,
  NET_MANTLE_TEST,
  NET_OPT_ETH,
  NET_POLYGON,
  Network,
} from './network';
import eth from '../assets/imgs/chains/eth.svg';
import eth_f from '../assets/imgs/chains/eth-f.svg';
import gor from '../assets/imgs/chains/goerli.svg';
import bsc from '../assets/imgs/chains/bnb.svg';
import base from '../assets/imgs/chains/base.svg';
import arbitrum from '../assets/imgs/chains/arbitrum.svg';
import polygon from '../assets/imgs/chains/polygon.svg';
import optimism from '../assets/imgs/chains/optimism.svg';
import linea from '../assets/imgs/chains/linea.svg';
import linea_goerli from '../assets/imgs/chains/linea-test.svg';
import mantle from '../assets/imgs/chains/mantle.svg';
import manta from '../assets/imgs/chains/manta-pacific.svg';
import * as _ from 'lodash';

import { NetworkConfMap, NetworkParamConfig } from './network-type';

export const NetworkNames: NetworkConfMap<Network, string> = {
  [NET_ETHEREUM]: 'Ethereum Mainnet' as const,
  [NET_GOERLI]: 'Goerli' as const,
  [NET_BNB_TEST]: 'BNB Testnet' as const,
  [NET_BNB]: 'BNB Chain' as const,
  [NET_BASE]: 'Base' as const,
  [NET_ARBITRUM]: 'Arbitrum' as const,
  [NET_ARBITRUM_GOERLI]: 'Arbitrum Goerli' as const,
  [NET_ARBITRUM_SEPOLIA]: 'Arbitrum Sepolia' as const,
  [NET_POLYGON]: 'Polygon' as const,
  [NET_OPT_ETH]: 'Optimistic Ethereum' as const,
  [NET_LINEA_GOERLI]: 'Linea Testnet' as const,
  [NET_LINEA]: 'Linea Mainnet' as const,
  [NET_MANTLE_TEST]: 'Mantle Testnet' as const,
  [NET_MANTLE]: 'Mantle' as const,
  [NET_ETHEREUM_FORK]: 'Ethereum Fork' as const,
  [NET_MANTA_PACIFIC]: 'Manta Pacific Mainnet' as const,
  [NET_MANTA_PACIFIC_TEST]: 'Manta Pacific Testnet' as const,
  [NET_BASE_GOERLI]: 'Base Goerli' as const,
};
export const NetworkCurrency: NetworkConfMap<Network, string> = {
  [NET_BNB_TEST]: 'BNB',
  [NET_BNB]: 'BNB',
  [NET_BASE]: 'ETH',
  [NET_BASE_GOERLI]: 'ETH',
  [NET_GOERLI]: 'ETH',
  [NET_ETHEREUM]: 'ETH',
  [NET_POLYGON]: 'MATIC',
  [NET_ARBITRUM]: 'ETH',
  [NET_ARBITRUM_GOERLI]: 'AGOR',
  [NET_ARBITRUM_SEPOLIA]: 'ETH',
  [NET_OPT_ETH]: 'OETH',
  [NET_LINEA]: 'ETH',
  [NET_LINEA_GOERLI]: 'ETH',
  [NET_MANTLE]: 'MNT',
  [NET_MANTLE_TEST]: 'MNT',
  [NET_ETHEREUM_FORK]: 'ETH',
  [NET_MANTA_PACIFIC]: 'ETH',
  [NET_MANTA_PACIFIC_TEST]: 'MANTA',
};
export const NetworkLabels: NetworkConfMap<Network, string> = {
  [NET_ETHEREUM]: 'Ethereum' as const,
  [NET_GOERLI]: 'Goerli' as const,
  [NET_BNB_TEST]: 'BNB Testnet' as const,
  [NET_BNB]: 'BNB Chain' as const,
  [NET_BASE]: 'Base' as const,
  [NET_BASE_GOERLI]: 'Base Goerli' as const,
  [NET_ARBITRUM]: 'Arbitrum' as const,
  [NET_ARBITRUM_GOERLI]: 'Arbitrum Goerli' as const,
  [NET_ARBITRUM_SEPOLIA]: 'Arbitrum Sepolia' as const,
  [NET_POLYGON]: 'Polygon' as const,
  [NET_OPT_ETH]: 'Optimism' as const,
  [NET_LINEA_GOERLI]: 'Linea Testnet' as const,
  [NET_LINEA]: 'Linea' as const,
  [NET_MANTLE_TEST]: 'Mantle Testnet' as const,
  [NET_MANTLE]: 'Mantle' as const,
  [NET_ETHEREUM_FORK]: 'Ethereum Fork' as const,
  [NET_MANTA_PACIFIC_TEST]: 'Manta Pacific Test' as const,
  [NET_MANTA_PACIFIC]: 'Manta Pacific' as const,
};
export const NetworkIcons: NetworkConfMap<Network, string> = {
  [NET_ETHEREUM]: eth,
  [NET_GOERLI]: gor,
  [NET_BNB_TEST]: bsc,
  [NET_BNB]: bsc,
  [NET_BASE]: base,
  [NET_BASE_GOERLI]: base,
  [NET_ARBITRUM]: arbitrum,
  [NET_ARBITRUM_GOERLI]: arbitrum,
  [NET_ARBITRUM_SEPOLIA]: arbitrum,
  [NET_POLYGON]: polygon,
  [NET_OPT_ETH]: optimism,
  [NET_LINEA]: linea,
  [NET_LINEA_GOERLI]: linea_goerli,
  [NET_MANTLE]: mantle,
  [NET_MANTLE_TEST]: mantle,
  [NET_ETHEREUM_FORK]: eth_f,
  [NET_MANTA_PACIFIC]: manta,
  [NET_MANTA_PACIFIC_TEST]: manta,
};
export const NetworkParams: NetworkConfMap<Network, NetworkParamConfig> = {
  [NET_BNB_TEST]: {
    chainId: '0x61',
    chainName: NetworkNames[NET_BNB_TEST],
    nativeCurrency: {
      name: NetworkCurrency[NET_BNB_TEST],
      symbol: NetworkCurrency[NET_BNB_TEST],
      decimals: 18,
    },
    rpcUrls: ['https://data-seed-prebsc-2-s2.binance.org:8545'],
    blockExplorerUrls: ['https://testnet.bscscan.com'],
  },
  [NET_BNB]: {
    chainId: '0x38',
    chainName: NetworkNames[NET_BNB],
    nativeCurrency: {
      name: NetworkCurrency[NET_BNB],
      symbol: NetworkCurrency[NET_BNB],
      decimals: 18,
    },
    rpcUrls: ['https://bsc-dataseed.binance.org'],
    blockExplorerUrls: ['https://bscscan.com'],
  },
  [NET_BASE]: {
    chainId: '0x2105',
    chainName: NetworkNames[NET_BASE],
    nativeCurrency: {
      name: NetworkCurrency[NET_BASE],
      symbol: NetworkCurrency[NET_BASE],
      decimals: 18,
    },
    rpcUrls: ['https://developer-access-mainnet.base.org', 'https://base.meowrpc.com', 'https://base.publicnode.com'],
    blockExplorerUrls: ['https://basescan.org'],
  },
  [NET_BASE_GOERLI]: {
    chainId: '0x14a33',
    chainName: NetworkNames[NET_BASE_GOERLI],
    nativeCurrency: {
      name: NetworkCurrency[NET_BASE_GOERLI],
      symbol: NetworkCurrency[NET_BASE_GOERLI],
      decimals: 18,
    },
    rpcUrls: ['https://base-goerli.diamondswap.org/rpc', 'https://base.meowrpc.com', 'https://base.publicnode.com'],
    blockExplorerUrls: ['https://goerli.basescan.org'],
  },
  [NET_ETHEREUM]: {
    chainId: '0x1',
    chainName: NetworkNames[NET_ETHEREUM],
    rpcUrls: ['https://eth.public-rpc.com'],
    blockExplorerUrls: ['https://etherscan.io'],
    nativeCurrency: {
      name: NetworkCurrency[NET_ETHEREUM],
      symbol: NetworkCurrency[NET_BNB],
      decimals: 18,
    },
  },
  [NET_ETHEREUM_FORK]: {
    chainId: '0x539',
    chainName: NetworkNames[NET_ETHEREUM_FORK],
    rpcUrls: ['https://fethereum.stakestone.io'],
    blockExplorerUrls: ['https://fexplorer.stakestone.io'],
    nativeCurrency: {
      name: NetworkCurrency[NET_ETHEREUM_FORK],
      symbol: NetworkCurrency[NET_ETHEREUM_FORK],
      decimals: 18,
    },
  },
  [NET_GOERLI]: {
    chainId: '0x5',
    chainName: NetworkNames[NET_GOERLI],
    rpcUrls: ['https://goerli.infura.io/v3/abc4c36a4ae54715bc7a4ecedd5a8490'],
    blockExplorerUrls: ['https://goerli.etherscan.io'],
    nativeCurrency: {
      name: NetworkCurrency[NET_GOERLI],
      symbol: NetworkCurrency[NET_GOERLI],
      decimals: 18,
    },
  },
  [NET_POLYGON]: {
    chainId: '0x89',
    chainName: NetworkNames[NET_POLYGON],
    rpcUrls: ['https://polygon-rpc.com/'],
    blockExplorerUrls: ['https://polygonscan.com'],
    nativeCurrency: {
      name: NetworkCurrency[NET_POLYGON],
      symbol: NetworkCurrency[NET_POLYGON],
      decimals: 18,
    },
  },
  [NET_ARBITRUM]: {
    chainId: '0xa4b1',
    chainName: NetworkNames[NET_ARBITRUM],
    rpcUrls: ['https://arb1.arbitrum.io/rpc'],
    blockExplorerUrls: ['https://arbiscan.io'],
    nativeCurrency: {
      name: NetworkCurrency[NET_ARBITRUM],
      symbol: NetworkCurrency[NET_ARBITRUM],
      decimals: 18,
    },
  },
  [NET_ARBITRUM_GOERLI]: {
    chainId: '0x66eed',
    chainName: NetworkNames[NET_ARBITRUM_GOERLI],
    rpcUrls: ['https://goerli-rollup.arbitrum.io/rpc'],
    blockExplorerUrls: ['https://goerli-rollup-explorer.arbitrum.io'],
    nativeCurrency: {
      name: NetworkCurrency[NET_ARBITRUM_GOERLI],
      symbol: NetworkCurrency[NET_ARBITRUM_GOERLI],
      decimals: 18,
    },
  },
  [NET_ARBITRUM_SEPOLIA]: {
    chainId: '0x66eee',
    chainName: NetworkNames[NET_ARBITRUM_SEPOLIA],
    rpcUrls: ['https://arbitrum-sepolia.blockpi.network/v1/rpc/public'],
    blockExplorerUrls: ['https://sepolia-explorer.arbitrum.io'],
    nativeCurrency: {
      name: NetworkCurrency[NET_ARBITRUM_SEPOLIA],
      symbol: NetworkCurrency[NET_ARBITRUM_SEPOLIA],
      decimals: 18,
    },
  },
  [NET_OPT_ETH]: {
    chainId: '0xa',
    chainName: NetworkNames[NET_OPT_ETH],
    rpcUrls: ['https://mainnet.optimism.io/'],
    blockExplorerUrls: ['https://optimistic.etherscan.io'],
    nativeCurrency: {
      name: NetworkCurrency[NET_OPT_ETH],
      symbol: NetworkCurrency[NET_OPT_ETH],
      decimals: 18,
    },
  },
  [NET_LINEA_GOERLI]: {
    chainId: '0xe704',
    chainName: NetworkNames[NET_LINEA_GOERLI],
    rpcUrls: ['https://rpc.goerli.linea.build'],
    blockExplorerUrls: ['https://goerli.lineascan.build'],
    nativeCurrency: {
      name: NetworkCurrency[NET_LINEA_GOERLI],
      symbol: NetworkCurrency[NET_LINEA_GOERLI],
      decimals: 18,
    },
  },
  [NET_LINEA]: {
    chainId: '0xe708',
    chainName: NetworkNames[NET_LINEA],
    rpcUrls: ['https://rpc.linea.build'],
    blockExplorerUrls: ['https://lineascan.build'],
    nativeCurrency: {
      name: NetworkCurrency[NET_LINEA],
      symbol: NetworkCurrency[NET_LINEA],
      decimals: 18,
    },
  },
  [NET_MANTLE_TEST]: {
    chainId: '0x1389',
    chainName: NetworkNames[NET_MANTLE_TEST],
    rpcUrls: ['https://rpc.testnet.mantle.xyz'],
    blockExplorerUrls: ['https://explorer.testnet.mantle.xyz'],
    nativeCurrency: {
      name: NetworkCurrency[NET_MANTLE_TEST],
      symbol: NetworkCurrency[NET_MANTLE_TEST],
      decimals: 18,
    },
  },
  [NET_MANTLE]: {
    chainId: '0x1388',
    chainName: NetworkNames[NET_MANTLE],
    rpcUrls: ['https://rpc.mantle.xyz'],
    blockExplorerUrls: ['https://explorer.mantle.xyz'],
    nativeCurrency: {
      name: NetworkCurrency[NET_MANTLE],
      symbol: NetworkCurrency[NET_MANTLE],
      decimals: 18,
    },
  },
  [NET_MANTA_PACIFIC]: {
    chainId: '0xa9',
    chainName: NetworkNames[NET_MANTA_PACIFIC],
    rpcUrls: ['https://pacific-rpc.manta.network/http'],
    blockExplorerUrls: ['https://pacific-explorer.manta.network'],
    nativeCurrency: {
      name: NetworkCurrency[NET_MANTA_PACIFIC],
      symbol: NetworkCurrency[NET_MANTA_PACIFIC],
      decimals: 18,
    },
  },
  [NET_MANTA_PACIFIC_TEST]: {
    chainId: '0x34816d',
    chainName: NetworkNames[NET_MANTA_PACIFIC_TEST],
    rpcUrls: ['https://pacific-rpc.testnet.manta.network/http'],
    blockExplorerUrls: ['https://pacific-explorer.testnet.manta.network'],
    nativeCurrency: {
      name: NetworkCurrency[NET_MANTA_PACIFIC_TEST],
      symbol: NetworkCurrency[NET_MANTA_PACIFIC_TEST],
      decimals: 18,
    },
  },
};

export function chainScanAddressExploreUrl(network: Network, address: string): string {
  let host = NetworkParams[network].blockExplorerUrls[0];
  host = _.trimEnd(host, '/');

  return host + '/address/' + address;
}

export function chainScanTxExploreUrl(network: Network, txHash: string): string {
  let host = NetworkParams[network].blockExplorerUrls[0];
  host = _.trimEnd(host, '/');

  return host + '/tx/' + txHash;
}
