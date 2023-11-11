import { DatabaseStateMerger } from '../../../interface';
import { ShieldMakerOrderInfo, ShieldMakerPrivatePoolInfo } from '../../../state-types';
import { BehaviorSubject, Observable, of, switchMap, zip } from 'rxjs';
import { SUB_GRAPH_API } from '../../../../components/shield-option-trade/const/default';
import { httpPost } from '../../../../util/http';
import { finalize, map, take, tap } from 'rxjs/operators';
import * as _ from 'lodash';
import { makerPriPoolOrdersGetter } from '../../../contract/contract-getter-cpx-shield';
import { shieldOptionTradeContracts } from '../../../const/shield-option-trade-contract';
import { BigNumber } from 'ethers';

type OrderId = {
  orderID: string;
  makerID: string;
};

export class MergerMakerLockedDetail
  implements DatabaseStateMerger<ShieldMakerOrderInfo[], [ShieldMakerPrivatePoolInfo]>
{
  private isPending: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  mergeWatch(...args: [ShieldMakerPrivatePoolInfo]): Observable<ShieldMakerOrderInfo[]> {
    return this.doGet(args[0]);
  }

  mock(args?: [ShieldMakerPrivatePoolInfo]): Observable<ShieldMakerOrderInfo[]> | ShieldMakerOrderInfo[] {
    return [];
  }

  pending(): Observable<boolean> {
    return this.isPending;
  }

  private doGet(pool: ShieldMakerPrivatePoolInfo): Observable<ShieldMakerOrderInfo[]> {
    const url = SUB_GRAPH_API;

    if (!url || !pool) {
      return of([]);
    }

    const info$ = httpPost(url, this.genParam(pool.holder, pool.priPoolAddress)).pipe(
      map(res => {
        const isOK: boolean = _.get(res, 'status', 400) === 200;
        const data = _.get(res, 'body.data');
        const isData: boolean = data !== undefined;

        if (!isOK || !isData) {
          return [];
        }

        const opens = data['matchWithPrivatePools'];
        const closes = data['closeInPrivatePools'];
        const risks = data['riskInPrivatePools'];

        return this.parseMakerOrderIndexes(opens, closes, risks);
      }),
      switchMap((makerIndex: number[]) => {
        const optionContract$ = shieldOptionTradeContracts.CONTRACTS.optionTrade.pipe(take(1));

        return zip(optionContract$, of(pool), of(makerIndex));
      }),
      switchMap(([optionContract, pool, makerIndex]) => {
        const makerOrderIndexes = makerIndex.map(m => BigNumber.from(m));
        const orders$: Observable<ShieldMakerOrderInfo[]> = makerPriPoolOrdersGetter(
          optionContract,
          pool,
          makerOrderIndexes
        );

        return orders$;
      }),
      map((orders: ShieldMakerOrderInfo[]) => {
        return orders.sort((a, b) => {
          return b.id.sub(a.id).toNumber();
        });
      })
    );

    return this.doGetPending(info$);
  }

  private doGetPending<T>(obs$: Observable<T>): Observable<T> {
    return of(true).pipe(
      tap(() => {
        this.isPending.next(true);
      }),
      switchMap(() => {
        return obs$;
      }),
      finalize(() => {
        this.isPending.next(false);
      })
    );
  }

  private genParam(maker: string, pool: string): any {
    return {
      query: `{
          matchWithPrivatePools(
            where: {
                fromContract: "${pool}",
                maker: "${maker}"
            }) {
              orderID,
              makerID,
         },
         closeInPrivatePools(
            where:{
                fromContract: "${pool}",
                maker: "${maker}"
            }) {
              orderID,
              makerID,
         },
         riskInPrivatePools(
            where:{
                fromContract: "${pool}",
                maker: "${maker}"
            }) {
              orderID,
              makerID,
         }
      }`,
      variables: {},
    };
  }

  private parseMakerOrderIndexes(opens: OrderId[], close: OrderId[], risks: OrderId[]): number[] {
    opens = opens.map(one => {
      return {
        orderID: one.orderID,
        makerID: (Number(one.makerID) - 1).toString(),
      };
    });
    close = close.concat(risks);

    const all: Set<string> = new Set<string>(opens.map(one => one.makerID));
    const del: Set<string> = new Set<string>(close.map(one => one.makerID));

    del.forEach(mid => {
      all.delete(mid);
    });

    return Array.from(all).map(one => Number(one));
  }
}
