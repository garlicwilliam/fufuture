import { ContractState, StateGetter, StateReference } from '../interface';
import {
  asyncScheduler,
  AsyncSubject,
  BehaviorSubject,
  combineLatest,
  EMPTY,
  isObservable,
  NEVER,
  Observable,
  of,
  Subscription,
} from 'rxjs';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  filter,
  finalize,
  map,
  startWith,
  switchMap,
  take,
  tap,
} from 'rxjs/operators';
import { ExpectedError } from '../state-util-type';
import { ArgIllegal } from '../state-types';
import * as _ from 'lodash';

export class ContractStateImp<T> implements ContractState<T> {
  private state: BehaviorSubject<T | null> = new BehaviorSubject<T | null>(null);
  private lastTimeStore: BehaviorSubject<Date | null> = new BehaviorSubject<Date | null>(null);
  private isPending: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private subscription: Subscription | null = null;

  private isDebug: boolean = false;

  private mockValue: T | null = null;
  private isMockA: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  private debugLabel: string | null = '';

  constructor(
    private depends: Observable<any>[],
    private getter: StateGetter<T>,
    private path: string,
    private disabled: boolean | Observable<boolean>,
    private defaultValue?: T
  ) {}

  public get(): Observable<T> {
    const whenDisable$: Observable<T> = this.empty();
    const whenNormal$: Observable<T> = this.isWatching() ? this.stateNotNull().pipe(take(1)) : this.doGet();
    const realGet$: Observable<T> = this.disableSwitch(whenDisable$, whenNormal$);

    return this.mockPrefix(realGet$);
  }

  public pending(): Observable<boolean> {
    return this.disableSwitch(of(false), this.isPending);
  }

  public lastTime(): Observable<Date | null> {
    return this.lastTimeStore.pipe();
  }

  public tick(): void {
    if (this.isMockA.getValue()) {
      return;
    }

    this.isDisable()
      .pipe(
        take(1),
        filter(disabled => !disabled && this.isWatching()),
        map(() => {
          return this.doGet();
        })
      )
      .subscribe();
  }

  public watch(): Observable<T> {
    const disable$ = this.empty();
    const watch$ = this.stateNotNull().pipe(
      startWith('_START_' as const),
      filter((a: '_START_' | T) => {
        const isStart: boolean = a === '_START_';

        if (isStart && !this.isWatching()) {
          if (this.isDebug) {
            console.info(this.debugLabel, 'new start watch ->');
          }
          this.doWatch();
        }

        return !isStart;
      }),
      map(a => a as T),
      finalize(() => {
        if (!this.state.observed) {
          this.unwatch();

          if (this.isDebug) {
            console.info(this.debugLabel, 'state watch end <-');
          }
        }
      })
    );

    const realWatch$ = this.disableSwitch(disable$, watch$);

    return this.mockPrefix(realWatch$);
  }

  public debug(label?: string): this {
    this.isDebug = true;
    this.debugLabel = label ? label : null;

    return this;
  }

  public mock(val: T | null): this {
    this.isMockA.next(true);
    this.mockValue = val;
    return this;
  }

  public setToDefault(): void {
    if (this.defaultValue !== undefined) {
      this.state.next(this.defaultValue);
    } else {
      this.state.next(null);
    }
  }

  // =======================================================================================
  private mockPrefix(realObserve$: Observable<T>): Observable<T> {
    return this.isMockA.pipe(
      switchMap((isMock: boolean) => {
        if (isMock) {
          return this.mockValue === null ? NEVER : of(this.mockValue);
        } else {
          return realObserve$;
        }
      })
    );
  }

  private isDisable(): Observable<boolean> {
    return isObservable(this.disabled) ? this.disabled.pipe(distinctUntilChanged()) : of(this.disabled);
  }

  private disableSwitch<V>(disabled$: Observable<V>, normal$: Observable<V>): Observable<V> {
    return this.isDisable().pipe(
      tap((isDisable: boolean) => {
        if (this.isDebug) {
          console.info(this.debugLabel, 'is disabled', isDisable);
        }
      }),
      switchMap((isDisable: boolean) => {
        return isDisable ? disabled$ : normal$;
      })
    );
  }

  private empty(): Observable<T> {
    return this.defaultValue !== undefined ? of(this.defaultValue) : EMPTY;
  }

  private isWatching() {
    return this.subscription !== null;
  }

  private doWatch() {
    this.subscription = this.combineAllArgs()
      .pipe(
        debounceTime(16),
        switchMap((args: any[]) => {
          if (this.isDebug) {
            console.info(this.debugLabel, 'State query args change', args);
          }
          return this.callGetter(args);
        })
      )
      .subscribe((rs: T) => {
        if (this.isDebug) {
          console.info(this.debugLabel, 'Update state value ...', rs);
        }
        this.state.next(rs);
      });
  }

  private callGetter(args: any[]): Observable<T> {
    if (args.indexOf(ArgIllegal) >= 0) {
      return this.empty();
    }

    this.isPending.next(true);

    if (this.isDebug) {
      console.info(this.debugLabel, 'Begin query state ....');
    }

    return this.getter(...args).pipe(
      take(1),
      tap((value: any) => {
        if (this.isDebug) {
          console.info(this.debugLabel, 'Query state value', value);
        }

        const now: Date = new Date();
        asyncScheduler.schedule(() => {
          this.lastTimeStore.next(now);
        });
      }),
      finalize(() => {
        this.isPending.next(false);

        if (this.isDebug) {
          console.info(this.debugLabel, 'End query state.');
        }
      }),
      catchError(err => {
        if (!(err instanceof ExpectedError)) {
          console.warn('Contract state getter error', this.path, args, err);
        }

        return EMPTY;
      })
    );
  }

  public unwatch() {
    if (this.subscription) {
      this.subscription.unsubscribe();
      this.subscription = null;
    }
  }

  private doGet(): Observable<any> {
    const rs = new AsyncSubject();
    this.combineAllArgs()
      .pipe(
        take(1),
        switchMap((args: any[]) => {
          return this.callGetter(args);
        }),
        tap((rs: T) => {
          if (this.isDebug) {
            console.info(this.debugLabel, 'Will update state value ...');
          }
          this.state.next(rs);
        })
      )
      .subscribe(rs);

    return rs;
  }

  private combineAllArgs(): Observable<any[]> {
    return combineLatest(this.depends);
  }

  private stateNotNull(): Observable<T> {
    return this.state.pipe(
      filter(s => {
        return s !== null;
      }),
      map(s => s as T)
    );
  }
}

export class ContractStateRef<T> implements ContractState<T> {
  private curRef: BehaviorSubject<ContractState<T> | null> = new BehaviorSubject<ContractState<T> | null>(null);
  private sub: Subscription | null = null;
  private ref: Observable<ContractState<T>>;

  private mockValue: T | null = null;
  private isMockA: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  private isDebug: boolean = false;
  private debugLabel: string = 'Debug: ';

  constructor(private reference: StateReference) {
    this.ref = reference.watchCurState();
  }

  public debug(label?: string): this {
    this.isDebug = true;
    this.debugLabel = label ? label : this.debugLabel;
    return this;
  }

  public mock(val: T | null): this {
    this.isMockA.next(true);
    this.mockValue = val;

    return this;
  }

  public get(): Observable<T> {
    const ref$ = this.isEnable() ? this.curRef.pipe(filter(Boolean)) : this.ref;
    const realGet$ = ref$.pipe(
      take(1),
      switchMap((state: ContractState<T>) => {
        return state.get();
      })
    );

    return this.mockPrefix(realGet$);
  }

  public pending(): Observable<boolean> {
    return this.curRef.pipe(
      switchMap((cur: ContractState<T> | null) => {
        return !cur ? of(false) : cur.pending();
      })
    );
  }

  public lastTime(): Observable<Date | null> {
    return this.curRef.pipe(
      switchMap((cur: ContractState<T> | null) => {
        return !cur ? of(null) : cur.lastTime();
      })
    );
  }

  public tick(): void {
    if (this.isMockA.getValue()) {
      return;
    }

    this.ref.pipe(take(1)).subscribe(state => {
      if (state) {
        state.tick();
      }
    });
  }

  public watch(): Observable<T> {
    const realWatch$ = this.curRef.pipe(
      startWith('_FIRST'),
      filter((ref: ContractState<T> | null | string) => {
        if (ref === '_FIRST') {
          this.enable();
          return false;
        } else {
          return ref !== null;
        }
      }),
      map(state => state as ContractState<T>),
      switchMap((ref: ContractState<T>) => {
        return ref.watch();
      }),
      finalize(() => {
        this.disable();
      })
    );

    return this.mockPrefix(realWatch$);
  }

  public setToDefault() {
    this.ref.pipe(take(1)).subscribe(state => {
      if (state) {
        state.setToDefault();
      }
    });
  }

  private mockPrefix(realObserve$: Observable<T>): Observable<T> {
    return this.isMockA.pipe(
      switchMap((isMock: boolean) => {
        if (isMock) {
          return this.mockValue === null ? NEVER : of(this.mockValue);
        } else {
          return realObserve$;
        }
      })
    );
  }

  private enable() {
    if (!this.isEnable()) {
      this.sub = this.ref.subscribe(v => this.curRef.next(v));
    }
  }

  private disable() {
    if (this.sub) {
      this.sub.unsubscribe();
      this.sub = null;
    }
  }

  private isEnable(): boolean {
    return this.sub !== null;
  }

  private print(...message: any[]) {
    if (this.isDebug) {
      console.log(this.debugLabel, ...message);
    }
  }
}

export class StateArgWrapper<A> {
  private argSubject: BehaviorSubject<A | null> = new BehaviorSubject<A | null>(null);
  private subs: Subscription[] = [];

  constructor(public readonly name: string) {}

  public isWrapper(): boolean {
    return true;
  }

  public setArg(arg: Observable<A>): this {
    const sub = arg.subscribe(a => {
      this.argSubject.next(a);
    });

    this.subs.push(sub);
    return this;
  }

  public destroy() {
    this.subs.forEach(one => one.unsubscribe());
    this.argSubject.complete();
  }

  public watch(): Observable<A> {
    return this.argSubject.pipe(
      filter(a => a !== null),
      map(one => one as A)
    );
  }
}

export class ContractStateGenerator<T, A extends string> {
  private wrappedArgs: { [n: string]: StateArgWrapper<any> } = {};
  private finalArgs: Observable<any>[] = [];

  constructor(depends: (Observable<any> | StateArgWrapper<any>)[], private getter: StateGetter<T>) {
    this.finalArgs = new Array(depends.length);
    depends.map((one, index: number) => {
      if (one['isWrapper'] && (one as StateArgWrapper<any>).isWrapper()) {
        const wrapped = one as StateArgWrapper<any>;
        this.wrappedArgs[wrapped.name] = wrapped;

        this.finalArgs[index] = wrapped.watch();
      } else {
        this.finalArgs[index] = one as Observable<any>;
      }
    });
  }

  public destroy() {
    Object.values(this.wrappedArgs).forEach(one => one.destroy());
  }

  public gen(args: { [n in A]: Observable<any> }, path?: string): ContractState<T> {
    try {
      Object.keys(this.wrappedArgs).map(name => {
        const arg = _.get(args, name);
        const wrp = _.get(this.wrappedArgs, name);

        if (!!arg && !!wrp) {
          wrp.setArg(arg);
        } else {
          console.warn(arg, wrp, path);
          throw Error('State Args not match.');
        }
      });

      return new ContractStateImp(this.finalArgs, this.getter, path || '', false);
    } catch (err) {
      console.warn('gen state error', err, args);
      throw err;
    }
  }
}

export function generatorCreator<T, A extends string>(params: {
  _depends: (Observable<any> | StateArgWrapper<any>)[];
  _getter: StateGetter<T>;
}) {
  return new ContractStateGenerator<T, A>(params._depends, params._getter);
}

export function genArgWrapper<A>(name: string): StateArgWrapper<A> {
  return new StateArgWrapper<A>(name);
}
