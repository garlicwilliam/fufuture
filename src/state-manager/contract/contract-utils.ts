import { Contract } from 'ethers';
import { from, Observable } from 'rxjs';
import { Network } from '../../constant/network';
import { Network as ContractNetwork } from '@ethersproject/networks/src.ts/types';
import { map, take, tap } from 'rxjs/operators';

export type ContractCallDebugParam = { contract: string; method: string };
export type ContractCallPartialFun<T> = (promise: Promise<T>, method: string) => Observable<T>;

export function contractNetworkGetter(contract: Contract): Observable<Network> {
  return from(contract.provider.getNetwork() as Promise<ContractNetwork>).pipe(
    map(net => net.chainId.toString() as Network),
    take(1)
  );
}

export function contractCall<T>(promise: Promise<T>, debug?: ContractCallDebugParam): Observable<T> {
  return debug
    ? from(promise).pipe(
        tap(() => {
          //console.log('CONTRACT CALL: ', debug.contract + '-' + debug.method);
        })
      )
    : from(promise);
}

export function genContractCallPartial<T>(contract: string): ContractCallPartialFun<T> {
  return function (promise: Promise<T>, method: string) {
    return contractCall(promise, { contract, method });
  };
}
