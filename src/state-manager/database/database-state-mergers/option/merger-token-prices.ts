import { BehaviorSubject, EMPTY, Observable } from 'rxjs';
import { DatabaseStateMerger } from '../../../interface';
import { PriceDuration, ShieldUnderlyingType, TokenPriceHistory } from '../../../state-types';
import _ from 'lodash';
import { tokenIdMaps } from '../token-ids';
import { finalize, map } from 'rxjs/operators';
import { tokenSymbolFromName } from '../../../../constant/tokens';
import { httpGet } from '../../../../util/http';
import { CACHE_1_MIN, CACHE_2_MIN, cacheService } from '../../../mem-cache/cache-contract';
import { NET_BNB, Network } from '../../../../constant/network';

export class TokenPricesMerger
  implements DatabaseStateMerger<TokenPriceHistory, [PriceDuration, ShieldUnderlyingType, Network]>
{
  //
  private isPending: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  public mergeWatch(...args: [PriceDuration, ShieldUnderlyingType, Network]): Observable<TokenPriceHistory> {
    const rs$ = this.doGet(args[0], args[1]).pipe(
      map(rs => {
        return Object.assign(rs, { network: args[2] });
      })
    );

    return cacheService.tryUseCache(rs$, `_TokenPrices_${args[1]}-${args[0]}-${args[2]}}`, CACHE_2_MIN);
  }

  public pending(): Observable<boolean> {
    return this.isPending;
  }

  public mock(): TokenPriceHistory {
    return {
      curPrice: 0,
      history: [],
      minPrice: 0,
      maxPrice: 0,
      underlying: ShieldUnderlyingType.BTC,
      priceChange: 0,
      duration: 'DAY',
      network: NET_BNB,
    };
  }

  private doGet(duration: PriceDuration, token: ShieldUnderlyingType): Observable<TokenPriceHistory> {
    const days: number = duration === 'DAY' ? 1 : duration === 'WEEK' ? 7 : duration === 'MONTH' ? 30 : 30;
    const tokenSym: symbol | undefined = tokenSymbolFromName(token);
    const id: string | undefined = tokenSym ? tokenIdMaps.get(tokenSym) : undefined;

    if (!id) {
      return EMPTY;
    }

    const url: string = `https://api.coingecko.com/api/v3/coins/${id}/market_chart?vs_currency=USD&days=${days}`;

    const priceData$: Observable<TokenPriceHistory> = this.getFromUrl(url, token, duration);

    return cacheService.tryUseCache(priceData$, url, CACHE_1_MIN);
  }

  private getFromUrl(
    url: string,
    underlying: ShieldUnderlyingType,
    duration: PriceDuration
  ): Observable<TokenPriceHistory> {
    this.isPending.next(true);
    return httpGet(url).pipe(
      map(res => {
        const isOK: boolean = _.get(res, 'status', 400) === 200;
        const body = isOK ? _.get(res, 'body') : {};

        const data: [number, number][] = body.prices || [];
        const curPrice: number = data[data.length - 1][1];

        const { min, max, percent } = this.minMax(data);

        const rs = {
          curPrice,
          history: data,
          minPrice: min,
          maxPrice: max,
          underlying,
          priceChange: percent,
          duration,
          network: NET_BNB,
        };

        return rs;
      }),
      finalize(() => {
        this.isPending.next(false);
      })
    );
  }

  private minMax(data: [number, number][]): { min: number; max: number; percent: number } {
    let min = -1;
    let max = 0;
    const start = data[0][1];
    const end = data[data.length - 1][1];
    const percent = ((end - start) * 100) / start;

    data.forEach(one => {
      min = min >= 0 ? Math.min(min, one[1]) : one[1];
      max = Math.max(max, one[1]);
    });

    return { min, max, percent };
  }
}
