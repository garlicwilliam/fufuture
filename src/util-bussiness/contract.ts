import { BigNumber, Contract } from 'ethers';
import { from, isObservable, Observable, of, switchMap, zip } from 'rxjs';
import { SldDecimal } from '../util/decimal';
import { catchError, map, take } from 'rxjs/operators';
import { MAX_UINT_256 } from '../constant';

export function approveErc20Token(
  erc20TokenContract: Contract | Observable<Contract>,
  targetAddress: string | Observable<string>,
  maxAmount?: SldDecimal
): Observable<boolean> {
  const erc20$: Observable<Contract> = isObservable(erc20TokenContract)
    ? erc20TokenContract.pipe(take(1))
    : of(erc20TokenContract);
  const addr$: Observable<string> = isObservable(targetAddress) ? targetAddress.pipe(take(1)) : of(targetAddress);
  const max: BigNumber = maxAmount ? maxAmount.toOrigin() : MAX_UINT_256;

  return zip(erc20$, addr$).pipe(
    switchMap(([erc20, addr]) => {
      return from(erc20.approve(addr, max));
    }),
    switchMap((approve: any) => {
      return from(approve.wait());
    }),
    map(() => {
      return true;
    }),
    catchError(err => {
      return of(false);
    })
  );
}
