import { DatabaseStateMerger } from '../../../interface';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { ShieldOpenInterest, ShieldTokenOpenInterest, ShieldUnderlyingType } from '../../../state-types';
import { SldDecimal } from '../../../../util/decimal';
import { SLD_ENV_CONF } from '../../../../components/shield-option-trade/const/env';
import { NET_BNB, Network } from '../../../../constant/network';
import { httpPost } from '../../../../util/http';
import { map } from 'rxjs/operators';
import * as _ from 'lodash';
import { BigNumber } from 'ethers';
import { CACHE_1_MIN, cacheService } from '../../../mem-cache/cache-contract';
import { genDCacheKey } from '../../datebase-cache-key';

type Arg = [ShieldUnderlyingType, Network];
type Res = ShieldOpenInterest;
type RsItem = {
  amount: string;
  token: string;
  underlying: ShieldUnderlyingType;
};

const EMPTY: ShieldOpenInterest = {
  amount: SldDecimal.ZERO,
  network: NET_BNB,
  underlying: ShieldUnderlyingType.BTC,
  tokens: [],
};

export class MergerOpenInterest implements DatabaseStateMerger<Res, Arg> {
  private isPending: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  mergeWatch(...args: Arg): Observable<Res> {
    return this.doGet(args[0], args[1]);
  }

  mock(args?: Arg): Res {
    return EMPTY;
  }

  pending(): Observable<boolean> {
    return this.isPending;
  }

  private doGet(underlying: ShieldUnderlyingType, network: Network): Observable<Res> {
    const url = SLD_ENV_CONF.Supports[network]?.SubGraphUrl;

    if (!url) {
      return of(EMPTY);
    }

    const param = this.genParam(underlying);
    const open$ = httpPost(url, param).pipe(
      map(res => {
        const isOK: boolean = _.get(res, 'status', 400) === 200;
        if (!isOK) {
          return EMPTY;
        }

        const items = _.get(res, 'body.data.underlyingPositions', []);

        return this.convertRes(items, network, underlying);
      })
    );

    const cacheKey: string = genDCacheKey('open-interest', underlying + '/' + network);

    return cacheService.tryUseCache(open$, cacheKey, CACHE_1_MIN);
  }

  private genParam(underlying: ShieldUnderlyingType): any {
    return {
      query: `{
                underlyingPositions( where: {underlying: "${underlying}"}) {
                  underlying,
                  token,
                  amount
                }
              }`,
      variables: {},
    };
  }

  private convertRes(items: RsItem[], network: Network, underlying: ShieldUnderlyingType): Res {
    const tokens: ShieldTokenOpenInterest[] = items.map((one): ShieldTokenOpenInterest => {
      const amount: SldDecimal = SldDecimal.fromOrigin(BigNumber.from(one.amount), 18);

      return {
        amount,
        tokenAddr: one.token,
        underlying: one.underlying,
        network: network,
      };
    });

    const total: SldDecimal = tokens.reduce((acc, cur) => {
      return acc.add(cur.amount);
    }, SldDecimal.ZERO);

    return {
      network,
      underlying,
      amount: total,
      tokens,
    };
  }
}
