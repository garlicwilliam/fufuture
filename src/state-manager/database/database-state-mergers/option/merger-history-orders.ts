import { DatabaseStateMerger } from '../../../interface';
import { ShieldOptionType, ShieldOrderInfo, StateNullType, TokenErc20 } from '../../../state-types';
import { PageIndex, PageSize } from '../list.types';
import { BehaviorSubject, concatMap, from, Observable, of, switchMap, zip } from 'rxjs';
import { SUB_GRAPH_API } from '../../../../components/shield-option-trade/const/default';
import { httpPost } from '../../../../util/http';
import { filter, finalize, map, startWith, toArray } from 'rxjs/operators';
import { BigNumber } from 'ethers';
import { erc20InfoByAddressGetter } from '../../../contract/contract-getter-sim-erc20';
import { SldDecimal, SldDecPrice } from '../../../../util/decimal';
import { snRep } from '../../../interface-util';
import * as _ from 'lodash';
import { IndexUnderlyingDecimal } from '../../../../components/shield-option-trade/const/assets';

type RsType = {
  blockTimestamp: string;
  closePrice: string;
  fundingFeePaid: string;
  holder: string;
  isBuy: true;
  name: 'ETH';
  number: string;
  openPrice: string;
  orderID: string;
  state: 1;
  token: string;
};

export class MergerHistoryOrders implements DatabaseStateMerger<ShieldOrderInfo[], [string, PageSize, PageIndex]> {
  isPending = new BehaviorSubject(false);

  mergeWatch(...args: [string, PageSize, PageIndex]): Observable<ShieldOrderInfo[]> {
    return this.doGet(args[0], args[1], args[2]);
  }

  mock(args?: [string, PageSize, PageIndex]): Observable<ShieldOrderInfo[]> | ShieldOrderInfo[] {
    return [];
  }

  pending(): Observable<boolean> {
    return this.isPending;
  }

  doGet(user: string, pageSize: number, pageIndex: number): Observable<ShieldOrderInfo[]> {
    const url = SUB_GRAPH_API;

    if (!url) {
      return of([]);
    }

    const count = pageSize * (pageIndex + 1);
    const param = this.postParam(user, count);

    return httpPost(url, param).pipe(
      startWith(0),
      filter(v => {
        this.isPending.next(true);
        return v !== 0;
      }),
      switchMap((res: any) => {
        const isOK = _.get(res, 'status', 400) === 200 && !_.isEmpty(_.get(res, 'body.data'));

        if (isOK) {
          const body = _.get(res, 'body');
          const orders: any[] = _.get(body, 'data.closeOrders');

          return from(orders).pipe(
            concatMap(order => {
              return this.convert(order);
            }),
            toArray(),
            map(orderArr => {
              return orderArr.filter(Boolean) as ShieldOrderInfo[];
            })
          );
        }

        return of([]);
      }),
      finalize(() => {
        this.isPending.next(false);
      })
    );
  }

  private postParam(user: string, count: number): any {
    return {
      query: `{closeOrders(
            orderBy: blockTimestamp,
            orderDirection: desc,
            where: { holder: "${user}", state_not: 0 },
            first: ${count}) {
              holder,
              token,
              orderID,
              blockTimestamp,
              state,
              isBuy,
              name,
              number,
              fundingFeePaid,
              openPrice,
              closePrice
            }
          }`,
      variables: {},
    };
  }

  private convert(rs: RsType): Observable<ShieldOrderInfo | null> {
    const token$: Observable<TokenErc20 | StateNullType> = erc20InfoByAddressGetter(rs.token);

    return zip(token$).pipe(
      map(([tokenRs]) => {
        const token: TokenErc20 | null = snRep(tokenRs);

        if (!token) {
          return null;
        }

        return {
          id: BigNumber.from(rs.orderID),
          closeTime: Number(rs.blockTimestamp),
          takerAddress: rs.holder,
          indexUnderlying: rs.name,
          token,
          optionType: rs.isBuy ? ShieldOptionType.Call : ShieldOptionType.Put,
          orderState: rs.state,
          orderAmount: SldDecimal.fromOrigin(BigNumber.from(rs.number), IndexUnderlyingDecimal),
          openPrice: SldDecPrice.fromE18(BigNumber.from(rs.openPrice)),
          openTime: 0,
          fundingFee: {
            initial: SldDecimal.ZERO,
            paid: SldDecimal.fromOrigin(BigNumber.from(rs.fundingFeePaid), token.decimal),
          },
          tradingFee: SldDecimal.ZERO,
          closePrice: SldDecPrice.fromE18(BigNumber.from(rs.closePrice)),
          maintenanceMargin: SldDecimal.ZERO,
        } as ShieldOrderInfo;
      })
    );
  }
}
