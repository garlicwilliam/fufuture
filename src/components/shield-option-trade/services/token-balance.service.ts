import { TokenErc20 } from '../../../state-manager/state-types';
import { Observable, of, switchMap, combineLatest, Subject } from 'rxjs';
import { SldDecimal } from '../../../util/decimal';
import { walletState } from '../../../state-manager/wallet/wallet-state';
import { Contract } from 'ethers';
import { erc20UserBalanceGetter } from '../../../state-manager/contract/contract-getter-sim-erc20';
import { startWith } from 'rxjs/operators';
import { createErc20Contract } from '../../../state-manager/const/contract-creator';

export class TokenBalanceService {
  private updateTrigger = new Subject<any>();

  public watchTokenBalance(token?: TokenErc20): Observable<SldDecimal> {
    if (!token) {
      return of(SldDecimal.ZERO);
    }

    return combineLatest([walletState.NETWORK, walletState.USER_ADDR, this.updateTrigger.pipe(startWith(0))]).pipe(
      switchMap(([network, userAddress, __]) => {
        if (network !== token.network) {
          return of(SldDecimal.ZERO);
        }

        return createErc20Contract(token.address).pipe(
          switchMap((erc20Contract: Contract) => {
            return erc20UserBalanceGetter(erc20Contract, userAddress, token.decimal);
          })
        );
      })
    );
  }

  public refresh() {
    this.updateTrigger.next(true);
  }
}

export const tokenBalanceService = new TokenBalanceService();
