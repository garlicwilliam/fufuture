import { from, Observable } from 'rxjs';

export type ContractCallDebugParam = { contract: string; method: string };
export type ContractCallPartialFun<T> = (promise: Promise<T>, method: string) => Observable<T>;

export function contractCall<T>(promise: Promise<T>, debug?: ContractCallDebugParam): Observable<T> {
  return from(promise);
}

export function genContractCallPartial<T>(contract: string): ContractCallPartialFun<T> {
  return function (promise: Promise<T>, method: string) {
    return contractCall(promise, { contract, method });
  };
}
