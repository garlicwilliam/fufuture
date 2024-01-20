import { DatabaseStateMerger } from '../../../interface';
import { PriceDuration, ShieldUnderlyingType, TokenPriceHistory } from '../../../state-types';
import {NET_BNB, Network} from '../../../../constant/network';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { SLD_ENV_CONF } from '../../../../components/shield-option-trade/const/env';
import { curTimestamp } from '../../../../util/time';
import { httpPost } from '../../../../util/http';
import { finalize, map, switchMap, tap } from 'rxjs/operators';
import * as _ from 'lodash';
import { SldDecimal } from '../../../../util/decimal';
import { BigNumber } from 'ethers';
import { CACHE_10_MIN, CACHE_1_MIN, cacheService } from '../../../mem-cache/cache-contract';
import { percentageCompute } from '../../../../util/math';

type Arg = [PriceDuration, ShieldUnderlyingType, Network];
type Res = TokenPriceHistory;
type DurationData = {
  count: string;
  data: string;
};

export class MergerUnderlyingPrice implements DatabaseStateMerger<Res, Arg> {
  isPending: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  mergeWatch(...args: Arg): Observable<Res> {
    const rs$ = this.doGet(...args);

    const cacheKey = `UnderlyingPrice_${args[2]}-${args[1]}-${args[0]}`;
    const cacheInterval = args[0] === 'DAY' ? CACHE_1_MIN : CACHE_10_MIN;
    return cacheService.tryUseCache(rs$, cacheKey, cacheInterval);
  }

  mock(args?: Arg): Observable<Res> | Res {
    return {
      underlying: ShieldUnderlyingType.BTC,
      network: NET_BNB,
      history: [],
      curPrice: 0,
      maxPrice: 0,
      minPrice: 0,
      priceChange: 0,
      duration: 'DAY',
    };
  }

  pending(): Observable<boolean> {
    return this.isPending;
  }

  private doGet(duration: PriceDuration, underlying: ShieldUnderlyingType, network: Network): Observable<Res> {
    const empty: Res = {
      underlying,
      network,
      curPrice: 0,
      history: [],
      minPrice: 0,
      maxPrice: 0,
      priceChange: 0,
      duration: 'DAY',
    };

    const url: string | undefined = SLD_ENV_CONF.Supports[network]?.SubGraphOracleUrl;
    if (!url) {
      return of(empty);
    }

    const begin: number =
      duration === 'DAY'
        ? curTimestamp() - 24 * 3600
        : duration === 'WEEK'
        ? curTimestamp() - 7 * 24 * 3600
        : 30 * 24 * 3600;

    const hourIndex: number = Math.floor(begin / 3600);
    const dayIndex: number = Math.floor(begin / (24 * 3600));

    const data$ =
      duration === 'DAY'
        ? this.doGetAllItemsByHour(url, hourIndex, underlying, begin)
        : this.doGetAllItemsByDay(url, dayIndex, underlying, begin);

    return of(true).pipe(
      tap(() => {
        this.isPending.next(true);
      }),
      switchMap(() => {
        return data$;
      }),
      map((rs): Res => {
        const len = rs.data.length;
        const cur = len > 0 ? rs.data[len - 1] : 0;
        return {
          underlying,
          network,
          curPrice: cur[1],
          history: rs.data,
          minPrice: rs.min,
          maxPrice: rs.max,
          priceChange: rs.percent,
          duration,
        };
      }),
      finalize(() => {
        this.isPending.next(false);
      })
    );
  }

  private doGetAllItemsByDay(
    url: string,
    beginIndex: number,
    underlying: ShieldUnderlyingType,
    begin: number
  ): Observable<{ data: [number, number][]; min: number; max: number; percent: number }> {
    return httpPost(url, this.genDayParam(beginIndex, underlying)).pipe(
      map(res => {
        const isOK = _.get(res, 'status', 400) === 200;
        if (!isOK) {
          return { data: [], min: 0, max: 0, percent: 0 };
        }

        const dayData: DurationData[] = _.get(res, 'body.data.dayDatas', []);

        return this.convertDurationData(dayData, begin);
      })
    );
  }

  private doGetAllItemsByHour(
    url: string,
    beginIndex: number,
    underlying: ShieldUnderlyingType,
    begin: number
  ): Observable<{ data: [number, number][]; min: number; max: number; percent: number }> {
    return httpPost(url, this.genHourParam(beginIndex, underlying)).pipe(
      map(res => {
        const isOK = _.get(res, 'status', 400) === 200;
        if (!isOK) {
          return { data: [], min: 0, max: 0, percent: 0 };
        }

        const hourData: DurationData[] = _.get(res, 'body.data.hourDatas', []);

        return this.convertDurationData(hourData, begin);
      })
    );
  }

  private genHourParam(beginIndex: number, underlying: ShieldUnderlyingType) {
    return {
      query: `{ hourDatas(
                            where: {name: "${underlying}", hourIndex_gte: ${beginIndex}},
                            orderBy: hourIndex,
                            orderDirection: asc
                        )
                          {
                            count,
                            data
                          }
              }`,
      variables: {},
    };
  }

  private genDayParam(beginIndex: number, underlying: ShieldUnderlyingType) {
    return {
      query: `{
                dayDatas(
                    where: {name: "${underlying}", dayIndex_gte: ${beginIndex}},
                    orderBy: dayIndex,
                    orderDirection: asc) {
                        count,
                        data
                    }
              }`,
      variables: {},
    };
  }

  private convertDurationData(
    hours: DurationData[],
    begin: number
  ): { data: [number, number][]; min: number; max: number; percent: number } {
    let max: number = 0;
    let min: number = -1;

    const setMinMax = (priceNum: number) => {
      if (priceNum > max) {
        max = priceNum;
      }

      if (min < 0 || min > priceNum) {
        min = priceNum;
      }
    };

    const hoursData: [number, number][] = hours
      .map((hour: DurationData) => {
        let pairs: string[] = hour.data.split(';');
        pairs = pairs.slice(0, pairs.length - 1);

        const pricePairs: ([number, number] | null)[] = pairs.map(one => {
          const parts: string[] = one.split(',');
          const timestamp = Number(parts[0]);

          if (timestamp < begin) {
            return null;
          }

          const price: SldDecimal = SldDecimal.fromOrigin(BigNumber.from(parts[1]), 8);
          const priceNum: number = Number(price.toNumeric());

          setMinMax(priceNum);

          return [timestamp * 1000, priceNum];
        });

        return pricePairs.filter(Boolean) as [number, number][];
      })
      .reduce((acc, cur) => {
        return acc.concat(cur);
      }, [] as [number, number][]);

    const s: number = hoursData[0][1];
    const e: number = hoursData[hoursData.length - 1][1];
    const d: number = e - s;

    const percent = percentageCompute(s, d);

    return { data: hoursData, min, max, percent };
  }
}
