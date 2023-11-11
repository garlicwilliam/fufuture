import { DatabaseStateMerger } from '../../../interface';
import { ShieldMakerPrivatePoolInfo } from '../../../state-types';
import { from, mergeMap, Observable, of, switchMap } from 'rxjs';
import { SUB_GRAPH_API } from '../../../../components/shield-option-trade/const/default';
import { httpPost } from '../../../../util/http';
import { map, take, toArray } from 'rxjs/operators';
import * as _ from 'lodash';
import { makerPriLiquidityGetter } from '../../../contract/contract-getter-cpx-shield';
import { snRep } from '../../../interface-util';
import { walletState } from '../../../wallet/wallet-state';

export class MergerMakerLiquidity implements DatabaseStateMerger<ShieldMakerPrivatePoolInfo[], [string]> {
  mergeWatch(...args: [string]): Observable<ShieldMakerPrivatePoolInfo[]> {
    return this.doGet(args[0]);
  }

  mock(args?: [string]): Observable<ShieldMakerPrivatePoolInfo[]> | ShieldMakerPrivatePoolInfo[] {
    return [];
  }

  pending(): Observable<boolean> {
    return of(false);
  }

  private doGet(makerAddress: string): Observable<ShieldMakerPrivatePoolInfo[]> {
    const url = SUB_GRAPH_API;
    if (!url) {
      return of([]);
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
      })
    );
  }

  private getMakerLiquidity(poolAddresses: string[], maker: string): Observable<ShieldMakerPrivatePoolInfo[]> {
    return from(poolAddresses).pipe(
      mergeMap(poolAddress => {
        return this.getMakerPriPoolInfo(poolAddress, maker);
      }),
      toArray(),
      map(info => {
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
      switchMap(provider => {
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
      query: `{ addLiquidityPrivates( where:{ account: "${maker}"} ) { fromContract, }}`,
      variables: {},
    };
  }
}
