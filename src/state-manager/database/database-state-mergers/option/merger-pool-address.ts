import { DatabaseStateMerger } from '../../../interface';
import { ShieldPoolAddress, ShieldPoolAddressList } from '../../../state-types';
import { Observable, of } from 'rxjs';
import { SLD_ENV_CONF } from '../../../../components/shield-option-trade/const/env';
import { httpPost } from '../../../../util/http';
import { map } from 'rxjs/operators';
import * as _ from 'lodash';
import { NET_BNB, Network } from '../../../../constant/network';

export class MergerPoolAddress implements DatabaseStateMerger<ShieldPoolAddressList, [Network]> {
  mergeWatch(...args: [Network]): Observable<ShieldPoolAddressList> {
    return this.doGet(args[0]);
  }

  mock(args?: [Network]): Observable<ShieldPoolAddressList> | ShieldPoolAddressList {
    return { private: [], public: [], network: args ? args[0] : NET_BNB };
  }

  pending(): Observable<boolean> {
    return of(false);
  }

  doGet(network: Network): Observable<ShieldPoolAddressList> {
    const url: string | undefined = SLD_ENV_CONF.Supports[network]?.SubGraphUrl;

    if (!url) {
      return of({
        private: [],
        public: [],
        network,
      });
    }

    return httpPost(url, this.postParam()).pipe(
      map(res => {
        const isOK: boolean = _.get(res, 'status', 400) === 200 && !_.isEmpty(_.get(res, 'body.data'));

        if (!isOK) {
          return { private: [], public: [], network };
        }

        const body = _.get(res, 'body');
        const privates: ShieldPoolAddress[] = (body.data.createPrivatePools as any[]).map((one): ShieldPoolAddress => {
          return {
            tokenAddress: one.tokenAddr,
            poolAddress: one.poolAddr,
            network,
          };
        });
        const publics: ShieldPoolAddress[] = (body.data.createPublicPools as any[]).map((one): ShieldPoolAddress => {
          return {
            tokenAddress: one.tokenAddr,
            poolAddress: one.poolAddr,
            network,
          };
        });

        return {
          private: privates,
          public: publics,
          network,
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
