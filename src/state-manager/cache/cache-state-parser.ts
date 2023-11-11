import { CacheState, CacheStateDefine, CacheStateDefineTree, CacheStateTree } from '../interface';
import { CacheStateImp } from './cache-state';
import _ from 'lodash';
import { CACHE_STATE } from './cache-state-def';

function isCacheStateDefine(def: any): boolean {
  return _.has(def, '_key') && _.has(def, '_serializer') && _.has(def, '_parser');
}

export function parseCacheStateDefineTree<D extends CacheStateDefineTree>(defines: D): CacheStateTree<D> {
  const res = {} as any;

  const keys = Object.keys(defines) as (keyof D)[];
  keys.forEach(key => {
    const def: CacheStateDefine<any> | CacheStateDefineTree = defines[key];
    if (isCacheStateDefine(def)) {
      res[key] = convertCacheState(def as CacheStateDefine<any>);
    } else {
      res[key] = parseCacheStateDefineTree(def as CacheStateDefineTree);
    }
  });

  return res as CacheStateTree<D>;
}

export function convertCacheState<T>(stateDefine: CacheStateDefine<T>): CacheState<T> {
  return new CacheStateImp(
    stateDefine._key,
    stateDefine._serializer,
    stateDefine._parser,
    stateDefine._patcher,
    stateDefine._isGlobal === true
  );
}

export const C = parseCacheStateDefineTree(CACHE_STATE);
