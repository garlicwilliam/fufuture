import { DatabaseStateMerger } from '../../../interface';
import { Observable, of } from 'rxjs';
import { httpPost } from '../../../../util/http';
import { map } from 'rxjs/operators';
import * as _ from 'lodash';
import { SLD_ENV_CONF } from '../../../../components/shield-option-trade/const/env';
import { Network } from '../../../../constant/network';

export class MergerMyReferrals implements DatabaseStateMerger<number, [string, Network]> {
  mergeWatch(...args: [string, Network]): Observable<number> {
    return this.doGet(args[0], args[1]);
  }

  mock(args?: [string, Network]): Observable<number> | number {
    return 0;
  }

  pending(): Observable<boolean> {
    return of(false);
  }

  doGet(inviter: string, network: Network): Observable<number> {
    const url: string | undefined = SLD_ENV_CONF.Supports[network]?.SubGraphUrl;

    if (!url) {
      return of(0);
    }

    return httpPost(url, this.genParam(inviter)).pipe(
      map(res => {
        const isOK = _.get(res, 'status', 400) === 200 && !_.isEmpty(_.get(res, 'body.data'));
        if (isOK) {
          const referrals: string = _.get(res, 'body.data.broker.referralCount', '0') as string;
          return Number(referrals);
        }

        return 0;
      })
    );
  }

  genParam(inviter: string): any {
    inviter = inviter.toLowerCase();
    return {
      query: `{  broker(id: "${inviter}") { referralCount } }`,
    };
  }

  // Same to The Graph
  genParam1(inviter: string) {
    inviter = inviter.toLowerCase();
  }
}
