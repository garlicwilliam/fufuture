import { DatabaseStateMerger } from '../../../interface';
import { AsyncSubject, BehaviorSubject, EMPTY, expand, from, mergeMap, Observable, of, switchMap } from 'rxjs';
import {
  ShieldActiveOrderInfo,
  ShieldActiveOrderInfoRs,
  ShieldOptionType,
  ShieldOrderBase,
  ShieldOrderMigration,
  ShieldUnderlyingType,
  TokenErc20,
} from '../../../state-types';
import { Network } from '../../../../constant/network';
import { SLD_ENV_CONF } from '../../../../components/shield-option-trade/const/env';
import { httpPost } from '../../../../util/http';
import { finalize, last, map, take, tap, toArray } from 'rxjs/operators';
import * as _ from 'lodash';
import { BigNumber, Contract } from 'ethers';
import { erc20InfoByAddressGetter } from '../../../contract/contract-getter-sim-erc20';
import { SldDecimal, SldDecPrice } from '../../../../util/decimal';
import { orderMigrationInfoListGetter } from '../../../contract/contract-getter-cpx-shield';
import { shieldOptionTradeContracts } from '../../../../components/shield-option-trade/contract/shield-option-trade-contract';

type Arg = [Network, ShieldUnderlyingType];
type OrderRs = {
  id: string;
  name: string;
  token: string;
  isBuy: boolean;
  taker: string;
  amount: string;
  openPrice: string;
  openTimestamp: string;
  tradingFee: string;
  fundingFee: string;
};

const batchAmount: number = 1000;

export class MergerActiveOrders implements DatabaseStateMerger<ShieldActiveOrderInfoRs, Arg> {
  private isPending = new BehaviorSubject<boolean>(false);

  public mergeWatch(...args: Arg): Observable<any> {
    return this.doGet(...args);
  }

  mock(args?: Arg): any {
    return undefined;
  }

  public pending(): Observable<boolean> {
    return this.isPending;
  }

  private doGet(network: Network, underlying: ShieldUnderlyingType): Observable<any> {
    return of(true).pipe(
      tap(() => {
        this.isPending.next(true);
      }),
      switchMap(() => {
        return this.getOrderBases(underlying, network);
      }),
      switchMap((bases: ShieldOrderBase[]) => {
        const orderIds: BigNumber[] = bases.map(one => one.id);

        return this.getMigrationInfo(orderIds).pipe(
          map((migrations: ShieldOrderMigration[]) => {
            return bases.map((base, i: number) => ({ ...base, migrationInfo: migrations[i] }));
          })
        );
      }),
      map((orders: ShieldActiveOrderInfo[]) => {
        return { orders, network };
      }),
      finalize(() => {
        this.isPending.next(false);
      })
    );
  }

  private getMigrationInfo(orderIds: BigNumber[]): Observable<ShieldOrderMigration[]> {
    const contract$ = shieldOptionTradeContracts.CONTRACTS.optionTrade.pipe(take(1));

    return contract$.pipe(
      switchMap((contract: Contract) => {
        return orderMigrationInfoListGetter(contract, orderIds);
      }),
      map((migrations: ShieldOrderMigration[]) => {
        return migrations.sort((a, b) => a.id.toNumber() - b.id.toNumber());
      })
    );
  }

  private getOrderBases(underlying: ShieldUnderlyingType, network: Network): Observable<ShieldOrderBase[]> {
    return this.getOrderRsList(underlying, network).pipe(
      switchMap((orderRs: OrderRs[]) => {
        return from(orderRs).pipe(
          mergeMap(order => {
            return this.convert(order);
          }),
          toArray()
        );
      }),
      map((bases: ShieldOrderBase[]) => {
        return bases.sort((a, b) => a.id.toNumber() - b.id.toNumber());
      })
    );
  }

  private getOrderRsList(underlying: ShieldUnderlyingType, network: Network): Observable<OrderRs[]> {
    const url: string | undefined = SLD_ENV_CONF.Supports[network]?.SubGraphUrl;

    if (!url) {
      return of([]);
    }

    return this.getOrderRes(url, underlying, 0).pipe(
      expand(({ orders, next }) => {
        if (!next) {
          return EMPTY;
        }

        const len: number = orders.length;

        return this.getOrderRes(url, underlying, len).pipe(
          map((nextOrders: { orders; next }) => {
            return {
              orders: [...orders, ...nextOrders.orders],
              next: nextOrders.next,
            };
          })
        );
      }),
      map(value => {
        return value.orders;
      }),
      last()
    );
  }

  private getOrderRes(
    url: string,
    underlying: ShieldUnderlyingType,
    skip: number
  ): Observable<{ orders: OrderRs[]; next: boolean }> {
    return httpPost(url, this.genParam(underlying, skip)).pipe(
      map(res => {
        const isOK: boolean = _.get(res, 'status', 400) === 200;
        if (isOK) {
          const orders = res.body.data.orders as OrderRs[];
          return orders ? orders : [];
        }

        return [];
      }),
      map((orders: OrderRs[]) => {
        return {
          orders,
          next: orders.length === batchAmount,
        };
      })
    );
  }

  private genParam(underlying: ShieldUnderlyingType, skip: number): any {
    return {
      query: `{
                orders( first: ${batchAmount},
                        skip: ${skip},
                        orderBy: id,
                        orderDirection: asc,
                        where: { status: 0, name: "${underlying}" }) {
                        id,
                        name,
                        token,
                        isBuy,
                        taker,
                        amount,
                        openPrice,
                        openTimestamp,
                        tradingFee,
                        fundingFee,
                      }
              }`,
      variables: {},
    };
  }

  private convert(order: OrderRs): Observable<ShieldOrderBase> {
    const token$: Observable<TokenErc20> = erc20InfoByAddressGetter(order.token);

    return token$.pipe(
      map((token: TokenErc20) => {
        const orderInfo: ShieldOrderBase = {
          id: BigNumber.from(order.id),
          underlying: order.name as ShieldUnderlyingType,
          token: token,
          optionType: order.isBuy ? ShieldOptionType.Call : ShieldOptionType.Put,
          takerAddress: order.taker,
          orderAmount: SldDecimal.fromOrigin(BigNumber.from(order.amount), 18),
          openPrice: SldDecPrice.fromE18(BigNumber.from(order.openPrice)),
          openTime: Number(order.openTimestamp),
          tradingFee: SldDecimal.fromOrigin(BigNumber.from(order.tradingFee), token.decimal),
          fundingFeePaid: SldDecimal.fromOrigin(BigNumber.from(order.fundingFee), token.decimal),
        };

        return orderInfo;
      })
    );
  }
}
