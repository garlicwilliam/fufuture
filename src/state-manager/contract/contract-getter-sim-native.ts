import { providers, BigNumber } from 'ethers';
import { Observable } from 'rxjs';
import { SldDecimal } from '../../util/decimal';
import { contractCall } from './contract-utils';
import { map } from 'rxjs/operators';

export function nativeBalanceGetter(
  provider: providers.Web3Provider,
  address: string,
  decimal: number
): Observable<SldDecimal> {
  return contractCall(provider.getBalance(address), { contract: 'NATIVE', method: `getBalance(${address})` }).pipe(
    map((balance: BigNumber) => {
      return SldDecimal.fromOrigin(balance, decimal);
    })
  );
}
