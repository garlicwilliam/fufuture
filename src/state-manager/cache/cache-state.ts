import { CacheParser, CachePatcher, CacheSerializer, CacheState } from '../interface';
import { BehaviorSubject, combineLatest, Observable, of, Subscription } from 'rxjs';
import { walletState } from '../wallet/wallet-state';
import { finalize, map, switchMap, take } from 'rxjs/operators';
import { Network } from '../../constant/network';

type StateInfo<T> = {
  state: T | null;
  realKey: string;
};

export class CacheStateImp<T> implements CacheState<T> {
  private state: BehaviorSubject<StateInfo<T>> = new BehaviorSubject<StateInfo<T>>({
    state: null,
    realKey: '',
  });
  private sub: Subscription | null = null;

  constructor(
    private key: string,
    private serializer: CacheSerializer<T>,
    private parser: CacheParser<T>,
    private patcher: CachePatcher<T> | undefined,
    private isGlobal: boolean
  ) {}

  public getKey(): string {
    return this.key;
  }

  // ---------------- get

  public get(): Observable<T | null> {
    const rs$: Observable<T | null> = this.getRealKey().pipe(
      map(realKey => {
        return this.realGet(realKey);
      })
    );

    return rs$;
  }

  public getWithDef(defVal: T): Observable<T> {
    return this.get().pipe(
      map(val => {
        if (val === null) {
          return defVal;
        } else {
          return val;
        }
      })
    );
  }

  public getWithAddress(address: string, network: Network): Observable<T | null> {
    const realKey: string = this.computeRealKey(network, address);
    return of(this.realGet(realKey));
  }

  // ---------------- set

  public set(state: T | null): void {
    this.getRealKey().subscribe((realKey: string) => {
      this.realSet(state, realKey);
    });
  }

  public setWithAddress(state: T | null, address: string, network: Network): void {
    const realKey = this.computeRealKey(network, address);
    this.realSet(state, realKey);
  }

  // ---------------- patch

  public patch(state: T | null) {
    if (this.patcher) {
      this.get().subscribe((old: T | null) => {
        const newState: T | null = (this.patcher as CachePatcher<T>)(old, state);
        this.set(newState);
      });
    } else {
      this.set(state);
    }
  }

  public patchWithAddress(state: T | null, address: string, network: Network) {
    if (this.patcher) {
      this.getWithAddress(address, network).subscribe((old: T | null) => {
        const newState: T | null = (this.patcher as CachePatcher<T>)(old, state);
        this.setWithAddress(newState, address, network);
      });
    } else {
      this.setWithAddress(state, address, network);
    }
  }

  // ---

  public watch(): Observable<T | null> {
    return of(true).pipe(
      switchMap(() => {
        if (!this.isWatching()) {
          this.doWatch();
        }

        return this.state.pipe(map(info => info.state));
      }),
      finalize(() => {
        if (!this.state.observed) {
          this.unwatch();
        }
      })
    );
  }

  // ---------------------------------------------------------------------------------------

  private isWatching(): boolean {
    return this.sub !== null;
  }

  private unwatch() {
    if (this.sub) {
      this.sub.unsubscribe();
      this.sub = null;
    }
  }

  private getRealKey(): Observable<string> {
    return this.watchRealKey().pipe(take(1));
  }

  private watchRealKey(): Observable<string> {
    return this.isGlobal
      ? of(this.key)
      : this.watchNetworkAndAccount().pipe(
          map(({ network, address }) => {
            return this.computeRealKey(network, address);
          })
        );
  }

  private watchNetworkAndAccount(): Observable<{ network: Network; address: string }> {
    return combineLatest([walletState.NETWORK, walletState.USER_ADDR]).pipe(
      map(([network, address]) => {
        return { network, address };
      })
    );
  }

  private computeRealKey(network: Network, address: string): string {
    return this.isGlobal ? this.key : this.key + '-' + network.toString() + '-' + address;
  }

  private doWatch() {
    this.sub = this.watchRealKey()
      .pipe(
        map(realKey => {
          return { state: this.realGet(realKey), realKey };
        })
      )
      .subscribe(stateInfo => {
        this.state.next(stateInfo);
      });
  }

  private realSet(state: T | null, realKey: string) {
    if (state === null) {
      localStorage.removeItem(realKey);
    } else {
      const lastStr: string | null = this.serializer(state);
      if (lastStr === null) {
        localStorage.removeItem(realKey);
      } else {
        localStorage.setItem(realKey, lastStr);
      }
    }

    if (this.state.getValue().realKey === realKey) {
      this.state.next({ state, realKey });
    }
  }

  private realGet(realKey: string): T | null {
    const cacheStr: string | null = localStorage.getItem(realKey);
    if (cacheStr !== null) {
      return this.parser(cacheStr);
    } else {
      return null;
    }
  }
}
