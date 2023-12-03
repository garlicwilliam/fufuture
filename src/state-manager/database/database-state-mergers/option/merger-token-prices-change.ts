import { DatabaseStateMerger } from '../../../interface';
import { SldDecPercent } from '../../../../util/decimal';
import { EMPTY, Observable, of } from 'rxjs';
import { tokenIdMaps } from '../token-ids';
import { tokenSymbolFromName } from '../../../../constant/tokens';
import { httpGet } from '../../../../util/http';
import { catchError, map } from 'rxjs/operators';
import * as _ from 'lodash';
import { CACHE_1_MIN, cacheService } from '../../../mem-cache/cache-contract';
import {ShieldUnderlyingType} from "../../../state-types";

export class MergerTokenPricesChange implements DatabaseStateMerger<SldDecPercent, [ShieldUnderlyingType]> {
  mergeWatch(...args: [ShieldUnderlyingType]): Observable<SldDecPercent> {
    return this.doGet(args[0]);
  }

  mock(args?: [ShieldUnderlyingType]): Observable<SldDecPercent> | SldDecPercent {
    return SldDecPercent.genPercent('2.2');
  }

  pending(): Observable<boolean> {
    return of(false);
  }

  private doGet(indexUnderlying: ShieldUnderlyingType): Observable<SldDecPercent> {
    const tokenSymbol = tokenSymbolFromName(indexUnderlying);
    const tokenId: string | undefined = tokenSymbol ? tokenIdMaps.get(tokenSymbol) : undefined;

    if (!tokenId) {
      return EMPTY;
    }

    const url: string = `https://api.coingecko.com/api/v3/simple/price?ids=${tokenId}&vs_currencies=USD&include_24hr_change=true`;

    const change$ = httpGet(url).pipe(
      map(res => {
        const isOK: boolean = _.get(res, 'statusCode', 400) === 200;
        const body = isOK ? _.get(res, 'body', {}) : {};
        const change: number = body[tokenId]['usd_24h_change'];

        return SldDecPercent.genPercent(change.toString());
      }),
      catchError(() => {
        return of(SldDecPercent.ZERO);
      })
    );

    return cacheService.tryUseCache(change$, url, CACHE_1_MIN);
  }
}
