import { Network } from '../../../constant/network';
import { ShieldUnderlyingType, TokenErc20 } from '../../../state-manager/state-types';
import { SldDecimal } from '../../../util/decimal';
import { Contract } from 'ethers';

export type Call = {
  jsonrpc: '2.0';
  method: 'eth_call';
  params: [
    {
      to: string;
      data: string;
    },
    'latest'
  ];
  id: number;
};

export type TokenRpcRequestMeta = {
  id: number;
  type: 'sym' | 'dec';
  token: string;
  contract: Contract;
};
export type TokenUserBalanceMeta = {
  id: number;
  token: TokenErc20;
  tokenContract: Contract;
};
export type UnderlyingRpcRequestMeta = {
  id: number;
  pool: string;
  contract: Contract;
};
export type PriLiquidityRpcRequestMeta = {
  id: number;
  pool: PrivatePool;
  tokenContract: Contract;
};
export type PubLiqRpcRequestMeta = {
  id: number;
  pool: PublicPool;
  poolContract: Contract;
};
export type PrivatePoolRes = {
  network: Network;
  pool: string;
  indexUnderlying: ShieldUnderlyingType;
};

export type PrivatePool = {
  network: Network;
  poolAddress: string;
  token: TokenErc20;
  indexUnderlying: ShieldUnderlyingType;
};
export type PublicPool = {
  network: Network;
  poolAddress: string;
  token: TokenErc20;
};
export type TokenPool = {
  network: Network;
  underlying: ShieldUnderlyingType;
  token: TokenErc20;
  private?: PrivatePool;
  public?: PublicPool;
  volume?: SldDecimal;
};
export type TokenPoolList = {
  network: Network;
  underlying: ShieldUnderlyingType;
  pools: TokenPool[] | undefined;
};

export type TokenBalanceList = {
  network: Network;
  tokens: { [t: string]: SldDecimal };
};
