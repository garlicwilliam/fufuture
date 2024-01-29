import {
  asyncScheduler,
  AsyncSubject,
  BehaviorSubject,
  from,
  isObservable,
  merge,
  mergeMap,
  Observable,
  of,
  retry,
  Subscription,
  switchMap,
  zip,
} from 'rxjs';
import { EthereumProviderName } from '../constant';
import { catchError, delay, filter, finalize, map, take, tap, toArray } from 'rxjs/operators';
import { EthereumProviderInterface, EthereumProviderState, EthereumSpecifyMethod } from './metamask-like-types';
import { ProviderExistDetectors, ProviderGetters } from './metamask-like-constant';
import * as _ from 'lodash';
import { NetworkParamConfig } from '../constant/network-type';

export function ethAccounts(ethereum: EthereumProviderInterface): Observable<string[]> {
  return from(ethereum.request({ method: 'eth_accounts' }) as Promise<string[]>).pipe(
    retry(1),
    catchError(err => {
      console.warn('error', err);
      return of([]);
    })
  );
}

export function netVersion(ethereum: EthereumProviderInterface): Observable<string> {
  return from(ethereum.request({ method: 'net_version' }) as Promise<string>).pipe(map(net => net.toString()));
}

export function ethRequestAccounts(ethereum: EthereumProviderInterface): Observable<string[]> {
  return from(ethereum.request({ method: 'eth_requestAccounts' }) as Promise<string[]>).pipe(
    catchError(err => {
      return of([]);
    })
  );
}

export function walletAddChain(ethereum: EthereumProviderInterface, chainParam: NetworkParamConfig): Observable<any> {
  const promise = ethereum.request({ method: 'wallet_addEthereumChain', params: [chainParam] });

  return from(promise);
}

export function walletSwitchChain(
  ethereum: EthereumProviderInterface,
  chainParam: NetworkParamConfig
): Observable<any> {
  return from(
    ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [_.pick(chainParam, ['chainId'])],
    }) as Promise<any>
  );
}

function detectIsConnected(ethereum: EthereumProviderInterface): Observable<boolean> {
  return of(ethereum.isConnected());
}

export class EthereumProviderStateManager {
  private injectedProviders = new BehaviorSubject<Set<EthereumProviderName> | undefined>(undefined);
  private connectedProviders = new BehaviorSubject<Set<EthereumProviderName> | undefined>(undefined);
  private curSelected = new BehaviorSubject<EthereumProviderState | null | undefined>(undefined);

  private initialized: AsyncSubject<boolean> = new AsyncSubject<boolean>();

  private _cacheKey = '_user_select_provider';

  private subs: Subscription[] = [];

  constructor() {
    const init$ = this.doDetect().pipe(
      delay(1000),
      switchMap(() => {
        return this.doDetect();
      }),
      finalize(() => {
        this.doneInitialized();
      })
    );

    const sub1 = init$.subscribe();
    const sub2 = this.watchInitEvent().subscribe();

    this.subs.push(sub1, sub2);
  }

  public hasInit(): Observable<boolean> {
    return this.initialized;
  }

  public watchInjectedProviders(): Observable<Set<EthereumProviderName>> {
    return this.injectedProviders.pipe(
      filter(Boolean),
      map(injected => new Set<EthereumProviderName>(injected))
    );
  }

  public watchConnectedProviders(): Observable<Set<EthereumProviderName>> {
    return this.connectedProviders.pipe(
      filter(Boolean),
      map(connected => new Set(connected))
    );
  }

  public watchCurrentSelected(): Observable<EthereumProviderState | null> {
    return this.curSelected.pipe(
      filter(state => state !== undefined),
      map(state => state as EthereumProviderState | null)
    );
  }

  public getCurrentSelected(): EthereumProviderState | null {
    return this.curSelected.getValue() || null;
  }

  public setUserSelected(selected: EthereumProviderName | null): boolean {
    const injected: Set<EthereumProviderName> | undefined = this.injectedProviders.getValue();
    if (!injected || injected.size === 0) {
      return false;
    }

    this.cacheProvider = selected;

    if (selected) {
      const provider$: Observable<EthereumProviderInterface> = ProviderGetters[selected]();
      provider$
        .pipe(
          map((provider: EthereumProviderInterface) => {
            const state: EthereumProviderState | null = provider
              ? {
                  name: selected,
                  instance: provider,
                  specifyMethod: EthereumSpecifyMethod.User,
                }
              : null;

            return state;
          })
        )
        .subscribe((state: EthereumProviderState | null) => {
          this.updateCurSelect(state);
        });
    } else {
      this.updateCurSelect(null);
    }

    return true;
  }

  public destroy() {
    this.injectedProviders.complete();
    this.connectedProviders.complete();
    this.curSelected.complete();

    this.subs.forEach((sub: Subscription) => {
      sub.unsubscribe();
    });
  }

  private set cacheProvider(provider: EthereumProviderName | null) {
    if (provider === null) {
      localStorage.removeItem(this._cacheKey);
    } else {
      localStorage.setItem(this._cacheKey, provider);
    }
  }

  private get cacheProvider(): EthereumProviderName | null {
    return localStorage.getItem(this._cacheKey) as EthereumProviderName | null;
  }

  private doneInitialized() {
    if (this.initialized.closed) {
      return;
    }

    asyncScheduler.schedule(() => {
      this.initialized.next(true);
      this.initialized.complete();
    });
  }

  private updateCurSelect(state: EthereumProviderState | null) {
    asyncScheduler.schedule(() => {
      this.curSelected.next(state);
    });
  }

  private watchInitEvent(): Observable<any> {
    return this.watchConnectedProviders().pipe(
      map((connected: Set<EthereumProviderName>) => {
        return this.selectProvider(connected, this.cacheProvider);
      }),
      switchMap((providerName: EthereumProviderName | null) => {
        if (providerName === null) {
          return of([null, null]);
        }

        return zip(ProviderGetters[providerName](), of(providerName)).pipe(take(1));
      }),
      map(([provider, providerName]) => {
        const state: EthereumProviderState | null =
          provider && providerName
            ? {
                name: providerName,
                instance: provider,
                specifyMethod: EthereumSpecifyMethod.Auto,
              }
            : null;

        return state;
      }),
      tap((state: EthereumProviderState | null) => {
        this.updateCurSelect(state);

        if (state) {
          this.doneInitialized();
        }
      })
    );
  }

  private doDetect(): Observable<any> {
    return this.detectInjectedProviders().pipe(
      tap((injected: Set<EthereumProviderName>) => {
        this.injectedProviders.next(injected);
      }),
      switchMap((injected: Set<EthereumProviderName>) => {
        return this.detectConnectedProvider(injected);
      }),
      tap((connected: Set<EthereumProviderName>) => {
        if (!_.isEqual(connected, this.connectedProviders.getValue())) {
          this.connectedProviders.next(connected);
        }
      })
    );
  }

  private detectInjectedProviders(): Observable<Set<EthereumProviderName>> {
    const existObs: Observable<string | null>[] = Object.keys(ProviderExistDetectors).map(key => {
      const detector: () => boolean | Observable<boolean> = ProviderExistDetectors[key];
      const isExist$: boolean | Observable<boolean> = detector();
      const exist$ = isObservable(isExist$) ? isExist$ : of(isExist$);

      return exist$.pipe(map(is => (is ? key : null)));
    });

    const existNames$: Observable<Set<EthereumProviderName>> = merge(...existObs).pipe(
      toArray(),
      map((keys: (string | null)[]) => {
        return keys.filter(Boolean) as EthereumProviderName[];
      }),
      map((keys: EthereumProviderName[]) => {
        const names = new Set<EthereumProviderName>();
        keys.forEach(key => names.add(key));
        return names;
      })
    );

    return existNames$;
  }

  private detectConnectedProvider(providers: Set<EthereumProviderName>): Observable<Set<EthereumProviderName>> {
    if (providers.size === 0) {
      return of(new Set<EthereumProviderName>());
    }

    const detect = (providerName: EthereumProviderName): Observable<boolean> => {
      const ethereumGetter = ProviderGetters[providerName];
      const ethereum$: Observable<EthereumProviderInterface> = ethereumGetter();

      return ethereum$.pipe(
        switchMap((ethereum: EthereumProviderInterface) => {
          return detectIsConnected(ethereum);
        })
      );
    };

    return from(Array.from(providers)).pipe(
      mergeMap((providerName: EthereumProviderName) => {
        return detect(providerName).pipe(
          map(connected => [providerName, connected] as [EthereumProviderName, boolean])
        );
      }),
      toArray(),
      map((connected: [EthereumProviderName, boolean][]) => {
        const providers: EthereumProviderName[] = connected.filter(one => one[1]).map(one => one[0]);
        return new Set<EthereumProviderName>(providers);
      })
    );
  }

  private selectProvider(
    providers: Set<EthereumProviderName>,
    cacheProvider: EthereumProviderName | null
  ): EthereumProviderName | null {
    if (cacheProvider && providers.has(cacheProvider)) {
      return cacheProvider;
    } else if (providers.has(EthereumProviderName.MetaMask)) {
      return EthereumProviderName.MetaMask;
    } else if (providers.size > 0) {
      return providers.values().next().value;
    } else {
      return null;
    }
  }
}

export const metamaskProviderManager = new EthereumProviderStateManager();
