import { DatabaseStateMerger } from '../../../interface';
import { ShieldMakerPrivatePoolInfo, ShieldMakerPrivatePoolInfoRs } from '../../../state-types';
import { from, mergeMap, Observable, of, switchMap } from 'rxjs';
import { httpPost } from '../../../../util/http';
import { map, take, toArray } from 'rxjs/operators';
import * as _ from 'lodash';
import { makerPriLiquidityGetter } from '../../../contract/contract-getter-cpx-shield';
import { snRep } from '../../../interface-util';
import { walletState } from '../../../wallet/wallet-state';
import { SLD_ENV_CONF } from '../../../../components/shield-option-trade/const/env';
import { NET_BNB, Network } from '../../../../constant/network';
import { EMPTY_ADDRESS } from '../../../../constant';
import { ethers } from 'ethers';

export class MergerMakerLiquidity implements DatabaseStateMerger<ShieldMakerPrivatePoolInfoRs, [string, Network]> {
  mergeWatch(...args: [string, Network]): Observable<ShieldMakerPrivatePoolInfoRs> {
    return this.doGet(args[0], args[1]);
  }

  mock(args?: [string, Network]): Observable<ShieldMakerPrivatePoolInfoRs> | ShieldMakerPrivatePoolInfoRs {
    return {
      maker: args ? args[0] : EMPTY_ADDRESS,
      network: args ? args[1] : NET_BNB,
      pools: [],
    };
  }

  pending(): Observable<boolean> {
    return of(false);
  }

  private doGet(makerAddress: string, network: Network): Observable<ShieldMakerPrivatePoolInfoRs> {
    const emptyRs = {
      maker: makerAddress,
      network,
      pools: [],
    };

    const url: string | undefined = SLD_ENV_CONF.Supports[network]?.SubGraphUrl;

    if (!url) {
      return of(emptyRs);
    }

    return httpPost(url, this.genParam(makerAddress)).pipe(
      map(res => {
        const isOK = _.get(res, 'status', 400) === 200 && _.get(res, 'body.data') !== undefined;

        if (!isOK) {
          return [];
        }

        const liquidityArr = _.get(res, 'body.data.addLiquidityPrivates');
        const poolAddress: string[] = liquidityArr.map(one => one.fromContract);

        return Array.from(new Set(poolAddress));
      }),
      switchMap((address: string[]) => {
        return this.getMakerLiquidity(address, makerAddress);
      }),
      map(pools => {
        return { maker: makerAddress, network, pools };
      })
    );
  }

  private getMakerLiquidity(poolAddresses: string[], maker: string): Observable<ShieldMakerPrivatePoolInfo[]> {
    if (poolAddresses.length === 0) {
      return of([]);
    }

    return from(poolAddresses).pipe(
      mergeMap(poolAddress => {
        return this.getMakerPriPoolInfo(poolAddress, maker);
      }),
      toArray(),
      map((info: (ShieldMakerPrivatePoolInfo | null)[]) => {
        return info.filter(Boolean) as ShieldMakerPrivatePoolInfo[];
      }),
      map(info => {
        info.sort((a, b) => (a.indexUnderlying + a.token.symbol < b.indexUnderlying + a.token.symbol ? -1 : 1));
        return info;
      })
    );
  }

  private getMakerPriPoolInfo(poolAddress: string, maker: string): Observable<ShieldMakerPrivatePoolInfo | null> {
    return walletState.watchWeb3Provider().pipe(
      take(1),
      switchMap((provider: ethers.providers.Web3Provider) => {
        return makerPriLiquidityGetter(maker, poolAddress, provider).pipe(
          map(rs => {
            return snRep(rs);
          })
        );
      })
    );
  }

  private genParam(maker: string): any {
    return {
      query: `{ addLiquidityPrivates(first: 1000, where:{ account: "${maker}"} ) { fromContract, }}`,
      variables: {},
    };
  }
}
