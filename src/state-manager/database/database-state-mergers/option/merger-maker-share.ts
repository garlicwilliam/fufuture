import { DatabaseStateMerger } from '../../../interface';
import { ShieldMakerPublicPoolShare, StateNullType } from '../../../state-types';
import { from, mergeMap, Observable, of, switchMap, combineLatest } from 'rxjs';
import { SUB_GRAPH_API } from '../../../../components/shield-option-trade/const/default';
import { httpPost } from '../../../../util/http';
import { map, take, toArray } from 'rxjs/operators';
import * as _ from 'lodash';
import { makerPubPoolShareGetter } from '../../../contract/contract-getter-cpx-shield';
import { isSN } from '../../../interface-util';
import { walletState } from '../../../wallet/wallet-state';

export class MergerMakerShare implements DatabaseStateMerger<ShieldMakerPublicPoolShare[], [string]> {
  mergeWatch(...args: [string]): Observable<ShieldMakerPublicPoolShare[]> {
    return this.doGet(args[0]);
  }

  mock(args?: [string]): Observable<ShieldMakerPublicPoolShare[]> | ShieldMakerPublicPoolShare[] {
    return [];
  }

  pending(): Observable<boolean> {
    return of(false);
  }

  private doGet(maker: string): Observable<ShieldMakerPublicPoolShare[]> {
    const url = SUB_GRAPH_API;
    if (!url) {
      return of([]);
    }

    return httpPost(url, this.genParam(maker)).pipe(
      map(res => {
        const isOK = _.get(res, 'status', 400) === 200 && _.get(res, 'body.data') !== undefined;

        if (!isOK) {
          return [];
        }

        const liquidityArr = _.get(res, 'body.data.addLiquidityPublics', []);

        const addresses: string[] = liquidityArr.map(one => one.fromContract);

        return Array.from(new Set(addresses));
      }),
      switchMap((addresses: string[]) => {
        const provider$ = walletState.watchWeb3Provider().pipe(take(1));
        const address$ = from(addresses);

        return combineLatest([address$, provider$]).pipe(
          mergeMap(([address, provider]) => {
            return makerPubPoolShareGetter(maker, address, provider);
          }),
          toArray(),
          map((info: (ShieldMakerPublicPoolShare | StateNullType)[]) => {
            return info.filter(one => !isSN(one)) as ShieldMakerPublicPoolShare[];
          })
        );
      })
    );
  }

  private genParam(maker: string) {
    return {
      query: `{ addLiquidityPublics(where: {account:"${maker}"}) { fromContract }}`,
      variables: {},
    };
  }
}
