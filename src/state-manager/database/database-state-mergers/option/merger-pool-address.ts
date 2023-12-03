import { DatabaseStateMerger } from '../../../interface';
import { ShieldPoolAddressList } from '../../../state-types';
import { Observable, of } from 'rxjs';
import { SLD_ENV_CONF } from '../../../../components/shield-option-trade/const/env';
import { httpPost } from '../../../../util/http';
import { map } from 'rxjs/operators';
import * as _ from 'lodash';

export class MergerPoolAddress implements DatabaseStateMerger<ShieldPoolAddressList, []> {
  mergeWatch(...args: []): Observable<ShieldPoolAddressList> {
    return this.doGet();
  }

  mock(args?: []): Observable<ShieldPoolAddressList> | ShieldPoolAddressList {
    return { private: [], public: [] };
  }

  pending(): Observable<boolean> {
    return of(false);
  }

  doGet(): Observable<ShieldPoolAddressList> {
    const url = SLD_ENV_CONF.SubGraphUrl;

    return httpPost(url, this.postParam()).pipe(
      map(res => {
        const isOK: boolean = _.get(res, 'status', 400) === 200 && !_.isEmpty(_.get(res, 'body.data'));

        if (!isOK) {
          return { private: [], public: [] };
        }

        const body = _.get(res, 'body');
        const privates = (body.data.createPrivatePools as any[]).map(one => {
          return {
            tokenAddress: one.tokenAddr,
            poolAddress: one.poolAddr,
          };
        });
        const publics = (body.data.createPublicPools as any[]).map(one => {
          return {
            tokenAddress: one.tokenAddr,
            poolAddress: one.poolAddr,
          };
        });

        return {
          private: privates,
          public: publics,
        };
      })
    );
  }

  postParam(): any {
    return {
      query: `{
        createPrivatePools {
            tokenAddr,
            poolAddr
        },
        createPublicPools {
            tokenAddr,
            poolAddr
        }
      }`,
      variables: {},
    };
  }
}
