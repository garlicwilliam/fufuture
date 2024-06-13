import { DatabaseStateMerger } from '../../../interface';
import { ShieldMakerPublicPoolShare, ShieldMakerPublicPoolShareRs, StateNullType } from '../../../state-types';
import { from, mergeMap, Observable, of, switchMap } from 'rxjs';
import { httpPost } from '../../../../util/http';
import { map, take, toArray } from 'rxjs/operators';
import * as _ from 'lodash';
import { makerPubPoolShareGetter } from '../../../contract/contract-getter-cpx-shield';
import { isSN } from '../../../interface-util';
import { walletState } from '../../../wallet/wallet-state';
import { SLD_ENV_CONF } from '../../../../components/shield-option-trade/const/env';
import { Network } from '../../../../constant/network';
import { isTheGraphQL } from './utils';

type Result = ShieldMakerPublicPoolShareRs | undefined;
type Argument = [string, Network];

export class MergerMakerShare implements DatabaseStateMerger<Result, Argument> {
  mergeWatch(...args: Argument): Observable<Result> {
    return this.doGet(args[0], args[1]);
  }

  mock(args?: Argument): Observable<Result> | Result {
    return undefined;
  }

  pending(): Observable<boolean> {
    return of(false);
  }

  private doGet(maker: string, network: Network): Observable<Result> {
    const url: string | undefined = SLD_ENV_CONF.Supports[network]?.SubGraphUrl;
    if (!url) {
      return of(undefined);
    }

    const isTheGraph: boolean = isTheGraphQL(url);
    const param = isTheGraph ? this.genParam(maker) : this.genParam1(maker);

    return httpPost(url, param).pipe(
      map(res => {
        const isOK = _.get(res, 'status', 400) === 200 && _.get(res, 'body.data') !== undefined;

        if (!isOK) {
          return [];
        }

        const liquidityArr = isTheGraph
          ? _.get(res, 'body.data.addLiquidityPublics', [])
          : _.get(res, 'body.data.addLiquidityPublics.nodes', []);

        const addresses: string[] = liquidityArr.map(one => one.fromContract);

        return Array.from(new Set(addresses));
      }),
      switchMap((addresses: string[]) => {
        return from(addresses).pipe(
          mergeMap(address => {
            return walletState.watchWeb3Provider().pipe(
              take(1),
              switchMap(provider => {
                return makerPubPoolShareGetter(maker, address, provider);
              })
            );
          }),
          toArray()
        );
      }),
      map((info: (ShieldMakerPublicPoolShare | StateNullType)[]) => {
        const pools = info.filter(one => !isSN(one)) as ShieldMakerPublicPoolShare[];
        return pools.sort((a, b) => (a.token.symbol > b.token.symbol ? 1 : -1));
      }),
      map((pools: ShieldMakerPublicPoolShare[]): Result => {
        return {
          maker,
          network,
          pools,
        };
      })
    );
  }

  private genParam(maker: string) {
    return {
      query: `{ addLiquidityPublics(where: {account:"${maker}"}) { fromContract }}`,
      variables: {},
    };
  }

  private genParam1(maker: string) {
    maker = maker.toLowerCase();
    return {
      query: `{
        addLiquidityPublics(
          first: 1000,
          filter: {
            account: {
              equalTo: "${maker}"
            }
          }
        ){
          nodes {
            fromContract
          }
        }
      }`,
    };
  }
}
