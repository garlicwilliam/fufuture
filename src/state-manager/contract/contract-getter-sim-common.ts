import { from, Observable } from 'rxjs';
import { SldDecimal } from '../../util/decimal';
import { BigNumber, Contract } from 'ethers';
import { map } from 'rxjs/operators';
import { STONE_DECIMAL } from '../../constant';

export function stonePriceGetter(contract: Contract): Observable<SldDecimal> {
  return from(contract.currentSharePrice() as Promise<BigNumber>).pipe(
    map(price => {
      return SldDecimal.fromOrigin(price, STONE_DECIMAL);
    })
  );
}
