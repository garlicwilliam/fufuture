import { DatabaseStateMerger } from '../../../interface';
import {
  ShieldClosedOrderInfo,
  ShieldClosedOrderInfoRs,
  ShieldOptionType,
  ShieldOrderState,
  ShieldUnderlyingType,
  TokenErc20,
} from '../../../state-types';
import { PageIndex, PageSize } from '../list.types';
import { NET_BNB, Network } from '../../../../constant/network';
import { BehaviorSubject, from, mergeMap, Observable, of, switchMap } from 'rxjs';
import { E18, EMPTY_ADDRESS } from '../../../../constant';
import { SLD_ENV_CONF } from '../../../../components/shield-option-trade/const/env';
import { httpPost } from '../../../../util/http';
import { finalize, map, tap, toArray } from 'rxjs/operators';
import * as _ from 'lodash';
import { BigNumber } from 'ethers';
import { SldDecimal, SldDecPrice } from '../../../../util/decimal';
import { computeClosedOrderPnl } from '../../../../components/shield-option-trade/utils/compute';
import { erc20InfoByAddressGetter } from '../../../contract/contract-getter-sim-erc20';

type Args = [string, PageSize, PageIndex, Network];
type OrderRs = {
  id: string;
  name: ShieldUnderlyingType;
  token: string;
  amount: string;
  isBuy: boolean;
  closePrice: string;
  closeTimestamp: string;
  fundingFee: string;
  openPrice: string;
  openTimestamp: string;
  positionProfit: string;
  status: ShieldOrderState;
  tradingFee: string;
};

const EMPTY_RS: ShieldClosedOrderInfoRs = {
  taker: EMPTY_ADDRESS,
  orders: [],
  network: NET_BNB,
};

export class MergerClosedOrders implements DatabaseStateMerger<ShieldClosedOrderInfoRs, Args> {
  private isPending: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  mergeWatch(...args: Args): Observable<ShieldClosedOrderInfoRs> {
    return this.doGet(...args);
  }

  mock(args?: Args): Observable<ShieldClosedOrderInfoRs> | ShieldClosedOrderInfoRs {
    return EMPTY_RS;
  }

  pending(): Observable<boolean> {
    return this.isPending;
  }

  private doGet(
    taker: string,
    pageSize: number,
    pageIndex: number,
    network: Network
  ): Observable<ShieldClosedOrderInfoRs> {
    const url = SLD_ENV_CONF.Supports[network]?.SubGraphUrl;
    const empty = Object.assign({}, EMPTY_RS, { network: network, taker: taker });
    const needFixPrice: boolean = SLD_ENV_CONF.Supports[network]?.ClosePriceNeedFix || false;

    if (!url) {
      return of(empty);
    }

    const count = (pageIndex + 1) * pageSize;

    return of(true).pipe(
      tap(() => {
        this.isPending.next(true);
      }),
      switchMap(() => {
        return httpPost(url, this.genParam(count, taker));
      }),
      switchMap((res: any) => {
        const isOK = _.get(res, 'status', 400) === 200;
        if (!isOK) {
          return of(empty);
        }

        const orders: OrderRs[] = _.get(res, 'body.data.orders', []);

        return from(orders).pipe(
          mergeMap((orderRs: OrderRs) => {
            return this.getOrderToken(orderRs.token, network).pipe(
              map((token: TokenErc20 | null) => {
                return token ? this.convertOrder(orderRs, taker, token, needFixPrice) : null;
              })
            );
          }),
          toArray(),
          map((orders: (ShieldClosedOrderInfo | null)[]) => {
            return orders.filter(Boolean) as ShieldClosedOrderInfo[];
          }),
          map((orders: ShieldClosedOrderInfo[]) => {
            return orders.sort((a, b) => b.closeTime - a.closeTime);
          }),
          map((orders: ShieldClosedOrderInfo[]): ShieldClosedOrderInfoRs => {
            return {
              taker,
              network,
              orders,
            };
          })
        );
      }),
      finalize(() => {
        this.isPending.next(false);
      })
    );
  }

  private genParam(count: number, taker: string): any {
    return {
      query: `{
            orders( first: ${count},
                    orderBy: closeTimestamp,
                    orderDirection: desc,
                    where: {taker: "${taker}", status_gt: 0} ) {
                    id,
                    name,
                    token,
                    amount,
                    isBuy,
                    tradingFee,
                    fundingFee,
                    openPrice,
                    openTimestamp,
                    closePrice,
                    closeTimestamp,
                    status,
                    positionProfit,
                  }
         }`,
      variables: {},
    };
  }

  private getOrderToken(token: string, network: Network): Observable<TokenErc20 | null> {
    return erc20InfoByAddressGetter(token).pipe(
      map((token: TokenErc20) => {
        return token.network === network ? token : null;
      })
    );
  }

  private convertOrder(order: OrderRs, taker: string, token: TokenErc20, needFixPrice: boolean): ShieldClosedOrderInfo {
    const orderObj: ShieldClosedOrderInfo = {
      id: BigNumber.from(order.id),
      takerAddress: taker,
      underlying: order.name,
      token,
      optionType: order.isBuy ? ShieldOptionType.Call : ShieldOptionType.Put,
      orderState: order.status,
      orderAmount: SldDecimal.fromOrigin(BigNumber.from(order.amount), 18),
      openPrice: SldDecPrice.fromE18(BigNumber.from(order.openPrice)),
      openTime: Number(order.openTimestamp),
      fundingFeePaid: SldDecimal.fromOrigin(BigNumber.from(order.fundingFee), token.decimal),
      tradingFee: SldDecimal.fromOrigin(BigNumber.from(order.tradingFee), token.decimal),
      closePrice: SldDecPrice.fromE18(BigNumber.from(order.closePrice)),
      closeTime: Number(order.closeTimestamp),
      pnl: SldDecimal.ZERO,
    };

    if (needFixPrice) {
      orderObj.closePrice = this.genClosePrice(orderObj, BigNumber.from(order.positionProfit));
    }

    orderObj.pnl = computeClosedOrderPnl(orderObj);

    return orderObj;
  }

  private genClosePrice(orderObj: ShieldClosedOrderInfo, positionProfit: BigNumber): SldDecPrice {
    if (orderObj.token.decimal === 18 || positionProfit.isZero()) {
      return orderObj.closePrice;
    }

    const profit: SldDecimal = SldDecimal.fromOrigin(positionProfit, orderObj.token.decimal);
    const deltaPrice: SldDecPrice = SldDecPrice.fromE18(profit.toE18().mul(E18).div(orderObj.orderAmount.toE18()));

    return orderObj.optionType === ShieldOptionType.Call
      ? orderObj.openPrice.add(deltaPrice)
      : orderObj.openPrice.sub(deltaPrice);
  }
}
