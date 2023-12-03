import { DatabaseStateMerger } from '../../../interface';
import { SldDecimal } from '../../../../util/decimal';
import { Observable, of } from 'rxjs';
import { curTimestamp } from '../../../../util/time';
import { httpPost } from '../../../../util/http';
import { map } from 'rxjs/operators';
import * as _ from 'lodash';
import { BigNumber } from 'ethers';
import { ZERO } from '../../../../constant';
import { IndexUnderlyingDecimal } from '../../../../components/shield-option-trade/const/assets';
import { SLD_ENV_CONF } from '../../../../components/shield-option-trade/const/env';
import {ShieldTokenTradingVolume, ShieldTradingVolume, ShieldUnderlyingType} from '../../../state-types';
import { CACHE_1_MIN, cacheService } from '../../../mem-cache/cache-contract';

function emptyRs(name: ShieldUnderlyingType): ShieldTradingVolume {
  return {
    indexUnderlying: name,
    total: SldDecimal.ZERO,
    tokens: [],
  };
}

class VolumeCache {
  private volume = new Map<string, BigNumber>();

  add(token: string, amount: string) {
    const key = token.toLowerCase();
    if (!this.volume.has(key)) {
      this.volume.set(key, ZERO);
    }

    const volNum = this.volume.get(key)!.add(BigNumber.from(amount));

    this.volume.set(key, volNum);
  }

  get(token: string): BigNumber {
    const key: string = token.toLowerCase();

    if (this.volume.has(key)) {
      return this.volume.get(key)!;
    }

    return ZERO;
  }

  toVolumes(): ShieldTokenTradingVolume[] {
    return Array.from(this.volume.keys()).map(token => {
      return {
        token,
        volume: SldDecimal.fromOrigin(this.volume.get(token)!, IndexUnderlyingDecimal),
      };
    });
  }
}

export class Merger24volume implements DatabaseStateMerger<ShieldTradingVolume, [string]> {
  mergeWatch(...args: [string]): Observable<ShieldTradingVolume> {
    return this.doGet(args[0] as ShieldUnderlyingType);
  }

  mock(args?: [string]): Observable<ShieldTradingVolume> | ShieldTradingVolume {
    return args ? emptyRs(args[0] as ShieldUnderlyingType) : emptyRs(ShieldUnderlyingType.ETH);
  }

  pending(): Observable<boolean> {
    return of(false);
  }

  doGet(name: ShieldUnderlyingType): Observable<ShieldTradingVolume> {
    const url = SLD_ENV_CONF.SubGraphUrl;

    if (!url) {
      return of(emptyRs(name));
    }

    const volume$ = httpPost(url, this.genParam(name)).pipe(
      map(res => {
        const isOK = _.get(res, 'status', 400) === 200 && !_.isEmpty(_.get(res, 'body.data'));

        const volume = new VolumeCache();

        if (isOK) {
          const data = _.get(res, 'body.data');
          const open: { number: string; token: string }[] = data.trades;
          const close: { number: string; token: string }[] = data.closeOrders;

          const openAmount: BigNumber = open
            .map(one => {
              volume.add(one.token, one.number);
              return BigNumber.from(one.number);
            })
            .reduce((acc, cur) => acc.add(cur), ZERO);

          const closeAmount: BigNumber = close
            .map(one => {
              volume.add(one.token, one.number);
              return BigNumber.from(one.number);
            })
            .reduce((acc, cur) => acc.add(cur), ZERO);

          const amount: BigNumber = openAmount.add(closeAmount);
          const total = SldDecimal.fromOrigin(amount, IndexUnderlyingDecimal);

          return {
            indexUnderlying: name,
            total,
            tokens: volume.toVolumes(),
          } as ShieldTradingVolume;
        }

        return emptyRs(name);
      })
    );

    const cacheKey: string = '24hour-volume-history-' + name;

    return cacheService.tryUseCache(volume$, cacheKey, CACHE_1_MIN);
  }

  genParam(name: string): any {
    const beginTime: number = curTimestamp() - 24 * 3600;

    return {
      query: `{
        trades( where: {name: "${name}", blockTimestamp_gt: ${beginTime} })  {
            name,
            token,
            number
         },
         closeOrders( where: {name: "${name}", state_not: 0, blockTimestamp_gt: ${beginTime} })  {
            name,
            token,
            number
         }
      }`,
      variables: {},
    };
  }
}
