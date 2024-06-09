import {
  NET_ARBITRUM,
  NET_ARBITRUM_SEPOLIA,
  NET_B2,
  NET_BNB,
  NET_BNB_TEST,
  NET_ETHEREUM,
  NET_MANTA_PACIFIC,
  NET_MANTA_PACIFIC_TEST,
  NET_MERLIN,
  NET_SCROLL,
  NET_SEPOLIA,
} from './network';
import { genRpcProviderGetter, RpcProviderGetter } from '../state-manager/contract/contract-provider-utils';

export const RPC_URLS = {
  [NET_BNB_TEST]: 'https://data-seed-prebsc-2-s2.binance.org:8545/',
  [NET_BNB]: 'https://bscrpc.com',
  [NET_ETHEREUM]: [
    'https://rpc.mevblocker.io/noreverts',
    'https://rpc.ankr.com/eth',
    'https://rpc.payload.de',
    'https://rpc.mevblocker.io/fast',
  ],
  [NET_SEPOLIA]: 'https://sepolia.infura.io/v3/abc4c36a4ae54715bc7a4ecedd5a8490',
  [NET_MANTA_PACIFIC]: 'https://pacific-rpc.manta.network/http',
  [NET_MANTA_PACIFIC_TEST]: 'https://pacific-rpc.testnet.manta.network/http',
  [NET_ARBITRUM]: 'https://arbitrum.public-rpc.com',
  [NET_ARBITRUM_SEPOLIA]: 'https://arbitrum-sepolia.infura.io/v3/abc4c36a4ae54715bc7a4ecedd5a8490',
  [NET_SCROLL]: 'https://scroll.blockpi.network/v1/rpc/public',
  [NET_MERLIN]: 'https://rpc.merlinchain.io',
  [NET_B2]: 'https://rpc.bsquared.network',
};

const providersGetter: RpcProviderGetter = genRpcProviderGetter(RPC_URLS);

export const getRpcProvider = providersGetter;
