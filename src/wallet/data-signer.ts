import { switchMap, take } from 'rxjs/operators';
import { WalletInterface } from './wallet-interface';
import { providers } from 'ethers';
import { from, Observable, throwError } from 'rxjs';
import { walletManager2 } from './wallet-manager2';

export class WalletDataSigner {
  public signData(fromAddress: string, msg: string): Observable<string> {
    return walletManager2.watchConnectedWalletInstance().pipe(
      switchMap((wallet: WalletInterface | null) => {
        if (wallet === null) {
          return throwError(() => {
            return new Error('no wallet to sign data.');
          });
        }

        return wallet.watchProvider().pipe(
          take(1),
          switchMap((provider: providers.Web3Provider) => {
            return from(provider.getSigner().signMessage(msg));
          })
        );
      }),
      take(1)
    );
  }
}

export const dataSigner: WalletDataSigner = new WalletDataSigner();
