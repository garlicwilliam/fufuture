import { DatabaseStateMerger } from '../../../interface';
import { ShieldPoolAddress, ShieldPoolAddressList } from '../../../state-types';
import { Observable, of } from 'rxjs';
import { SLD_ENV_CONF } from '../../../../components/shield-option-trade/const/env';
import { httpPost } from '../../../../util/http';
import { map, tap } from 'rxjs/operators';
import * as _ from 'lodash';
import { NET_BNB, Network } from '../../../../constant/network';
import { isTheGraphQL, SubGraphType, subGraphTypeFromUrl } from './utils';

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

    const isTheGraph: boolean = isTheGraphQL(url);
    const param = isTheGraph ? this.postParam0() : this.postParam1();

    return httpPost(url, param).pipe(
      map(res => {
        const isOK: boolean = _.get(res, 'status', 400) === 200 && !_.isEmpty(_.get(res, 'body.data'));

        if (!isOK) {
          return { private: [], public: [], network };
        }

        const body = _.get(res, 'body');
        const privatePools: any[] = isTheGraph ? body.data.createPrivatePools : body.data.createPrivatePools.nodes;
        const publicPools: any[] = isTheGraph ? body.data.createPublicPools : body.data.createPublicPools.nodes;

        const privates: ShieldPoolAddress[] = privatePools.map((one): ShieldPoolAddress => {
          return {
            tokenAddress: one.tokenAddr,
            poolAddress: one.poolAddr,
            network,
          };
        });
        const publics: ShieldPoolAddress[] = publicPools.map((one): ShieldPoolAddress => {
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

  private postParam0(): any {
    return {
      query: `{
        createPrivatePools(first: 1000) {
            tokenAddr,
            poolAddr
        },
        createPublicPools(first: 1000) {
            tokenAddr,
            poolAddr
        }
      }`,
      variables: {},
    };
  }

  private postParam1(): any {
    return {
      query: `{
          createPrivatePools(first: 1000) {
            nodes {
              tokenAddr,
              poolAddr
            }
          },
          createPublicPools(first: 1000) {
            nodes {
              tokenAddr,
              poolAddr
            }
          }
      }`,
    };
  }
}
