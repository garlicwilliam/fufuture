import { walletState } from '../wallet/wallet-state';
import { P } from '../page/page-state-parser';
import { map } from 'rxjs/operators';
import { TokenPricesMerger } from './database-state-mergers/option/merger-token-prices';
import { Observable, of } from 'rxjs';
import { DatabaseState, DatabaseStateRef, DatabaseStateTree } from '../interface';
import * as _ from 'lodash';
import { MergerTokenPricesChange } from './database-state-mergers/option/merger-token-prices-change';
import { MergerHistoryOrders } from './database-state-mergers/option/merger-history-orders';
import { Merger24volume } from './database-state-mergers/option/merger-24volume';
import { MergerMyReferrals } from './database-state-mergers/option/merger-my-referrals';
import { MergerMakerLockedDetail } from './database-state-mergers/option/merger-maker-locked-detail';
import { MergerMakerLiquidity } from './database-state-mergers/option/merger-maker-liquidity';
import { MergerMakerShare } from './database-state-mergers/option/merger-maker-share';
import { MergerPoolAddress } from './database-state-mergers/option/merger-pool-address';

class DBStateReference implements DatabaseStateRef {
  private root: DatabaseStateTree<any> | null = null;

  constructor(private refPath: string) {}

  public setRoot(root: DatabaseStateTree<any>) {
    this.root = root;
    return this;
  }

  public getRef(): Observable<DatabaseState<any> | null> {
    return of(this.refPath).pipe(
      map((path: string) => {
        if (_.has(this.root, path)) {
          return _.get(this.root, path) as DatabaseState<any>;
        } else {
          return null;
        }
      })
    );
  }

  public getPath(): string {
    return this.refPath;
  }
}

function Ref(path: string): DatabaseStateRef {
  return new DBStateReference(path);
}

export const DATABASE_STATE = {
  Option: {
    PriceChartData: {
      _depend: [P.Option.Trade.Market.ChartDuration.Price, P.Option.Trade.Pair.Base],
      _merger: new TokenPricesMerger(),
    },
    Price24hChange: {
      _depend: [P.Option.Trade.Pair.Base],
      _merger: new MergerTokenPricesChange(),
    },
    HistoryOrders: {
      _depend: [walletState.USER_ADDR, P.Option.Trade.OrderHistory.PageSize, P.Option.Trade.OrderHistory.PageIndex],
      _merger: new MergerHistoryOrders(),
    },
    Volume24h: {
      _depend: [P.Option.Trade.Pair.Base],
      _merger: new Merger24volume(),
    },
    Volume24hOfToken: {
      _depend: [P.Option.Trade.Select.IndexUnderlying],
      _merger: new Merger24volume(),
    },
    MyReferrals: {
      _depend: [walletState.USER_ADDR],
      _merger: new MergerMyReferrals(),
    },
    Maker: {
      YourShareInPools: {
        _depend: [walletState.USER_ADDR],
        _merger: new MergerMakerShare(),
      },
      YourLiquidity: {
        _depend: [walletState.USER_ADDR],
        _merger: new MergerMakerLiquidity(),
      },
      LockedDetails: {
        _depend: [P.Option.Pools.Private.LockedDetails.CurPool],
        _merger: new MergerMakerLockedDetail(),
      },
    },
    Pool: {
      AllAddress: {
        _depend: [],
        _merger: new MergerPoolAddress(),
      },
    },
  },
};
