import { BigNumber, Contract } from 'ethers';
import { Network } from '../../../constant/network';
import { ShieldTokenSearchList, TokenErc20 } from '../../../state-manager/state-types';
import { from, Observable } from 'rxjs';
import { JsonRpcProvider } from '@uniswap/widgets';
import { getShieldRpcProviderCache } from '../const/http-rpc';
import { ERC20 } from '../../../wallet/abi';
import { fetchJson } from '@ethersproject/web';
import { map } from 'rxjs/operators';
import { ABI_PRIVATE_POOL, ABI_PUBLIC_POOL } from '../const/shield-option-abi';
import { SldDecimal } from '../../../util/decimal';
import {
  Call,
  PriLiquidityRpcRequestMeta,
  PrivatePool,
  PrivatePoolRes,
  PublicPool,
  PubLiqRpcRequestMeta,
  TokenRpcRequestMeta,
  TokenUserBalanceMeta,
  UnderlyingRpcRequestMeta,
} from './types';

export function poolCacheKey(poolAddress: string, network: Network): string {
  return network + ':' + poolAddress.toLowerCase();
}

export function batchFetchTokenInfo(
  tokenAddresses: string[],
  network: Network
): Observable<{ [p: string]: TokenErc20 }> {
  const rpcProvider: JsonRpcProvider = getShieldRpcProviderCache(network);
  const metas: TokenRpcRequestMeta[] = [];
  const tokenReqData: Call[] = tokenAddresses
    .map(tokenAddress => {
      return new Contract(tokenAddress, ERC20, rpcProvider);
    })
    .map((contract: Contract) => {
      const to: string = contract.address;
      const symData: string = contract.interface.encodeFunctionData('symbol', []);
      const decData: string = contract.interface.encodeFunctionData('decimals', []);

      return {
        to,
        symData,
        decData,
        contract,
      };
    })
    .map((data, index) => {
      const id1: number = index * 2;
      const id2: number = id1 + 1;

      const callSym: Call = {
        jsonrpc: '2.0',
        method: 'eth_call',
        params: [
          {
            to: data.to,
            data: data.symData,
          },
          'latest',
        ],
        id: id1,
      };
      const callDec: Call = {
        jsonrpc: '2.0',
        method: 'eth_call',
        params: [
          {
            to: data.to,
            data: data.decData,
          },
          'latest',
        ],
        id: id2,
      };
      const meta1: TokenRpcRequestMeta = {
        id: id1,
        type: 'sym',
        token: data.to,
        contract: data.contract,
      };
      const meta2: TokenRpcRequestMeta = {
        id: id2,
        type: 'dec',
        token: data.to,
        contract: data.contract,
      };

      metas.push(meta1, meta2);

      return [callSym, callDec];
    })
    .reduce((acc: Call[], cur: Call[]) => {
      return [...acc, ...cur];
    }, []);

  metas.sort((a, b) => a.id - b.id);

  return from(fetchJson(rpcProvider.connection, JSON.stringify(tokenReqData))).pipe(
    map(res => {
      return res.map((data, index): { data: any; meta: TokenRpcRequestMeta } => {
        const meta: TokenRpcRequestMeta = metas[data.id];
        return { data, meta };
      });
    }),
    map((resDataArr: { data: any; meta: TokenRpcRequestMeta }[]) => {
      return resDataArr.map(resData => {
        const method = resData.meta.type === 'sym' ? 'symbol' : 'decimals';
        const result = resData.meta.contract.interface.decodeFunctionResult(method, resData.data.result);

        return { meta: resData.meta, result: result[0] };
      });
    }),
    map(allResults => {
      const erc20Tokens: { [addr: string]: TokenErc20 } = {};

      allResults.forEach(rs => {
        const addr: string = rs.meta.token.toLowerCase();
        const data: Partial<TokenErc20> = rs.meta.type === 'sym' ? { symbol: rs.result } : { decimal: rs.result };
        const old: TokenErc20 = erc20Tokens[addr] || { address: addr, network };

        erc20Tokens[addr] = Object.assign(old, data);
      });

      return erc20Tokens;
    })
  );
}

export function batchFetchPoolInfo(
  poolAddresses: string[],
  network: Network
): Observable<{ [p: string]: PrivatePoolRes }> {
  const rpcProvider: JsonRpcProvider = getShieldRpcProviderCache(network);

  const metas: UnderlyingRpcRequestMeta[] = [];
  const calls: Call[] = poolAddresses
    .map(address => {
      const contract: Contract = new Contract(address, ABI_PRIVATE_POOL, rpcProvider);
      const underlyingData: string = contract.interface.encodeFunctionData('underlyingName', []);
      const to: string = contract.address;

      return { to, contract, underlyingData };
    })
    .map((reqData, index) => {
      const call: Call = {
        jsonrpc: '2.0',
        method: 'eth_call',
        params: [
          {
            to: reqData.to,
            data: reqData.underlyingData,
          },
          'latest',
        ],
        id: index,
      };
      const meta: UnderlyingRpcRequestMeta = {
        id: index,
        contract: reqData.contract,
        pool: reqData.contract.address,
      };

      metas.push(meta);

      return { call, meta };
    })
    .reduce((acc, cur) => {
      return [...acc, cur.call];
    }, [] as Call[]);

  metas.sort((a, b) => a.id - b.id);

  return from(fetchJson(rpcProvider.connection, JSON.stringify(calls))).pipe(
    map(res => {
      return res.map((data, index) => {
        const meta: UnderlyingRpcRequestMeta = metas[data.id];
        return { data, meta };
      });
    }),
    map((dataArr: { data; meta }[]) => {
      return dataArr.map(data => {
        const result = data.meta.contract.interface.decodeFunctionResult('underlyingName', data.data.result);
        return { meta: data.meta, result: result[0] };
      });
    }),
    map(allResults => {
      const pools: { [p: string]: PrivatePoolRes } = {};

      allResults.forEach(rs => {
        const poolAddr: string = rs.meta.pool.toLowerCase();

        const pool: PrivatePoolRes = {
          network,
          pool: poolAddr,
          indexUnderlying: rs.result,
        };

        pools[poolAddr] = pool;
      });

      return pools;
    })
  );
}

export function batchFetchPrivateLiquidity(pools: PrivatePool[], network: Network): Observable<any> {
  const rpcProvider: JsonRpcProvider = getShieldRpcProviderCache(network);
  const metas: PriLiquidityRpcRequestMeta[] = [];

  const calls: Call[] = pools
    .map((pool, index) => {
      const tokenAddr: string = pool.token.address.toLowerCase();
      const poolAddr: string = pool.poolAddress.toLowerCase();
      const tokenContract: Contract = new Contract(tokenAddr, ERC20, getShieldRpcProviderCache(pool.network));

      const call: Call = {
        jsonrpc: '2.0',
        method: 'eth_call',
        params: [
          {
            to: tokenAddr,
            data: tokenContract.interface.encodeFunctionData('balanceOf', [poolAddr]),
          },
          'latest',
        ],
        id: index,
      };
      const meta: PriLiquidityRpcRequestMeta = {
        id: index,
        pool,
        tokenContract: tokenContract,
      };

      metas.push(meta);

      return { call, meta };
    })
    .reduce((acc, cur) => {
      return [...acc, cur.call];
    }, [] as Call[]);

  metas.sort((a, b) => a.id - b.id);

  return from(fetchJson(rpcProvider.connection, JSON.stringify(calls))).pipe(
    map(res => {
      return res.map((data, index) => {
        const meta: PriLiquidityRpcRequestMeta = metas[data.id];
        return { data, meta };
      });
    }),
    map((dataArr: { data: any; meta: PriLiquidityRpcRequestMeta }[]) => {
      return dataArr.map(data => {
        const result = data.data.result
          ? data.meta.tokenContract.interface.decodeFunctionResult('balanceOf', data.data.result)
          : [BigNumber.from('0')];

        return { meta: data.meta, result: result[0] };
      });
    }),
    map((allResults: { meta: PriLiquidityRpcRequestMeta; result: BigNumber }[]) => {
      const liquidity: { [k: string]: SldDecimal } = {};

      allResults.forEach((rs: { meta: PriLiquidityRpcRequestMeta; result: BigNumber }) => {
        const key: string = poolCacheKey(rs.meta.pool.poolAddress, rs.meta.pool.network);
        const liq: SldDecimal = SldDecimal.fromOrigin(BigNumber.from(rs.result), rs.meta.pool.token.decimal);

        liquidity[key] = liq;
      });

      return liquidity;
    })
  );
}

export function batchFetchPublicLiquidity(pools: PublicPool[], network: Network): Observable<any> {
  const rpcProvider: JsonRpcProvider = getShieldRpcProviderCache(network);
  const metas: PubLiqRpcRequestMeta[] = [];

  const calls: Call[] = pools
    .map((pool, index) => {
      const poolContract: Contract = new Contract(pool.poolAddress, ABI_PUBLIC_POOL, rpcProvider);

      const call: Call = {
        jsonrpc: '2.0',
        method: 'eth_call',
        params: [
          {
            to: pool.poolAddress,
            data: poolContract.interface.encodeFunctionData('publicPoolInfo', []),
          },
          'latest',
        ],
        id: index,
      };
      const meta: PubLiqRpcRequestMeta = {
        id: index,
        pool,
        poolContract,
      };

      metas.push(meta);

      return { meta, call };
    })
    .reduce((acc, cur) => {
      return [...acc, cur.call];
    }, [] as Call[]);

  metas.sort((a, b) => a.id - b.id);

  return from(fetchJson(rpcProvider.connection, JSON.stringify(calls))).pipe(
    map(res => {
      return res.map((data, index) => {
        const meta: PubLiqRpcRequestMeta = metas[data.id];
        return { data, meta };
      });
    }),
    map((dataArr: { data: any; meta: PubLiqRpcRequestMeta }[]) => {
      return dataArr.map(data => {
        const result = data.meta.poolContract.interface.decodeFunctionResult('publicPoolInfo', data.data.result);
        return { meta: data.meta, result: result[0] }; // 0 is deposit amount
      });
    }),
    map(allResults => {
      const liquidity: { [k: string]: SldDecimal } = {};

      allResults.forEach(rs => {
        const key: string = poolCacheKey(rs.meta.pool.poolAddress, rs.meta.pool.network);
        const liq: SldDecimal = SldDecimal.fromOrigin(BigNumber.from(rs.result), rs.meta.pool.token.decimal);

        liquidity[key] = liq;
      });

      return liquidity;
    })
  );
}

export function batchFetchTokenBalance(tokens: ShieldTokenSearchList, user: string): Observable<any> {
  const rpcProvider: JsonRpcProvider = getShieldRpcProviderCache(tokens.network);
  const metas: TokenUserBalanceMeta[] = [];

  const calls: Call[] = tokens.tokens
    .map((token, index) => {
      const tokenContract: Contract = new Contract(
        token.address.toLowerCase(),
        ERC20,
        getShieldRpcProviderCache(token.network)
      );

      const call: Call = {
        jsonrpc: '2.0',
        method: 'eth_call',
        params: [
          {
            to: token.address.toLowerCase(),
            data: tokenContract.interface.encodeFunctionData('balanceOf', [user.toLowerCase()]),
          },
          'latest',
        ],
        id: index,
      };
      const meta: TokenUserBalanceMeta = {
        id: index,
        token,
        tokenContract,
      };

      metas.push(meta);

      return { call, meta };
    })
    .reduce((acc, cur) => {
      return [...acc, cur.call];
    }, [] as Call[]);

  metas.sort((a, b) => a.id - b.id);

  return from(fetchJson(rpcProvider.connection, JSON.stringify(calls))).pipe(
    map(res => {
      return res.map((data, index) => {
        const meta: TokenUserBalanceMeta = metas[data.id];
        return { data, meta };
      });
    }),
    map((dataArr: { data: any; meta: TokenUserBalanceMeta }[]) => {
      return dataArr.map(data => {
        const result = data.data.result
          ? data.meta.tokenContract.interface.decodeFunctionResult('balanceOf', data.data.result)
          : [BigNumber.from(0)];

        return { meta: data.meta, result: result[0] };
      });
    }),
    map((allResults: { meta: TokenUserBalanceMeta; result: BigNumber }[]) => {
      const balances: { [k: string]: SldDecimal } = {};

      allResults.forEach(rs => {
        const balance: SldDecimal = SldDecimal.fromOrigin(BigNumber.from(rs.result), rs.meta.token.decimal);
        balances[rs.meta.token.address] = balance;
      });

      return balances;
    })
  );
}
