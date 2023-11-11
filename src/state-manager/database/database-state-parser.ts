import {
  DatabaseState,
  DatabaseStateDefine,
  DatabaseStateDefineTree,
  DatabaseStateRef,
  DatabaseStateTree,
  Watchable,
} from '../interface';
import { DatabaseStateImp } from './database-state';
import { isObservable, Observable, switchMap } from 'rxjs';
import { DATABASE_STATE } from './database-state-def';
import { isDatabaseStateDefine, isWatchable } from '../interface-util';
import { filter } from 'rxjs/operators';

export function parseDatabaseStateDefine<D extends DatabaseStateDefineTree>(
  defines: D,
  root?: DatabaseStateTree<DatabaseStateDefineTree>
): DatabaseStateTree<D> {
  const res = {} as DatabaseStateTree<any>;
  if (!root) {
    root = res;
  }

  const keys = Object.keys(defines) as (keyof D)[];
  keys.forEach(key => {
    const def: DatabaseStateDefine<any> | DatabaseStateDefineTree = defines[key];
    if (isDatabaseStateDefine(def)) {
      res[key] = convertDatabaseState(def as DatabaseStateDefine<any>, root as DatabaseStateTree<any>);
    } else {
      res[key] = parseDatabaseStateDefine(def as DatabaseStateDefineTree, root);
    }
  });

  return res as DatabaseStateTree<D>;
}

export function convertDatabaseState<T>(
  define: DatabaseStateDefine<T>,
  root: DatabaseStateTree<any>
): DatabaseState<T> {
  const obs: Observable<any>[] = define._depend.map(one => {
    if (isObservable(one)) {
      return one;
    } else if (isWatchable(one)) {
      return (one as Watchable).watch();
    } else {
      const ref = one as DatabaseStateRef;
      const state$ = ref.setRoot(root).getRef();

      return state$.pipe(
        filter(Boolean),
        switchMap((state: DatabaseState<any>) => {
          return state.watch();
        })
      );
    }
  });

  return new DatabaseStateImp(define._merger, obs);
}

export const D = parseDatabaseStateDefine(DATABASE_STATE);
