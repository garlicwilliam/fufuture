import { DatabaseStateMerger } from '../../../interface';
import { Observable, of } from 'rxjs';
import { SUB_GRAPH_API } from '../../../../components/shield-option-trade/const/default';
import { httpPost } from '../../../../util/http';
import { map } from 'rxjs/operators';
import * as _ from 'lodash';

export class MergerMyReferrals implements DatabaseStateMerger<number, [string]> {
  mergeWatch(...args: [string]): Observable<number> {
    return this.doGet(args[0]);
  }

  mock(args?: [string]): Observable<number> | number {
    return 0;
  }

  pending(): Observable<boolean> {
    return of(false);
  }

  doGet(inviter: string): Observable<number> {
    const url = SUB_GRAPH_API;

    if (!url) {
      return of(0);
    }

    return httpPost(url, this.genParam(inviter)).pipe(
      map(res => {
        const isOK = _.get(res, 'status', 400) === 200 && !_.isEmpty(_.get(res, 'body.data'));
        if (isOK) {
          const referrals = _.get(res, 'body.data.addBrokers') as any[];
          return referrals.length;
        }

        return 0;
      })
    );
  }

  genParam(inviter: string): any {
    return {
      query: `{ addBrokers(where: {inviter: "${inviter}"}) { inviter }}`,
      variables: {},
    };
  }
}
