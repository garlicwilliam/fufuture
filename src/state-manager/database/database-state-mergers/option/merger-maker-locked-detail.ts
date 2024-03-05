import { DatabaseStateMerger } from '../../../interface';
import { ShieldMakerOrderInfo, ShieldMakerOrderInfoRs, ShieldMakerPrivatePoolInfo } from '../../../state-types';
import { BehaviorSubject, EMPTY, Observable, of, switchMap, zip } from 'rxjs';
import { httpPost } from '../../../../util/http';
import { finalize, map, take, tap, expand } from 'rxjs/operators';
import * as _ from 'lodash';
import { makerPriPoolOrdersGetter } from '../../../contract/contract-getter-cpx-shield';
import { shieldOptionTradeContracts } from '../../../../components/shield-option-trade/contract/shield-option-trade-contract';
import { BigNumber } from 'ethers';
import { SLD_ENV_CONF } from '../../../../components/shield-option-trade/const/env';

type OrderId = {
  orderID: string;
  makerID: string;
};

type InfoResult = ShieldMakerOrderInfoRs | undefined;
type PoolArgument = ShieldMakerPrivatePoolInfo | null;

export class MergerMakerLockedDetail implements DatabaseStateMerger<InfoResult, [PoolArgument]> {
  private isPending: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  mergeWatch(...args: [PoolArgument]): Observable<InfoResult> {
    if (!args[0]) {
      return of(undefined);
    }

    return this.doGet(args[0]);
  }

  mock(args?: [PoolArgument]): Observable<InfoResult> | InfoResult {
    return undefined;
  }

  pending(): Observable<boolean> {
    return this.isPending;
  }

  private doGet(pool: PoolArgument): Observable<InfoResult> {
    if (!pool) {
      return of(undefined);
    }

    const url: string | undefined = SLD_ENV_CONF.Supports[pool.token.network]?.SubGraphUrl;

    if (!url) {
      return of(undefined);
    }

    const info$ = this.getMakerIndexes(url, pool.priPoolAddress, pool.holder).pipe(
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
      }),
      map((orders: ShieldMakerOrderInfo[]): ShieldMakerOrderInfoRs => {
        return {
          orders,
          maker: pool.holder,
          network: pool.network,
          pool: pool.priPoolAddress,
        };
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

  private getMakerIndexes(url: string, pool: string, maker: string): Observable<number[]> {
    return this.getMakerIDs(url, pool, maker, 0).pipe(
      expand(({ ids, hasNext }) => {
        if (!hasNext) {
          return EMPTY;
        }

        return this.getMakerIDs(url, pool, maker, ids.length).pipe(
          map(({ ids: newIds, hasNext: newNext }) => {
            return {
              ids: [...ids, ...newIds],
              hasNext: newNext,
            };
          })
        );
      }),
      map(({ ids, hasNext }) => {
        console.log('ids', ids);
        return ids;
      })
    );
  }

  private getMakerIDs(
    url: string,
    pool: string,
    maker: string,
    offset: number
  ): Observable<{ ids: number[]; hasNext: boolean }> {
    const param = this.genParams(maker, pool, offset);

    return httpPost(url, param).pipe(
      map(res => {
        console.log(res);
        const ids: { id: string; makerID: string }[] = res.body.data.privatePoolOrders;
        const len: number = ids.length;

        if (len === 0) {
          return { ids: [], hasNext: false };
        }

        const makerIds: number[] = ids.map(one => Number(one.makerID));

        return { ids: makerIds, hasNext: len === 1000 };
      })
    );
  }

  private genParams(maker: string, pool: string, offset: number): any {
    return {
      query: `{
        privatePoolOrders(
          where: {
            maker: "${maker}",
            pool: "${pool}",
            isActive: true
          },
          skip: ${offset},
          first: 1000,
          orderBy: makerID,
          orderDirection: desc
        ) {
          id,
          makerID
         }
      }`,
    };
  }

  private genParam(maker: string, pool: string): any {
    return {
      query: `{
          matchWithPrivatePools(
            first: 1000,
            where: {
                fromContract: "${pool}",
                maker: "${maker}"
            }) {
              orderID,
              makerID,
         },
         closeInPrivatePools(
            first: 1000,
            where:{
                fromContract: "${pool}",
                maker: "${maker}"
            }) {
              orderID,
              makerID,
         },
         riskInPrivatePools(
            first: 1000,
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

    console.log('del', del);

    del.forEach(mid => {
      all.delete(mid);
    });

    console.log('all', all);
    return Array.from(all).map(one => Number(one));
  }
}
