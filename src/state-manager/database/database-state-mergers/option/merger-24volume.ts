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
import { ShieldTokenTradingVolume, ShieldTradingVolume, ShieldUnderlyingType } from '../../../state-types';
import { CACHE_1_MIN, cacheService } from '../../../mem-cache/cache-contract';
import { NET_BNB, Network } from '../../../../constant/network';
import { genDCacheKey } from '../../datebase-cache-key';

function emptyRs(name: ShieldUnderlyingType, network: Network): ShieldTradingVolume {
  return {
    indexUnderlying: name,
    total: SldDecimal.ZERO,
    tokens: [],
    network: network ? network : NET_BNB,
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

    return this.volume.has(key) ? this.volume.get(key) || ZERO : ZERO;
  }

  toVolumes(): ShieldTokenTradingVolume[] {
    return Array.from(this.volume.keys()).map((token: string) => {
      return {
        token,
        volume: SldDecimal.fromOrigin(this.volume.get(token)!, IndexUnderlyingDecimal),
      };
    });
  }
}

export class Merger24volume implements DatabaseStateMerger<ShieldTradingVolume, [ShieldUnderlyingType, Network]> {
  mergeWatch(...args: [ShieldUnderlyingType, Network]): Observable<ShieldTradingVolume> {
    return this.doGet(args[0], args[1]);
  }

  mock(args?: [ShieldUnderlyingType, Network]): Observable<ShieldTradingVolume> | ShieldTradingVolume {
    return args ? emptyRs(args[0], args[1]) : emptyRs(ShieldUnderlyingType.ETH, NET_BNB);
  }

  pending(): Observable<boolean> {
    return of(false);
  }

  doGet(name: ShieldUnderlyingType, network: Network): Observable<ShieldTradingVolume> {
    const url: string | undefined = SLD_ENV_CONF.Supports[network]?.SubGraphUrl;

    if (!url) {
      return of(emptyRs(name, network));
    }

    const volume$ = httpPost(url, this.genParam(name)).pipe(
      map((res): ShieldTradingVolume => {
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
            network,
          };
        }

        return emptyRs(name, network);
      })
    );

    const cacheKey: string = genDCacheKey('shield-24h-volume', `${network}-${name}`);

    return cacheService.tryUseCache(volume$, cacheKey, CACHE_1_MIN);
  }

  genParam(name: string): any {
    const beginTime: number = curTimestamp() - 24 * 3600;

    return {
      query: `{
        trades(first: 1000, where: {name: "${name}", blockTimestamp_gt: ${beginTime} })  {
            name,
            token,
            number
         },
         closeOrders(first: 1000, where: {name: "${name}", state_not: 0, blockTimestamp_gt: ${beginTime} })  {
            name,
            token,
            number
         }
      }`,
      variables: {},
    };
  }
}
