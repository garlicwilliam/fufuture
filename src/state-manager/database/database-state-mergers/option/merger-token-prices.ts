import { BehaviorSubject, EMPTY, Observable } from 'rxjs';
import { DatabaseStateMerger } from '../../../interface';
import { PriceDuration, TokenPriceHistory } from '../../../state-types';
import _ from 'lodash';
import { tokenIdMaps } from '../token-ids';
import { finalize, map } from 'rxjs/operators';
import { IndexUnderlyingType } from '../../../../components/shield-option-trade/const/assets';
import { tokenSymbolFromName } from '../../../../constant/tokens';
import { httpGet } from '../../../../util/http';
import { CACHE_1_MIN, cacheService } from '../../../mem-cache/cache-contract';

export class TokenPricesMerger implements DatabaseStateMerger<TokenPriceHistory, [PriceDuration, IndexUnderlyingType]> {
  //
  private isPending: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  public mergeWatch(...args: [PriceDuration, IndexUnderlyingType]): Observable<TokenPriceHistory> {
    return this.doGet(args[0], args[1]);
  }

  public pending(): Observable<boolean> {
    return this.isPending;
  }

  public mock(): TokenPriceHistory {
    return {
      curPrice: 0,
      history: [],
      minPrice: 0,
    };
  }

  private doGet(duration: PriceDuration, token: IndexUnderlyingType): Observable<TokenPriceHistory> {
    const days: number = duration === 'DAY' ? 1 : duration === 'WEEK' ? 7 : duration === 'MONTH' ? 30 : 30;
    const tokenSym: symbol | undefined = tokenSymbolFromName(token);
    const id: string | undefined = tokenSym ? tokenIdMaps.get(tokenSym) : undefined;

    if (!id) {
      return EMPTY;
    }

    const url: string = `https://api.coingecko.com/api/v3/coins/${id}/market_chart?vs_currency=USD&days=${days}`;

    const priceData$: Observable<TokenPriceHistory> = this.getFromUrl(url);
    return cacheService.tryUseCache(priceData$, url, CACHE_1_MIN);
  }

  private getFromUrl(url: string): Observable<TokenPriceHistory> {
    this.isPending.next(true);
    return httpGet(url).pipe(
      map(res => {
        const isOK: boolean = _.get(res, 'status', 400) === 200;
        const body = isOK ? _.get(res, 'body') : {};

        const data: [number, number][] = body.prices || [];
        const curPrice: number = data[data.length - 1][1];
        const minPrice: [number, number] = _.minBy(data, one => one[1]) || [0, 0];

        return { curPrice, history: data, minPrice: minPrice[1] };
      }),
      finalize(() => {
        this.isPending.next(false);
      })
    );
  }
}
