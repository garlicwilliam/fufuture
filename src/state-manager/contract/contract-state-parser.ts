import {
  ContractStateDefine,
  ContractStateDefineTree,
  ContractStateOfDefine,
  ContractStateTree,
  StateReference,
  Watchable,
} from '../interface';
import { ContractStateImp, ContractStateRef } from './contract-state';
import _ from 'lodash';
import { isObservable, Observable } from 'rxjs';
import { CONTRACT_STATE } from './contract-state-def';

function isStateDefine(define: any) {
  return _.has(define, '_getter') && _.has(define, '_depend');
}

function isWatchable(depend: any) {
  return _.hasIn(depend, 'watch');
}

export function parseContractStateDefine<D extends ContractStateDefineTree>(
  defineTree: D,
  parent: string = 'S',
  root?: ContractStateTree<D>
): ContractStateTree<D> {
  const res: any = {};
  if (!root) {
    root = res;
  }

  const keys = Object.keys(defineTree) as (keyof D)[];
  keys.forEach(k => {
    const def: ContractStateDefine<any> | ContractStateDefineTree = defineTree[k];
    const selfPath = parent + '.' + k.toString();

    if (isStateDefine(def)) {
      const define = def as ContractStateDefine<any>;
      res[k] = convertContractState(define, selfPath, root as ContractStateTree<D>) as ContractStateOfDefine<
        typeof define
      >;
    } else {
      res[k] = parseContractStateDefine(def as ContractStateDefineTree, selfPath, root);
    }
  });

  return res as ContractStateTree<D>;
}

export function convertContractState<T extends ContractStateDefine<any>>(
  define: T,
  selfPath: string,
  root: ContractStateTree<any>
): ContractStateOfDefine<T> {
  const dependArgs: Observable<any>[] = define._depend.map(one => {
    if (isObservable(one)) {
      return one;
    } else if (isWatchable(one)) {
      return (one as Watchable).watch();
    } else {
      return (one as StateReference).setRoot(root).getRef();
    }
  });
  const disabled: boolean | Observable<boolean> = isObservable(define._disable)
    ? define._disable
    : define._disable === true;
  const defaultVal = define._defaultValue;
  const isRef: boolean = define._isRef === true;

  return isRef
    ? new ContractStateRef(define._depend[0] as StateReference)
    : new ContractStateImp(dependArgs, define._getter, selfPath, disabled, defaultVal);
}

export const S = parseContractStateDefine(CONTRACT_STATE);
