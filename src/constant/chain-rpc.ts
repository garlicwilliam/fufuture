import { NET_BNB, NET_BNB_TEST, NET_ETHEREUM, NET_GOERLI, NET_MANTA_PACIFIC, NET_MANTA_PACIFIC_TEST } from './network';

export const RPC_URLS = {
  [NET_BNB_TEST]: 'https://data-seed-prebsc-2-s2.binance.org:8545/',
  [NET_BNB]: 'https://bscrpc.com',
  [NET_ETHEREUM]: 'https://mainnet.infura.io/v3/abc4c36a4ae54715bc7a4ecedd5a8490',
  [NET_GOERLI]: 'https://goerli.infura.io/v3/abc4c36a4ae54715bc7a4ecedd5a8490',
  [NET_MANTA_PACIFIC]: 'https://pacific-rpc.manta.network/http',
  [NET_MANTA_PACIFIC_TEST]: 'https://pacific-rpc.testnet.manta.network/http',
};
