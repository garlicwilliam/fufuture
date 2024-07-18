import { WalletInterface } from './wallet-interface';
import { MetamaskLike } from './metamask-like';
import { WalletConnect } from './wallet-connect';
import { BehaviorSubject, combineLatest, Observable, of, switchMap } from 'rxjs';
import { filter, map, tap } from 'rxjs/operators';
import { metamaskProviderManager } from './metamask-like-manager';
import { WcWalletInfo } from '../services/wc-modal/wc-modal.service';
import { EthereumProviderName, Wallet } from './define';
import { SafeWallet } from './safe-wallet';

type WalletStateInfo = {
  metamask: boolean;
  walletConnect: boolean;
  safeWallet: boolean;
};

type WalletOption = Wallet | null | undefined;

export class WalletManager2 {
  private readonly cacheKey = '_user_select_wallet';
  private readonly cachedUserSelect = (): Wallet | null => localStorage.getItem(this.cacheKey) as Wallet | null;

  private metamask: WalletInterface = new MetamaskLike();
  private walletConnect: WalletInterface = new WalletConnect();
  private safeWallet: WalletInterface = new SafeWallet();

  private userSelected: BehaviorSubject<Wallet | null> = new BehaviorSubject<Wallet | null>(this.cachedUserSelect());
  private realConnectedWallet: BehaviorSubject<WalletOption> = new BehaviorSubject<WalletOption>(undefined);

  constructor() {
    this.storeCachedUserSelected().subscribe();
    this.watchWalletState().subscribe();
  }

  private storeCachedUserSelected(): Observable<any> {
    return this.userSelected.pipe(
      filter(Boolean),
      tap((wallet: Wallet) => {
        localStorage.setItem(this.cacheKey, wallet);
      })
    );
  }

  private watchWalletState(): Observable<Wallet | null> {
    return combineLatest([
      this.metamask.wasConnected(),
      this.walletConnect.wasConnected(),
      this.safeWallet.wasConnected(),
    ]).pipe(
      switchMap(([metamask, walletConnect, safeWallet]) => {
        const state: WalletStateInfo = {
          metamask,
          walletConnect,
          safeWallet,
        };

        return combineLatest([this.userSelected, of(state)]);
      }),
      map(([userSelected, walletState]) => {
        if (walletState.safeWallet) {
          return Wallet.SafeWallet;
        }

        let isMetamask = walletState.metamask && userSelected === Wallet.Metamask;
        let isWalletConnect = walletState.walletConnect && userSelected === Wallet.WalletConnect;

        if (!isMetamask && !isWalletConnect) {
          isMetamask = walletState.metamask;
          isWalletConnect = walletState.walletConnect;
        }

        return isMetamask ? Wallet.Metamask : isWalletConnect ? Wallet.WalletConnect : null;
      }),
      tap((wallet: Wallet | null) => {
        this.realConnectedWallet.next(wallet);
      })
    );
  }

  private typeToInstance(wallet: WalletOption): WalletInterface | null {
    switch (wallet) {
      case Wallet.Metamask: {
        return this.metamask;
      }
      case Wallet.WalletConnect: {
        return this.walletConnect;
      }
      case Wallet.SafeWallet: {
        return this.safeWallet;
      }
      default: {
        return null;
      }
    }
  }

  // -------------------------------------------------------------------------------------------------------------------

  public destroy() {
    this.userSelected.complete();
    this.realConnectedWallet.complete();
  }

  public getCurWallet(): WalletInterface | null {
    const walletType: WalletOption = this.realConnectedWallet.getValue();

    return this.typeToInstance(walletType);
  }

  public watchConnectedWalletType(): Observable<Wallet | null> {
    return this.realConnectedWallet.pipe(
      filter(one => one !== undefined),
      map(w => w as Wallet | null)
    );
  }

  public watchConnectedWalletInstance(): Observable<WalletInterface | null> {
    return this.watchConnectedWalletType().pipe(
      map((wallet: Wallet | null) => {
        return this.typeToInstance(wallet);
      })
    );
  }

  public doSelectWallet(wallet: Wallet, op?: { provider?: EthereumProviderName; walletInfo?: WcWalletInfo }): void {
    if (wallet === Wallet.Metamask && !op?.provider) {
      return;
    }

    if (wallet === Wallet.Metamask) {
      const isSpecified: boolean = metamaskProviderManager.setUserSelected(op!.provider!);
      if (isSpecified) {
        this.userSelected.next(Wallet.Metamask);
      }
    } else if (wallet === Wallet.SafeWallet) {
      this.safeWallet.doConnect().subscribe();
    } else {
      // Wallet Connect
      this.walletConnect.doConnect(op?.walletInfo).subscribe((done: boolean) => {
        if (done) {
          this.userSelected.next(Wallet.WalletConnect);
        }
      });
    }
  }

  public disconnectWallet(wallet: Wallet): Observable<boolean> {
    if (wallet === Wallet.WalletConnect) {
      return this.walletConnect.disconnect();
    } else if (wallet === Wallet.SafeWallet) {
      return this.safeWallet.disconnect();
    } else {
      return this.metamask.disconnect();
    }
  }
}

export const walletManager2 = new WalletManager2();
