import { DatabaseStateMerger } from '../../../interface';
import { SldDecimal } from '../../../../util/decimal';
import { Observable, of } from 'rxjs';
import { curTimestamp } from '../../../../util/time';
import { SUB_GRAPH_API } from '../../../../components/shield-option-trade/const/default';
import { httpPost } from '../../../../util/http';
import { map } from 'rxjs/operators';
import * as _ from 'lodash';
import { BigNumber } from '@ethersproject/bignumber';
import { ZERO } from '../../../../constant';
import { IndexUnderlyingDecimal } from '../../../../components/shield-option-trade/const/assets';

export class Merger24volume implements DatabaseStateMerger<SldDecimal, [string]> {
  mergeWatch(...args: [string]): Observable<SldDecimal> {
    return this.doGet(args[0]);
  }

  mock(args?: [string]): Observable<SldDecimal> | SldDecimal {
    return SldDecimal.ZERO;
  }

  pending(): Observable<boolean> {
    return of(false);
  }

  doGet(name: string): Observable<SldDecimal> {
    const url = SUB_GRAPH_API;

    if (!url) {
      return of(SldDecimal.ZERO);
    }

    return httpPost(url, this.genParam(name)).pipe(
      map(res => {
        const isOK = _.get(res, 'status', 400) === 200 && !_.isEmpty(_.get(res, 'body.data'));

        if (isOK) {
          const data = _.get(res, 'body.data');
          const open: { number: string }[] = data.trades;
          const close: { number: string }[] = data.closeOrders;

          const openAmount: BigNumber = open
            .map(one => BigNumber.from(one.number))
            .reduce((acc, cur) => acc.add(cur), ZERO);
          const closeAmount: BigNumber = close
            .map(one => BigNumber.from(one.number))
            .reduce((acc, cur) => acc.add(cur), ZERO);

          const amount = openAmount.add(closeAmount);

          return SldDecimal.fromOrigin(amount, IndexUnderlyingDecimal);
        }

        return SldDecimal.ZERO;
      })
    );
  }

  genParam(name: string): any {
    const beginTime: number = curTimestamp() - 24 * 3600;

    return {
      query: `{ trades( where: {name: "${name}", blockTimestamp_gt: ${beginTime} })  { name,  number }, closeOrders( where: {name: "${name}", state_in: [1,2,3,4], blockTimestamp_gt: ${beginTime} })  { name, number }}`,
      variables: {},
    };
  }
}
