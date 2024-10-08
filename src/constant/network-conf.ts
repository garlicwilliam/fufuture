import {
  NET_ARBITRUM,
  NET_ARBITRUM_GOERLI,
  NET_ARBITRUM_SEPOLIA,
  NET_ASTAR_ZK_EVM,
  NET_B2,
  NET_BASE,
  NET_BASE_GOERLI,
  NET_BEVM,
  NET_BNB,
  NET_BNB_TEST,
  NET_ETHEREUM,
  NET_ETHEREUM_FORK,
  NET_LINEA,
  NET_LINEA_GOERLI,
  NET_MANTA_PACIFIC,
  NET_MANTA_PACIFIC_TEST,
  NET_MANTLE,
  NET_MANTLE_TEST,
  NET_MERLIN,
  NET_MERLIN_TEST,
  NET_METER,
  NET_MODE_MAINNET,
  NET_OP_BNB,
  NET_OPT_ETH,
  NET_POLYGON,
  NET_SCROLL,
  NET_SEPOLIA,
  NET_BLAST,
  Network,
  NET_X_LAYER,
  NET_SEI,
} from './network';
import eth from '../assets/imgs/chains/eth.svg';
import eth_f from '../assets/imgs/chains/eth-f.svg';
import scroll from '../assets/imgs/chains/scroll.svg';
import bsc from '../assets/imgs/chains/bnb.svg';
import base from '../assets/imgs/chains/base.svg';
import arbitrum from '../assets/imgs/chains/arbitrum.svg';
import polygon from '../assets/imgs/chains/polygon.svg';
import optimism from '../assets/imgs/chains/optimism.svg';
import linea from '../assets/imgs/chains/linea.svg';
import linea_goerli from '../assets/imgs/chains/linea-test.svg';
import mantle from '../assets/imgs/chains/mantle.svg';
import manta from '../assets/imgs/chains/manta-pacific.svg';
import mode from '../assets/imgs/chains/mode.svg';
import astar from '../assets/imgs/chains/astar.svg';
import merlin from '../assets/imgs/chains/merlin.svg';
import b2 from '../assets/imgs/chains/b2.svg';
import meter from '../assets/imgs/chains/meter.svg';
import bevm from '../assets/imgs/chains/bevm.svg';
import blast from '../assets/imgs/chains/blast.svg';
import xLayer from '../assets/imgs/chains/x-layer.svg';
import sei from '../assets/imgs/chains/sei.svg';

import * as _ from 'lodash';

import { NetworkConfMap, NetworkParamConfig } from './network-type';

export const NetworkNames: NetworkConfMap<Network, string> = {
  [NET_ETHEREUM]: 'Ethereum Mainnet' as const,
  [NET_SEPOLIA]: 'Sepolia' as const,
  [NET_BNB_TEST]: 'BSC Testnet' as const,
  [NET_BNB]: 'BNB Smart Chain' as const,
  [NET_BASE]: 'Base' as const,
  [NET_ARBITRUM]: 'Arbitrum One' as const,
  [NET_ARBITRUM_GOERLI]: 'Arbitrum Goerli' as const,
  [NET_ARBITRUM_SEPOLIA]: 'Arbitrum Sepolia' as const,
  [NET_POLYGON]: 'Polygon' as const,
  [NET_OPT_ETH]: 'Op Mainnet' as const,
  [NET_LINEA_GOERLI]: 'Linea Testnet' as const,
  [NET_LINEA]: 'Linea Mainnet' as const,
  [NET_MANTLE_TEST]: 'Mantle Testnet' as const,
  [NET_MANTLE]: 'Mantle' as const,
  [NET_ETHEREUM_FORK]: 'Ethereum Fork' as const,
  [NET_MANTA_PACIFIC]: 'Manta Pacific Mainnet' as const,
  [NET_MANTA_PACIFIC_TEST]: 'Manta Pacific Testnet' as const,
  [NET_BASE_GOERLI]: 'Base Goerli' as const,
  [NET_MODE_MAINNET]: 'Mode Mainnet' as const,
  [NET_ASTAR_ZK_EVM]: 'Astar zkEVM' as const,
  [NET_SCROLL]: 'Scroll' as const,
  [NET_MERLIN]: 'Merlin Mainnet' as const,
  [NET_MERLIN_TEST]: 'Merlin Testnet' as const,
  [NET_B2]: 'B2 Mainnet' as const,
  [NET_METER]: 'Meter Mainnet' as const,
  [NET_BEVM]: 'BEVM Mainnet' as const,
  [NET_OP_BNB]: 'opBNB Mainnet' as const,
  [NET_BLAST]: 'Blast' as const,
  [NET_X_LAYER]: 'X Layer mainnet' as const,
  [NET_SEI]: 'Sei' as const,
};
export const NetworkCurrency: NetworkConfMap<Network, string> = {
  [NET_BNB_TEST]: 'BNB',
  [NET_BNB]: 'BNB',
  [NET_BASE]: 'ETH',
  [NET_BASE_GOERLI]: 'ETH',
  [NET_ETHEREUM]: 'ETH',
  [NET_SEPOLIA]: 'ETH',
  [NET_POLYGON]: 'MATIC',
  [NET_ARBITRUM]: 'ETH',
  [NET_ARBITRUM_GOERLI]: 'AGOR',
  [NET_ARBITRUM_SEPOLIA]: 'ETH',
  [NET_OPT_ETH]: 'ETH',
  [NET_LINEA]: 'ETH',
  [NET_LINEA_GOERLI]: 'ETH',
  [NET_MANTLE]: 'MNT',
  [NET_MANTLE_TEST]: 'MNT',
  [NET_ETHEREUM_FORK]: 'ETH',
  [NET_MANTA_PACIFIC]: 'ETH',
  [NET_MANTA_PACIFIC_TEST]: 'MANTA',
  [NET_MODE_MAINNET]: 'ETH',
  [NET_ASTAR_ZK_EVM]: 'ETH',
  [NET_SCROLL]: 'ETH',
  [NET_MERLIN]: 'BTC',
  [NET_MERLIN_TEST]: 'BTC',
  [NET_B2]: 'BTC',
  [NET_METER]: 'MTR',
  [NET_BEVM]: 'BTC',
  [NET_OP_BNB]: 'BNB',
  [NET_BLAST]: 'ETH',
  [NET_X_LAYER]: 'OKB',
  [NET_SEI]: 'SEI',
};
export const NetworkLabels: NetworkConfMap<Network, string> = {
  [NET_ETHEREUM]: 'Ethereum' as const,
  [NET_SEPOLIA]: 'Sepolia' as const,
  [NET_BNB_TEST]: 'BSC Testnet' as const,
  [NET_BNB]: 'BSC' as const,
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
  [NET_MODE_MAINNET]: 'Mode' as const,
  [NET_ASTAR_ZK_EVM]: 'Astar zkEVM' as const,
  [NET_SCROLL]: 'Scroll' as const,
  [NET_MERLIN]: 'Merlin' as const,
  [NET_MERLIN_TEST]: 'Merlin Testnet' as const,
  [NET_B2]: 'B2' as const,
  [NET_METER]: 'Meter' as const,
  [NET_BEVM]: 'BEVM' as const,
  [NET_OP_BNB]: 'opBNB' as const,
  [NET_BLAST]: 'Blast' as const,
  [NET_X_LAYER]: 'X Layer' as const,
  [NET_SEI]: 'Sei' as const,
};
export const NetworkIcons: NetworkConfMap<Network, string> = {
  [NET_ETHEREUM]: eth,
  [NET_SEPOLIA]: eth,
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
  [NET_MODE_MAINNET]: mode,
  [NET_ASTAR_ZK_EVM]: astar,
  [NET_SCROLL]: scroll,
  [NET_MERLIN]: merlin,
  [NET_MERLIN_TEST]: merlin,
  [NET_B2]: b2,
  [NET_METER]: meter,
  [NET_BEVM]: '',
  [NET_OP_BNB]: bsc,
  [NET_BLAST]: blast,
  [NET_X_LAYER]: xLayer,
  [NET_SEI]: sei,
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
    rpcUrls: ['https://bsc-dataseed3.bnbchain.org'],
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
  [NET_SEPOLIA]: {
    chainId: '0xaa36a7',
    chainName: NetworkNames[NET_SEPOLIA],
    rpcUrls: ['https://rpc.sepolia.org', 'https://eth-sepolia.g.alchemy.com/v2/demo'],
    blockExplorerUrls: ['https://sepolia.etherscan.io'],
    nativeCurrency: {
      name: NetworkCurrency[NET_SEPOLIA],
      symbol: NetworkCurrency[NET_SEPOLIA],
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
  [NET_MODE_MAINNET]: {
    chainId: '0x868b',
    chainName: NetworkNames[NET_MODE_MAINNET],
    rpcUrls: ['https://mainnet.mode.network', 'https://1rpc.io/mode'],
    blockExplorerUrls: ['https://explorer.mode.network'],
    nativeCurrency: {
      name: NetworkCurrency[NET_MODE_MAINNET],
      symbol: NetworkCurrency[NET_MODE_MAINNET],
      decimals: 18,
    },
  },
  [NET_ASTAR_ZK_EVM]: {
    chainId: '0xec0',
    chainName: NetworkNames[NET_ASTAR_ZK_EVM],
    rpcUrls: [
      'https://rpc.startale.com/astar-zkevm',
      'https://rpc.astar-zkevm.gelato.digital',
      'https://astar-zkevm-rpc.dwellir.com',
    ],
    blockExplorerUrls: ['https://astar-zkevm.explorer.startale.com'],
    nativeCurrency: {
      name: NetworkCurrency[NET_ASTAR_ZK_EVM],
      symbol: NetworkCurrency[NET_ASTAR_ZK_EVM],
      decimals: 18,
    },
  },
  [NET_SCROLL]: {
    chainId: '0x82750',
    chainName: NetworkNames[NET_SCROLL],
    rpcUrls: ['https://rpc.scroll.io'],
    blockExplorerUrls: ['https://scrollscan.com'],
    nativeCurrency: {
      name: NetworkCurrency[NET_SCROLL],
      symbol: NetworkCurrency[NET_SCROLL],
      decimals: 18,
    },
  },
  [NET_MERLIN]: {
    chainId: '0x1068',
    chainName: NetworkNames[NET_MERLIN],
    rpcUrls: ['https://rpc.merlinchain.io'],
    blockExplorerUrls: ['https://scan.merlinchain.io'],
    nativeCurrency: {
      name: NetworkCurrency[NET_MERLIN],
      symbol: NetworkCurrency[NET_MERLIN],
      decimals: 18,
    },
  },
  [NET_MERLIN_TEST]: {
    chainId: '0xa7b14',
    chainName: NetworkNames[NET_MERLIN_TEST],
    rpcUrls: ['https://testnet-rpc.merlinchain.io'],
    blockExplorerUrls: ['https://testnet-scan.merlinchain.io'],
    nativeCurrency: {
      name: NetworkCurrency[NET_MERLIN_TEST],
      symbol: NetworkCurrency[NET_MERLIN_TEST],
      decimals: 18,
    },
  },
  [NET_B2]: {
    chainId: '0xdf',
    chainName: NetworkNames[NET_B2],
    rpcUrls: ['https://rpc.bsquared.network'],
    blockExplorerUrls: ['https://explorer.bsquared.network/'],
    nativeCurrency: {
      name: NetworkCurrency[NET_B2],
      symbol: NetworkCurrency[NET_B2],
      decimals: 18,
    },
  },
  [NET_METER]: {
    chainId: '0x52',
    chainName: NetworkNames[NET_METER],
    rpcUrls: ['https://rpc.meter.io'],
    blockExplorerUrls: ['https://explorer.meter.io'],
    nativeCurrency: {
      name: NetworkCurrency[NET_METER],
      symbol: NetworkCurrency[NET_METER],
      decimals: 18,
    },
  },
  [NET_BEVM]: {
    chainId: '0x2ced',
    chainName: NetworkNames[NET_BEVM],
    rpcUrls: ['https://rpc-mainnet-1.bevm.io', 'https://rpc-mainnet-2.bevm.io'],
    blockExplorerUrls: ['https://scan-mainnet.bevm.io'],
    nativeCurrency: {
      name: NetworkCurrency[NET_BEVM],
      symbol: NetworkCurrency[NET_BEVM],
      decimals: 18,
    },
  },
  [NET_OP_BNB]: {
    chainId: '0xcc',
    chainName: NetworkNames[NET_OP_BNB],
    rpcUrls: ['https://opbnb-mainnet-rpc.bnbchain.org', 'https://opbnb.publicnode.com'],
    blockExplorerUrls: ['https://opbnbscan.com'],
    nativeCurrency: {
      name: NetworkCurrency[NET_OP_BNB],
      symbol: NetworkCurrency[NET_OP_BNB],
      decimals: 18,
    },
  },
  [NET_BLAST]: {
    chainId: '0x13e31',
    chainName: NetworkNames[NET_BLAST],
    rpcUrls: [
      'https://rpc.blast.io',
      'https://rpc.ankr.com/blast',
      'https://blastl2-mainnet.public.blastapi.io',
      'https://blast.din.dev/rpc',
      'https://blast.blockpi.network/v1/rpc/public',
    ],
    blockExplorerUrls: ['https://blastscan.io/'],
    nativeCurrency: {
      name: NetworkCurrency[NET_BLAST],
      symbol: NetworkCurrency[NET_BLAST],
      decimals: 18,
    },
  },
  [NET_X_LAYER]: {
    chainId: '0xc4',
    chainName: NetworkNames[NET_X_LAYER],
    rpcUrls: ['https://rpc.xlayer.tech', 'https://xlayerrpc.okx.com'],
    blockExplorerUrls: ['https://www.okx.com/web3/explorer/xlayer'],
    nativeCurrency: {
      name: NetworkCurrency[NET_X_LAYER],
      symbol: NetworkCurrency[NET_X_LAYER],
      decimals: 18,
    },
  },
  [NET_SEI]: {
    chainId: '0x531',
    chainName: NetworkNames[NET_SEI],
    rpcUrls: ['https://evm-rpc.sei-apis.com'],
    blockExplorerUrls: ['https://seitrace.com'],
    nativeCurrency: {
      name: NetworkCurrency[NET_SEI],
      symbol: NetworkCurrency[NET_SEI],
      decimals: 18,
    },
  },
};

export function chainScanAddressExploreUrl(network: Network, address: string): string {
  let host: string = NetworkParams[network].blockExplorerUrls[0];
  host = _.trimEnd(host, '/');

  return host + '/address/' + address;
}

export function chainScanTxExploreUrl(network: Network, txHash: string): string {
  let host: string = NetworkParams[network].blockExplorerUrls[0];
  host = _.trimEnd(host, '/');

  return host + '/tx/' + txHash;
}
