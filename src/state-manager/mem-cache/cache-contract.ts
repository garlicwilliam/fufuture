import { BehaviorSubject, Observable } from 'rxjs';
import { catchError, filter, finalize, map, startWith, take, tap } from 'rxjs/operators';

export class ContractCacheObject {
  constructor(private _date: Date, private _cache: any, private _period: number) {}

  public get date(): Date {
    return this._date;
  }

  public get cache(): any {
    return this._cache;
  }

  public isTimeout(): boolean {
    return this._date.getTime() + this._period < new Date().getTime();
  }
}

export const CACHE_FOREVER = 24 * 3600 * 365 * 1000;
export const CACHE_10_MIN = 10 * 60 * 1000;
export const CACHE_2_MIN = 2 * 60 * 1000;
export const CACHE_1_MIN = 1 * 60 * 1000;
export const CACHE_10_SEC = 10 * 1000;
export const CACHE_30_SEC = 30 * 1000;
export const CACHE_3_SEC = 2 * 1000;
export const CACHE_1_HOUR = 3600 * 1000;

const PENDING = Symbol('pending');
type Pending = typeof PENDING;

function isPending(val: any): boolean {
  return val === PENDING;
}

export class CacheService {
  private readonly cachePeriod = 1500;
  private cacheObjMaps = new Map<string, BehaviorSubject<ContractCacheObject | null | Pending>>();

  public getCache(key: string): ContractCacheObject | null {
    const cacheObj: ContractCacheObject | null | Pending = this.getCacheSubject(key).getValue();

    if (cacheObj === null || isPending(cacheObj) || (cacheObj as ContractCacheObject).isTimeout()) {
      return null;
    }

    return cacheObj as ContractCacheObject;
  }

  public setCache(key: string, value: any, period?: number) {
    const cache = new ContractCacheObject(new Date(), value, period ? period : this.cachePeriod);
    this.getCacheSubject(key).next(cache);
  }

  // -----------------------------------------------------------------------------------

  public cacheObj(key: string): Observable<any> | null {
    const val = this.getCacheSubject(key).getValue();

    if (val === null || (!isPending(val) && (val as ContractCacheObject).isTimeout())) {
      return null;
    }

    return this.getCacheSubject(key).pipe(
      filter(v => v !== null && !isPending(v)),
      map(v => v as ContractCacheObject),
      take(1),
      map(cache => {
        return cache.cache;
      })
    );
  }

  public setPending(key: string): void {
    if (isPending(this.getCacheSubject(key).getValue())) {
      return;
    }

    this.getCacheSubject(key).next(PENDING);
  }

  public completePending(key: string): void {
    const val = this.getCacheSubject(key).getValue();

    if (isPending(val)) {
      this.getCacheSubject(key).next(null);
    }
  }

  public nextCache(key: string, value: any, period?: number) {
    const cache = new ContractCacheObject(new Date(), value, period ? period : this.cachePeriod);
    this.getCacheSubject(key).next(cache);
  }

  public tryUseCache<T>(fetch$: Observable<T>, cacheKey: string, period?: number, debugParam: any = {}): Observable<T> {
    const cacheSub: Observable<any> | null = this.cacheObj(cacheKey);

    if (cacheSub) {
      return cacheSub;
    }

    return fetch$.pipe(
      startWith(PENDING),
      tap(() => {
        this.setPending(cacheKey);
      }),
      filter((val: T | Pending) => !isPending(val)),
      catchError(err => {
        console.warn('error in fetch', cacheKey, debugParam, err);
        throw err;
      }),
      tap((val: any) => {
        this.nextCache(cacheKey, val, period);
      }),
      finalize(() => {
        this.completePending(cacheKey);
      })
    );
  }

  // -----------------------------------------------------------------------------------

  private getCacheSubject(key: string): BehaviorSubject<ContractCacheObject | null | Pending> {
    if (!this.cacheObjMaps.has(key)) {
      this.cacheObjMaps.set(key, new BehaviorSubject<ContractCacheObject | null | Pending>(null));
    }

    return this.cacheObjMaps.get(key) as BehaviorSubject<ContractCacheObject | null | Pending>;
  }
}

export const cacheService = new CacheService();
