import { DatabaseStateMerger } from '../../../interface';
import {
  ShieldBrokerInfo,
  ShieldBrokerReferralInfo,
  ShieldBrokerReferralRs,
  ShieldBrokerTradingFee,
  ShieldTakerTradingFee,
  StateNull,
  StateNullType,
  TokenErc20,
} from '../../../state-types';
import { PageIndex, PageSize } from '../list.types';
import { Network } from '../../../../constant/network';
import { BehaviorSubject, from, mergeMap, Observable, of, switchMap, zip } from 'rxjs';
import { SLD_ENV_CONF } from '../../../../components/shield-option-trade/const/env';
import { httpPost } from '../../../../util/http';
import * as _ from 'lodash';
import { parseNumber } from '../../../../util/string';
import { catchError, finalize, map, tap, toArray } from 'rxjs/operators';
import { erc20InfoByAddressGetter } from '../../../contract/contract-getter-sim-erc20';
import { BigNumber } from 'ethers';
import { SldDecimal } from '../../../../util/decimal';
import { isSameAddress } from '../../../../util/address';

type Arg = [string, PageSize, PageIndex, Network];
type ItemRs = {
  id: string;
  orderCount: string;
  inviteTimestamp: string;
  lastOrderTimestamp: string;
};
type FeeRs = {
  taker: string;
  token: string;
  totalPaid: string;
};
type BrokerRs = {
  id: string;
  referralCount: string;
  referralOrderCount: string;
  firstReferralTimestamp: string;
  lastReferralTimestamp: string;
};
type BrokerFeeRs = {
  broker: string;
  token: string;
  takerTotalPaid: string;
};

export class MergerReferralItems implements DatabaseStateMerger<ShieldBrokerReferralRs | StateNullType, Arg> {
  isPending: BehaviorSubject<boolean> = new BehaviorSubject(false);

  mergeWatch(...args: Arg): Observable<ShieldBrokerReferralRs | StateNullType> {
    return this.doGet(...args);
  }

  mock(args?: Arg): Observable<ShieldBrokerReferralRs | StateNullType> | ShieldBrokerReferralRs | StateNullType {
    return StateNull;
  }

  pending(): Observable<boolean> {
    return this.isPending;
  }

  private doGet(
    broker: string,
    pageSize: number,
    pageIndex: number,
    network: Network
  ): Observable<ShieldBrokerReferralRs | StateNullType> {
    const url: string | undefined = SLD_ENV_CONF.Supports[network]?.SubGraphUrl;
    if (!url) {
      return of(StateNull);
    }

    return of(true).pipe(
      tap(() => {
        this.isPending.next(true);
      }),
      switchMap(() => {
        return this.getBroker(url, broker, network);
      }),
      switchMap((brokerInfo: ShieldBrokerInfo | null) => {
        if (brokerInfo === null) {
          throw new Error();
        }

        const offset: number = pageSize * pageIndex;
        const limit: number = Math.min(pageSize, brokerInfo.referralCount - offset);
        const takers$ =
          offset >= brokerInfo.referralCount ? of([]) : this.getTakers(url, brokerInfo.brokerAddress, offset, limit);

        return zip(takers$, of(brokerInfo), of(offset));
      }),
      map(([takers, broker, offset]): ShieldBrokerReferralRs => {
        if (takers === null) {
          throw new Error();
        }

        return {
          takers,
          broker,
          pageOffset: offset,
          network,
        };
      }),
      switchMap((takerRs: ShieldBrokerReferralRs) => {
        const tradingFees$ = this.getTradingFees(url, network, takerRs.takers);
        return zip(tradingFees$, of(takerRs));
      }),
      map(([tradingFees, takerRs]: [ShieldTakerTradingFee[], ShieldBrokerReferralRs]) => {
        takerRs.takers.forEach(taker => {
          taker.tradingFee = tradingFees.filter(fee => isSameAddress(fee.taker, taker.takerAddress));
        });

        return takerRs;
      }),
      catchError(err => {
        return of(StateNull);
      }),
      finalize(() => {
        this.isPending.next(false);
      })
    );
  }

  // -----------------------------------------------------------------------------------------------
  // taker items

  private getTakers(
    url: string,
    broker: string,
    offset: number,
    limit: number
  ): Observable<ShieldBrokerReferralInfo[] | null> {
    return httpPost(url, this.genParam(broker, offset, limit)).pipe(
      map(res => {
        const isOK = _.get(res, 'status', 400) === 200;
        if (!isOK) {
          return null;
        }

        const takers: ItemRs[] = _.get(res, 'body.data.takers', []);
        const takerInfos = takers.map(one => {
          return this.convertItem(one);
        });

        return takerInfos;
      })
    );
  }

  private genParam(broker: string, skip: number, first: number): any {
    return {
      query: `{
                 takers(
                    where: {inviter:"${broker}"},
                    skip: ${skip},
                    first: ${first},
                    orderBy: inviteTimestamp, orderDirection: desc ) {
                    id,
                    inviteTimestamp,
                    orderCount,
                    lastOrderTimestamp,
                 },
               }`,
      variables: {},
    };
  }

  private convertItem(item: ItemRs): ShieldBrokerReferralInfo {
    return {
      takerAddress: item.id,
      invitationTime: parseNumber(item.inviteTimestamp),
      orderCount: parseNumber(item.orderCount),
      lastOpenTime: parseNumber(item.lastOrderTimestamp),
      tradingFee: [],
    };
  }

  // -----------------------------------------------------------------------------------------------
  // trading fee

  private getTradingFees(
    url: string,
    network: Network,
    takers: ShieldBrokerReferralInfo[]
  ): Observable<ShieldTakerTradingFee[]> {
    const takerIds: string[] = takers.map(one => one.takerAddress);
    const param = this.genTradingFeeParam(takerIds);

    return httpPost(url, param).pipe(
      map(res => {
        const isOK: boolean = _.get(res, 'status', 400) === 200;
        if (!isOK) {
          return [];
        }

        const fees: FeeRs[] = _.get(res, 'body.data.takerTradingFees', []);

        return fees;
      }),
      switchMap(fees => {
        return from(fees).pipe(
          mergeMap((feeRs: FeeRs) => {
            return this.convertFee(feeRs, network);
          }),
          toArray(),
          map(tradingFees => {
            return tradingFees.filter(Boolean) as ShieldTakerTradingFee[];
          })
        );
      })
    );
  }

  private genTradingFeeParam(takerIds: string[]) {
    const ids = takerIds.map(one => `"${one}"`).join(',');
    return {
      query: `{   takerTradingFees(  where: { taker_in: [${ids}] } )
                  {
                    taker,
                    token,
                    totalPaid,
                  }
              }`,
      variables: {},
    };
  }

  private convertFee(fee: FeeRs, network: Network): Observable<ShieldTakerTradingFee | null> {
    return this.getToken(fee.token, network).pipe(
      map((token: TokenErc20 | null) => {
        if (token === null) {
          return null;
        }

        return {
          taker: fee.taker,
          token,
          amount: SldDecimal.fromOrigin(BigNumber.from(fee.totalPaid), token.decimal),
        };
      })
    );
  }

  private getToken(tokenAddress: string, network: Network): Observable<TokenErc20 | null> {
    return erc20InfoByAddressGetter(tokenAddress).pipe(
      map((token: TokenErc20) => {
        return token.network !== network ? null : token;
      })
    );
  }

  // ------------------------------------------------------------------------------------------------
  // broker

  private getBroker(url: string, broker: string, network: Network): Observable<ShieldBrokerInfo | null> {
    return httpPost(url, this.genBrokerParam(broker)).pipe(
      map(res => {
        const isOK: boolean = _.get(res, 'status', 400) === 200;
        if (!isOK) {
          throw new Error();
        }

        const brokerRs: BrokerRs | null = _.get(res, 'body.data.broker', null);

        if (!brokerRs) {
          throw new Error();
        }

        const fees: BrokerFeeRs[] = _.get(res, 'body.data.brokerTradingFees', []);

        return { brokerRs, fees };
      }),
      switchMap(({ brokerRs, fees }) => {
        const brokerFees$ = this.convertBrokerFees(fees, network);
        const broker = this.convertBroker(brokerRs);

        return zip(of(broker), brokerFees$).pipe(
          map(([broker, brokerFees]) => {
            broker.tradingFee = brokerFees;
            return broker;
          })
        );
      }),
      catchError(err => {
        return of(null);
      })
    );
  }

  private genBrokerParam(broker: string): any {
    return {
      query: `{
            broker(id: "${broker}")
            {
              id,
              referralCount,
              referralOrderCount,
              lastReferralTimestamp,
              firstReferralTimestamp
            },
            brokerTradingFees( where: {broker: "${broker}"}) {
              broker,
              token,
              takerTotalPaid
            }
          }`,
      variables: {},
    };
  }

  private convertBroker(brokerRs: BrokerRs): ShieldBrokerInfo {
    return {
      brokerAddress: brokerRs.id,
      referralCount: Number(brokerRs.referralCount),
      referralOrderCount: Number(brokerRs.referralOrderCount),
      firstReferralTime: Number(brokerRs.firstReferralTimestamp),
      lastReferralTime: Number(brokerRs.lastReferralTimestamp),
      tradingFee: [],
    };
  }

  // ------------------------------------------------------------------------------------------------
  // fees related broker

  private convertBrokerFees(brokerFees: BrokerFeeRs[], network: Network): Observable<ShieldBrokerTradingFee[]> {
    return from(brokerFees).pipe(
      mergeMap((fee: BrokerFeeRs) => {
        return this.convertBrokerFee(fee, network);
      }),
      toArray(),
      map((fees: (ShieldBrokerTradingFee | null)[]) => {
        return fees.filter(Boolean) as ShieldBrokerTradingFee[];
      })
    );
  }

  private convertBrokerFee(bFee: BrokerFeeRs, network: Network): Observable<ShieldBrokerTradingFee | null> {
    return this.getToken(bFee.token, network).pipe(
      map((token: TokenErc20 | null): ShieldBrokerTradingFee | null => {
        if (token === null) {
          return null;
        }

        return {
          token,
          broker: bFee.broker,
          amount: SldDecimal.fromOrigin(BigNumber.from(bFee.takerTotalPaid), token.decimal),
        };
      })
    );
  }
}
