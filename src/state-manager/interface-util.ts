import _ from 'lodash';
import { StateNull } from './state-types';

export function isWatchable(obj: any): boolean {
  return _.hasIn(obj, 'watch');
}

export function isDatabaseStateDefine(def: any): boolean {
  return _.has(def, '_merger') && _.has(def, '_depend');
}

export function isSN<T>(state: T | typeof StateNull): boolean {
  return state === StateNull;
}

export function snRep<T>(state: T | typeof StateNull): null | T {
  return isSN(state) ? null : (state as T);
}

export function snAssert<T>(state: T | typeof StateNull): T {
  console.assert(!isSN(state));
  return state as T;
}
