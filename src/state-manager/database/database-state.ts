import { DatabaseState, DatabaseStateMerger } from '../interface';
import {
  BehaviorSubject,
  combineLatest,
  isObservable,
  merge,
  Observable,
  of,
  Subject,
  Subscription,
  switchMap,
} from 'rxjs';
import { debounceTime, filter, finalize, map, tap } from 'rxjs/operators';

export class DatabaseStateImp<T> implements DatabaseState<T> {
  private state: BehaviorSubject<T | null> = new BehaviorSubject<T | null>(null);
  private tickEvent: Subject<any> = new Subject<any>();
  private lastArgs: any[] | null = null;
  private subscription: Subscription | null = null;
  private isMock: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private mockArgs: Observable<any> | null = null;

  constructor(private merger: DatabaseStateMerger<T, any[]>, private depends: Observable<any>[]) {}

  tick(): void {
    if (this.isMock.getValue()) {
      this.isMock.next(true);
      return;
    }

    if (this.isWatching()) {
      this.tickEvent.next(true);
    }
  }

  watch(): Observable<T> {
    const realWatch$ = of(true).pipe(
      switchMap((isMock: boolean) => {
        if (!this.isWatching()) {
          this.doWatch();
        }
        return this.state;
      }),
      filter(state => state !== null),
      map(state => state as T),
      finalize(() => {
        if (!this.state.observed) {
          this.unwatch();
        }
      })
    );

    const toObservable = (res: T | Observable<T>): Observable<T> => {
      return (isObservable(res) ? (res as Observable<T>) : of(res as T)) as Observable<T>;
    };

    return this.isMock.pipe(
      switchMap(isMock => {
        if (isMock) {
          if (this.mockArgs) {
            return this.mockArgs.pipe(
              switchMap((args: any) => {
                return toObservable(this.merger.mock(args));
              })
            );
          } else {
            return toObservable(this.merger.mock());
          }
        } else {
          return realWatch$;
        }
      })
    );
  }

  pending(): Observable<boolean> {
    return this.merger.pending();
  }

  useMock(mockArg?: Observable<any>): this {
    this.isMock.next(true);
    if (mockArg) {
      this.mockArgs = mockArg;
    }
    return this;
  }

  // ==================================================================
  // Privates

  private isWatching(): boolean {
    return this.subscription !== null;
  }

  private doWatch() {
    this.unwatch();
    this.subscription = this.watchArgs()
      .pipe(
        switchMap((args: any[]) => {
          return this.merger.mergeWatch(...args);
        })
      )
      .subscribe((state: T) => {
        this.state.next(state);
      });
  }

  private unwatch() {
    if (this.subscription) {
      this.subscription.unsubscribe();
      this.subscription = null;
    }
  }

  private combineAllArgs(): Observable<any[]> {
    return this.depends.length === 0
      ? of([]).pipe(tap(args => (this.lastArgs = args)))
      : combineLatest(this.depends).pipe(tap(args => (this.lastArgs = args)));
  }

  private watchArgs(): Observable<any[]> {
    const tickArgs = this.tickEvent.pipe(
      map(() => this.lastArgs),
      filter(one => one !== null),
      map(one => one as any[])
    );
    return merge(this.combineAllArgs(), tickArgs).pipe(debounceTime(10));
  }
}
