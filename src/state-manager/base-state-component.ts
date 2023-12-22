import { Component } from 'react';
import { CacheState, ContractState, DatabaseState, PageState } from './interface';
import {
  asyncScheduler,
  AsyncSubject,
  BehaviorSubject,
  EMPTY,
  interval,
  isObservable,
  Observable,
  of,
  Subject,
  Subscription,
} from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, finalize, map, switchMap, take } from 'rxjs/operators';
import _ from 'lodash';
import { P } from './page/page-state-parser';
import { NavigateFunction, Location, Params } from 'react-router-dom';
import { RouteKey } from '../constant/routes';

type StateName<S> = keyof S & string;
type PendingName<S> = `${keyof S & string}Pending` & keyof S;
type BoolName<S> = keyof S & `is${string}`;

const INIT_SYMBOL = Symbol('init');

export class BaseStateComponent<O, S> extends Component<O, S> {
  static navigation: NavigateFunction | null = null;
  static navLocation: BehaviorSubject<Location | undefined> = new BehaviorSubject<Location | undefined>(undefined);
  static navParam: BehaviorSubject<Params> = new BehaviorSubject<Params>({});

  protected subs: Subscription[] = [];
  protected subIds: Map<string, Subscription> = new Map();
  public readonly defaultRem = 16;

  protected stateWatcher: Map<keyof S, BehaviorSubject<any>> = new Map<keyof S, BehaviorSubject<any>>();
  protected propsWrapper: Map<string, Subject<any>> = new Map<string, Subject<any>>();
  protected propsSubscription: Map<string, Subscription> = new Map<string, Subscription>();

  private updateStateEvent = new Subject();
  private updateStateQueue: Partial<S> | null = null;
  private updateStateRs: AsyncSubject<boolean> | null = null;

  private destroyed: boolean = false;
  private stateWatchSub: Subscription | null = null;

  protected debug: boolean = false;

  public setNavigation(nav: NavigateFunction) {
    if (BaseStateComponent.navigation === null) {
      BaseStateComponent.navigation = nav;
    }
  }

  public navigateTo(key: RouteKey | string, param?: string) {
    if (BaseStateComponent.navigation) {
      const route: string = key + (param || '');
      BaseStateComponent.navigation(route, { replace: true });
    }
  }

  public setLocation(location: Location) {
    if (!_.isEqual(BaseStateComponent.navLocation.getValue(), location)) {
      BaseStateComponent.navLocation.next(location);
    }
  }

  public get location(): Location | undefined {
    return BaseStateComponent.navLocation.getValue();
  }

  public setNavParam(param: Params) {
    if (!_.isEqual(BaseStateComponent.navParam.getValue(), param)) {
      BaseStateComponent.navParam.next(param);
    }
  }

  public get param(): Params | undefined {
    return BaseStateComponent.navParam.getValue();
  }

  public genStreamProp<T>(key: string, source: Observable<T>): Observable<T> {
    if (this.propsSubscription.has(key)) {
      (this.propsSubscription.get(key) as Subscription).unsubscribe();
      this.propsSubscription.delete(key);
    }

    if (!this.propsWrapper.has(key)) {
      this.propsWrapper.set(key, new BehaviorSubject<any>(INIT_SYMBOL));
    }

    const observer: Subject<any> = this.propsWrapper.get(key) as Subject<any>;
    const sub: Subscription = source.subscribe(observer);

    this.propsSubscription.set(key, sub);

    return observer.pipe(filter(val => val !== INIT_SYMBOL));
  }

  public registerRem<N extends keyof S, T extends Pick<S, N>>(name: N) {
    if (_.has(window, 'rem') && isObservable(_.get(window, 'rem'))) {
      const sub = (_.get(window, 'rem', EMPTY) as Observable<number>).subscribe((rem: any) => {
        const state = { [name]: rem } as Partial<S>;
        this.updateState(state);
      });

      this.subs.push(sub);
    }
  }

  public registerIsMobile<N extends keyof S, T extends Pick<S, N>>(name: N) {
    const sub = P.Layout.IsMobile.watch()
      .pipe(distinctUntilChanged())
      .subscribe((isMobile: any) => {
        this.updateState({ [name]: isMobile } as Partial<S>);
      });
    this.subs.push(sub);
  }

  public registerNavParam<N extends keyof S, T extends Pick<S, N>>(name: N) {
    const sub = BaseStateComponent.navParam.subscribe(param => this.updateState({ [name]: param } as Partial<S>));

    this.subs.push(sub);
  }

  public registerNavLocation<N extends keyof S, T extends Pick<S, N>>(name: N) {
    const sub = BaseStateComponent.navLocation.subscribe(location =>
      this.updateState({ [name]: location } as Partial<S>)
    );

    this.subs.push(sub);
  }

  public registerState<N extends keyof S>(
    name: N,
    state:
      | ContractState<S[N]>
      | PageState<S[N]>
      | DatabaseState<S[N]>
      | CacheState<S[N] | null>
      | Observable<ContractState<S[N]> | PageState<S[N]> | DatabaseState<S[N]> | CacheState<S[N] | null>>,
    callback?: () => void
  ): void {
    const stateObs = isObservable(state) ? state : of(state);
    const sub: Subscription = stateObs.pipe(switchMap(state => state.watch())).subscribe((s: S[N] | null) => {
      const newState = { [name]: s } as Pick<S, N>;

      this.updateState(newState as Partial<S>, callback);
    });

    this.subs.push(sub);
  }

  public registerStateWithLast<N extends keyof S>(
    name: N,
    oldName: N,
    state:
      | ContractState<S[N]>
      | PageState<S[N]>
      | DatabaseState<S[N]>
      | CacheState<S[N] | null>
      | Observable<ContractState<S[N]> | PageState<S[N]> | DatabaseState<S[N]> | CacheState<S[N] | null>>,
    compare: (s1: S[N] | null, s2: S[N] | null) => boolean
  ) {
    const stateObs = isObservable(state) ? state : of(state);
    const sub: Subscription = stateObs.pipe(switchMap(state => state.watch())).subscribe((s: S[N] | null) => {
      const old = this.state[name];
      if (!compare(old, s)) {
        const newState = { [name]: s, [oldName]: this.state[name] } as Pick<S, N>;
        this.updateState(newState as Partial<S>);
      }
    });

    this.subs.push(sub);
  }

  public registerStatePending<P extends StateName<S>, N extends PendingName<S>>(
    name: N,
    state: ContractState<S[P]> | DatabaseState<S[P]> | Observable<ContractState<S[P]>>
  ): void {
    const stateObs = isObservable(state) ? state : of(state);
    const sub: Subscription = stateObs
      .pipe(
        switchMap(state => state.pending()),
        map(s => s as any)
      )
      .subscribe((pending: S[N]) => {
        const newState = { [name]: pending } as Pick<S, N>;
        this.updateState(newState as Partial<S>);
      });

    this.subs.push(sub);
  }

  public registerObservable<N extends keyof S, T extends Pick<S, N>>(name: N, observable: Observable<S[N]>): void {
    const sub = observable.subscribe((s: S[N]) => {
      const state = { [name]: s } as Pick<S, N>;
      this.updateState(state as Partial<S>);
    });

    this.subs.push(sub);
  }

  public registerMultiState(observable: Observable<Partial<S>>): void {
    const sub = observable.subscribe((s: Partial<S>) => {
      this.updateState(s);
    });

    this.subs.push(sub);
  }

  public watchStateChange<N extends keyof S>(name: N): Observable<S[N]> {
    if (!this.stateWatcher.has(name)) {
      this.stateWatcher.set(name, new BehaviorSubject<any>(this.state[name]));
    }

    return this.stateWatcher.get(name) as Observable<S[N]>;
  }

  public sub<T>(
    obs: Observable<T>,
    callback: (val: T) => void = (val: T) => ({}),
    errCallback = (err: any) => console.warn('Subscribe Error:', err)
  ) {
    const sub = obs.subscribe({ next: callback, error: errCallback, complete: () => ({}) });
    this.subs.push(sub);
  }

  public subWithId<T>(
    obs: Observable<T>,
    id: string,
    callback: (val: T) => void = (val: T) => ({}),
    errCallback = (err: any) => console.warn('ID Subscribe Error:', err)
  ) {
    const sub = obs.subscribe({ next: callback, error: errCallback, complete: () => ({}) });

    if (this.subIds.has(id)) {
      this.subIds.get(id)?.unsubscribe();
    }

    this.subIds.set(id, sub);
  }

  public subOnce<T>(
    obs: Observable<T>,
    callback: (val: T) => void = (val: T) => ({}),
    errCallback = (err: any) => console.warn('Subscribe Error:', err)
  ) {
    const sub = obs.pipe(take(1)).subscribe({ next: callback, error: errCallback, complete: () => ({}) });
    this.subs.push(sub);
  }

  public subOnceWithPending<T, K extends BoolName<S>>(
    obs: Observable<T>,
    state: K,
    callback: (val: T) => void,
    errCallback = (err: any) => console.warn('Subscribe Error:', err)
  ) {
    this.setState({ [state]: true as any } as Pick<S, K>);

    const sub = obs
      .pipe(
        take(1),
        finalize(() => {
          this.setState({ [state]: false as any } as Pick<S, K>);
        })
      )
      .subscribe({ next: callback, error: errCallback, complete: () => ({}) });
    this.subs.push(sub);
  }

  public tickState(...states: (ContractState<any> | DatabaseState<any>)[]) {
    states.forEach(one => one.tick());
  }

  public tickDelay(delay: number, ...states: (ContractState<any> | DatabaseState<any>)[]) {
    asyncScheduler.schedule(() => {
      this.tickState(...states);
    }, delay);
  }

  public tickAndLater(delay: number, ...states: (ContractState<any> | DatabaseState<any>)[]) {
    this.tickState(...states);
    this.tickDelay(delay, ...states);
  }

  public tickInterval(time: number, ...states: (ContractState<any> | DatabaseState<any>)[]): void {
    const sub = interval(time).subscribe(() => {
      this.tickState(...states);
    });
    this.subs.push(sub);
  }

  public setToDefault(...states: (PageState<any> | ContractState<any>)[]): void {
    states.forEach(one => one.setToDefault());
  }

  public destroyState() {
    this.destroyed = true;

    if (this.subs) {
      this.subs.forEach(one => one.unsubscribe());
      this.subs = [];
    }

    if (this.subIds.size > 0) {
      for (const s of this.subIds.values()) {
        s.unsubscribe();
      }

      this.subIds.clear();
    }

    if (this.stateWatchSub) {
      this.stateWatchSub.unsubscribe();
      this.stateWatchSub = null;
    }

    this.stateWatcher.forEach((subject: BehaviorSubject<any>, name) => {
      subject.complete();
    });
    this.stateWatcher.clear();

    this.propsSubscription.forEach(sub => sub.unsubscribe());
    this.propsSubscription.clear();
    this.propsWrapper.forEach(subj => subj.complete());
    this.propsWrapper.clear();
  }

  // -------------------------------------------------------------------------------------------------------------------

  componentDidUpdate(prevProps: Readonly<O>, prevState: Readonly<S>, snapshot?: any) {
    //console.log('did update');
  }

  private watchUpdateState() {
    if (this.stateWatchSub !== null || this.destroyed) {
      return;
    }

    this.stateWatchSub = this.updateStateEvent.pipe(debounceTime(16)).subscribe(() => {
      if (this.updateStateQueue === null || this.updateStateRs === null) {
        return;
      }

      // clear cache
      const state = this.updateStateQueue as Pick<S, keyof S>;
      this.updateStateQueue = null;
      if (this.debug) {
        console.log('will update state', state);
      }
      const rsSubject = this.updateStateRs;
      this.updateStateRs = null;

      this.setState(state, () => {
        this.triggerMultiState(state);
        asyncScheduler.schedule(() => {
          rsSubject.next(true);
          rsSubject.complete();
        });
      });
    });
  }

  protected updateState(state: S | Partial<S>, callback?: () => void): Observable<boolean> {
    this.watchUpdateState();

    // set cache
    if (this.updateStateQueue === null) {
      this.updateStateQueue = state;
    } else {
      this.updateStateQueue = Object.assign(this.updateStateQueue, state);
    }

    if (this.updateStateRs === null) {
      this.updateStateRs = new AsyncSubject<boolean>();
    }

    const rs = this.updateStateRs;

    asyncScheduler.schedule(() => {
      this.updateStateEvent.next(true);
    });

    rs.subscribe(() => {
      asyncScheduler.schedule(() => {
        if (callback) {
          callback();
        }
      });
    });

    return rs;
  }

  private triggerMultiState(state: Partial<S>) {
    const keys: (keyof S)[] = Object.keys(state) as (keyof S)[];
    keys.forEach(key => {
      if (!this.stateWatcher.has(key)) {
        this.stateWatcher.set(key, new BehaviorSubject<any>(state[key]));
      }

      asyncScheduler.schedule(() => {
        const subj: BehaviorSubject<any> | undefined = this.stateWatcher.get(key);
        if (subj) {
          subj.next(state[key]);
        }
      });
    });
  }
}
