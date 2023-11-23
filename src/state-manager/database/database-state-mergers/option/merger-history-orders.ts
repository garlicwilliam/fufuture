import { DatabaseStateMerger } from '../../../interface';
import {
  ShieldHistoryOrderRs,
  ShieldOptionType,
  ShieldOrderInfo,
  ShieldOrderState,
  StateNullType,
  TokenErc20,
} from '../../../state-types';
import { PageIndex, PageSize } from '../list.types';
import { BehaviorSubject, from, mergeMap, Observable, of, switchMap, zip } from 'rxjs';
import { httpPost } from '../../../../util/http';
import { finalize, map, tap, toArray } from 'rxjs/operators';
import { BigNumber } from 'ethers';
import { erc20InfoByAddressGetter } from '../../../contract/contract-getter-sim-erc20';
import { SldDecimal, SldDecPrice } from '../../../../util/decimal';
import { snRep } from '../../../interface-util';
import * as _ from 'lodash';
import { IndexUnderlyingDecimal } from '../../../../components/shield-option-trade/const/assets';
import { SUB_GRAPH_API } from '../../../../components/shield-option-trade/const/default';

type RsType = {
  blockTimestamp: string;
  closePrice: string;
  fundingFeePaid: string;
  isBuy: true;
  name: 'ETH';
  number: string;
  openPrice: string;
  orderID: string;
  state: ShieldOrderState;
  token: string;
};

type MidRes = {
  preHistory: RsType[];
  appendOrders: string[];
};

const emptyMidRes: MidRes = {
  preHistory: [],
  appendOrders: [],
};

export class MergerHistoryOrders implements DatabaseStateMerger<ShieldHistoryOrderRs, [string, PageSize, PageIndex]> {
  isPending = new BehaviorSubject(false);

  mergeWatch(...args: [string, PageSize, PageIndex]): Observable<ShieldHistoryOrderRs> {
    return this.doGet(args[0], args[1], args[2]);
  }

  mock(args?: [string, PageSize, PageIndex]): Observable<ShieldHistoryOrderRs> | ShieldHistoryOrderRs {
    return {
      orders: [],
      taker: '',
    };
  }

  pending(): Observable<boolean> {
    return this.isPending;
  }

  public doGet(user: string, pageSize: number, pageIndex: number): Observable<ShieldHistoryOrderRs> {
    const count = pageSize * (pageIndex + 1);

    return of(user).pipe(
      tap(() => {
        this.isPending.next(true);
      }),
      switchMap(user => {
        return this.getPreData(user);
      }),
      switchMap((rs: MidRes) => {
        const appendOrders$ = this.getAppendData(rs.appendOrders);

        return zip(appendOrders$, of(rs.preHistory));
      }),
      map(([appendOrders, preHistory]) => {
        return [...preHistory, ...appendOrders];
      }),
      map(orders => {
        return orders
          .sort((a, b) => {
            return Number(b.blockTimestamp) - Number(a.blockTimestamp);
          })
          .slice(0, Math.min(count, orders.length));
      }),
      switchMap(orders => {
        return from(orders).pipe(
          mergeMap(order => {
            return this.convert(order, user);
          }),
          toArray()
        );
      }),
      map((orders: (ShieldOrderInfo | null)[]) => {
        return orders.filter(Boolean) as ShieldOrderInfo[];
      }),
      map((orders: ShieldOrderInfo[]) => {
        orders = orders.sort((a, b) => (b.closeTime || 0) - (a.closeTime || 0));

        return {
          orders,
          taker: user,
        } as ShieldHistoryOrderRs;
      }),
      finalize(() => {
        this.isPending.next(false);
      })
    );
  }

  public getPreData(user: string): Observable<MidRes> {
    const url = SUB_GRAPH_API;

    if (!url) {
      return of(emptyMidRes);
    }

    const param = this.preDataParam(user);

    return httpPost(url, param).pipe(
      map(res => {
        const isOK = _.get(res, 'status', 400) === 200 && !_.isEmpty(_.get(res, 'body.data'));
        if (!isOK) {
          return emptyMidRes;
        }
        const body = _.get(res, 'body');

        const tradeOrderIds: string[] = (body.data.trades as any[]).map(one => one.orderID);
        const ordersRs: RsType[] = (body.data.closeOrders as any[]).filter(
          one => tradeOrderIds.indexOf(one.orderID) >= 0
        );
        const historyIds: string[] = ordersRs.map(one => one.orderID);
        const diffOrders: string[] = _.difference(tradeOrderIds, historyIds);

        return { preHistory: ordersRs, appendOrders: diffOrders };
      })
    );
  }

  private preDataParam(user: string) {
    return {
      query: `{
            trades(where: {holder: "${user}"}) {
              orderID
            },
            closeOrders(where: {state_not: 0, holder: "${user}"}) {
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

  public getAppendData(orders: string[]): Observable<RsType[]> {
    const url = SUB_GRAPH_API;

    if (!url || orders.length === 0) {
      return of([]);
    }

    const param = this.appendDataParam(orders);

    return httpPost(url, param).pipe(
      map(res => {
        const isOK = _.get(res, 'status', 400) === 200 && !_.isEmpty(_.get(res, 'body.data'));
        if (!isOK) {
          return [];
        }

        const body = _.get(res, 'body');
        const orders: RsType[] = _.get(body, 'data.closeOrders');

        return orders;
      })
    );
  }

  private appendDataParam(orders: string[]) {
    const orderIdArr = orders.join(',');

    return {
      query: `{ closeOrders(where: {state_not: 0, orderID_in: [${orderIdArr}]}) {
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

  private convert(rs: RsType, taker: string): Observable<ShieldOrderInfo | null> {
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
          takerAddress: taker,
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
