import { Observable } from 'rxjs';
import { Network } from '../constant/network';

export type StateGetter<T> = (...args: any[]) => Observable<T>;

export type Watchable = { watch: () => Observable<any> };

// ---------------------------------------------------------------------------------------------------------------------
// Contract State

export interface StateReference {
  getRef(): Observable<any>;

  setRoot(root: ContractStateTree<any>): this;

  watchCurState(): Observable<ContractState<any>>;
}

export type ContractStateDefine<T> = {
  _depend: (Observable<any> | StateReference | Watchable)[];
  _getter: StateGetter<T>;
  _disable?: boolean | Observable<boolean>;
  _defaultValue?: T;
  _isRef?: boolean;
};

export type ContractStateType<T extends ContractStateDefine<any>> = ReturnType<T['_getter']> extends Observable<infer D>
  ? D
  : never;

export type ContractArgsType<T extends ContractStateDefine<any>> = T extends { _args: Observable<infer A>[] }
  ? Observable<A>[]
  : [];

export type ContractStateDefineTree = { [p: string]: ContractStateDefine<any> | ContractStateDefineTree };

export interface ContractState<T> {
  watch(): Observable<T>;

  get(): Observable<T>;

  pending(): Observable<boolean>;

  lastTime(): Observable<Date | null>;

  tick(): void;

  debug(label?: string): this;

  mock(val: T | null): this;

  setToDefault(): void;
}

export type ContractStateOfDefine<D extends ContractStateDefine<any>> = ContractState<ContractStateType<D>>;

export type ContractStateTree<D extends ContractStateDefineTree> = {
  [p in keyof D]: D[p] extends ContractStateDefine<any>
    ? ContractStateOfDefine<D[p]>
    : D[p] extends ContractStateDefineTree
    ? ContractStateTree<D[p]>
    : never;
};

// ------------------------------------------------------------------------------------------------
// Page State

export type PageStateDefine<T> = { _default: T; _serializer?: (s: T) => string };
export type PageStateDefineTree = { [p: string]: PageStateDefine<any> | PageStateDefineTree };
export type PageStateTree<D extends PageStateDefineTree> = {
  [p in keyof D]: D[p] extends PageStateDefine<infer S>
    ? PageState<S>
    : D[p] extends PageStateDefineTree
    ? PageStateTree<D[p]>
    : never;
};

export interface PageState<T> {
  set(state: T, compare?: boolean): void;

  setToDefault(): void;

  get(): T;

  default(): T;

  watch(): Observable<T>;
}

// ----------------------------------------------------------------------------
// Cache State
export type CacheSerializer<T> = (state: T | null) => string | null;
export type CacheParser<T> = (stateStr: string | null) => T | null;
export type CachePatcher<T> = (oldState: T | null, newState: T | null) => T | null;

export interface CacheStateDefine<T> {
  _key: string;
  _parser: CacheParser<T>;
  _serializer: CacheSerializer<T>;
  _patcher?: CachePatcher<T>;
  _isGlobal?: boolean;
}

export type CacheStateDefineTree = { [p: string]: CacheStateDefine<any> | CacheStateDefineTree };
export type CacheStateTree<D extends CacheStateDefineTree> = {
  [p in keyof D]: D[p] extends CacheStateDefine<infer S>
    ? CacheState<S>
    : D[p] extends CacheStateDefineTree
    ? CacheStateTree<D[p]>
    : never;
};

export interface CacheState<T> {
  getKey(): string;

  set(state: T | null): void;

  setWithAddress(state: T | null, address: string, network: Network): void;

  patch(state: T | null): void;

  patchWithAddress(state: T | null, address: string, network: Network): void;

  get(): Observable<T | null>;

  getWithDef(defVal: T): Observable<T>;

  watch(): Observable<T | null>;
}

// ----------------------------------------------------------------------------
// Database State

export interface DatabaseState<T> {
  watch(): Observable<T>;

  tick(): void;

  pending(): Observable<boolean>;

  useMock(mockArg?: Observable<any>): this;
}

export interface DatabaseStateMerger<T, A extends readonly any[]> {
  mergeWatch(...args: A): Observable<T>;

  pending(): Observable<boolean>;

  mock(args?: A): T | Observable<T>;
}

export interface DatabaseStateRef {
  setRoot(root: DatabaseStateTree<any>): this;

  getRef(): Observable<DatabaseState<any> | null>;

  getPath(): string;
}

export interface DatabaseStateDefine<T> {
  _depend: (Observable<any> | Watchable | DatabaseStateRef)[];
  _merger: DatabaseStateMerger<T, any[]>;
}

export type DatabaseStateDefineTree = { [p: string]: DatabaseStateDefine<any> | DatabaseStateDefineTree };
export type DatabaseStateTree<D extends DatabaseStateDefineTree> = {
  [p in keyof D]: D[p] extends DatabaseStateDefine<infer S>
    ? DatabaseState<S>
    : D[p] extends DatabaseStateDefineTree
    ? DatabaseStateTree<D[p]>
    : never;
};
