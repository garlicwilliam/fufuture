import {
  NET_ARBITRUM,
  NET_ARBITRUM_SEPOLIA,
  NET_ASTAR_ZK_EVM,
  NET_B2,
  NET_BASE,
  NET_BNB,
  NET_BNB_TEST,
  NET_ETHEREUM,
  NET_LINEA,
  NET_MANTA_PACIFIC,
  NET_MANTA_PACIFIC_TEST,
  NET_MANTLE,
  NET_MERLIN,
  NET_METER,
  NET_MODE_MAINNET,
  NET_SCROLL,
  NET_SEPOLIA,
  NET_BLAST,
  NET_X_LAYER,
  NET_OPT_ETH,
  NET_SEI,
  NET_POLYGON,
  NET_BEVM,
  NET_OP_BNB,
} from './network';
import {
  genRpcProviderGetter,
  genRpcProviderGetterAsync,
  RpcProviderGetter,
  RpcProviderGetterAsync,
} from '../state-manager/contract/contract-provider-utils';

export const RPC_URLS = {
  [NET_BNB_TEST]: 'https://data-seed-prebsc-2-s2.binance.org:8545/',
  [NET_BNB]: [
    'https://bscrpc.com',
    'https://bsc-dataseed.bnbchain.org',
    'https://bsc-dataseed.nariox.org',
    'https://bsc.meowrpc.com',
  ],
  [NET_ETHEREUM]: [
    'https://rpc.mevblocker.io/noreverts',
    'https://rpc.ankr.com/eth',
    'https://eth-mainnet.public.blastapi.io',
    'https://rpc.mevblocker.io/fast',
  ],
  [NET_SEPOLIA]: 'https://sepolia.infura.io/v3/abc4c36a4ae54715bc7a4ecedd5a8490',
  [NET_MANTA_PACIFIC]: [
    'https://pacific-rpc.manta.network/http',
    'https://manta-pacific.drpc.org',
    'https://1rpc.io/manta',
  ],
  [NET_MANTA_PACIFIC_TEST]: 'https://pacific-rpc.testnet.manta.network/http',
  [NET_ARBITRUM]: ['https://arbitrum.llamarpc.com', 'https://1rpc.io/arb', 'https://arbitrum.drpc.org'],
  [NET_ARBITRUM_SEPOLIA]: 'https://arbitrum-sepolia.infura.io/v3/abc4c36a4ae54715bc7a4ecedd5a8490',
  [NET_SCROLL]: ['https://scroll.public-rpc.com'],
  [NET_MERLIN]: 'https://rpc.merlinchain.io',
  [NET_B2]: 'https://rpc.bsquared.network',
  [NET_LINEA]: ['https://rpc.linea.build', 'https://linea.drpc.org'],
  [NET_MANTLE]: [
    'https://rpc.ankr.com/mantle',
    'https://rpc.mantle.xyz',
    'https://mantle.drpc.org',
    'https://mantle-mainnet.public.blastapi.io',
  ],
  [NET_BASE]: [
    'https://mainnet.base.org',
    'https://base.drpc.org',
    'https://base-mainnet.public.blastapi.io',
    'https://1rpc.io/base',
  ],
  [NET_MODE_MAINNET]: ['https://mode.drpc.org', 'https://1rpc.io/mode', 'https://mainnet.mode.network'],
  [NET_ASTAR_ZK_EVM]: ['https://rpc.startale.com/astar-zkevm'],
  [NET_METER]: ['https://rpc.meter.io'],
  [NET_BLAST]: [
    'https://rpc.blast.io',
    'https://rpc.ankr.com/blast',
    'https://blastl2-mainnet.public.blastapi.io',
    'https://rpc.blastblockchain.com',
  ],
  [NET_X_LAYER]: ['https://rpc.xlayer.tech', 'https://xlayerrpc.okx.com'],
  [NET_OPT_ETH]: ['https://rpc.ankr.com/optimism', 'https://optimism-rpc.publicnode.com', 'https://optimism.drpc.org'],
  [NET_SEI]: ['https://evm-rpc.sei-apis.com', 'https://sei.public-rpc.com'],
};

export const RPC_CACHE_URLS = {
  [NET_ETHEREUM]: ['https://points.stakestone.io/contract/eth'],
  [NET_BNB]: ['https://points.stakestone.io/contract/bsc'],
  [NET_BASE]: ['https://points.stakestone.io/contract/base'],
  [NET_ARBITRUM]: ['https://points.stakestone.io/contract/arb'],
  [NET_POLYGON]: ['https://points.stakestone.io/contract/polygon'],
  [NET_OPT_ETH]: ['https://points.stakestone.io/contract/op'],
  [NET_LINEA]: ['https://points.stakestone.io/contract/linea'],
  [NET_MANTLE]: ['https://points.stakestone.io/contract/mantle'],
  [NET_MANTA_PACIFIC]: ['https://points.stakestone.io/contract/manta'],
  [NET_MODE_MAINNET]: ['https://points.stakestone.io/contract/mode'],
  [NET_ASTAR_ZK_EVM]: ['https://points.stakestone.io/contract/astar'],
  [NET_SCROLL]: ['https://points.stakestone.io/contract/scroll'],
  [NET_MERLIN]: ['https://points.stakestone.io/contract/merlin'],
  [NET_B2]: ['https://points.stakestone.io/contract/b2'],
  [NET_METER]: ['https://points.stakestone.io/contract/meter'],
  [NET_BEVM]: ['https://points.stakestone.io/contract/bevm'],
  [NET_OP_BNB]: ['https://points.stakestone.io/contract/opbnb'],
  [NET_BLAST]: ['https://points.stakestone.io/contract/blast'],
  [NET_X_LAYER]: ['https://points.stakestone.io/contract/xlayer'],
  [NET_SEI]: ['https://points.stakestone.io/contract/sei'],
};

const providersGetter: RpcProviderGetter = genRpcProviderGetter(RPC_URLS);
const providersGetterAsync: RpcProviderGetterAsync = genRpcProviderGetterAsync(RPC_URLS);
const providersWithCacheGetter: RpcProviderGetter = genRpcProviderGetter(RPC_CACHE_URLS);

export const rpcProviderGetter = providersGetter;
export const rpcProviderGetterAsync = providersGetterAsync;
export const rpcProviderWithCacheGetter = providersWithCacheGetter;
