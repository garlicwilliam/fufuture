import { AsyncSubject, distinctUntilChanged, Observable, of, Subject, combineLatest } from 'rxjs';
import { WalletManager2, walletManager2 } from '../../wallet/wallet-manager2';
import { filter, map, switchMap, take, tap } from 'rxjs/operators';
import { WalletInterface } from '../../wallet/wallet-interface';
import { Network } from '../../constant/network';
import { Signer, providers } from 'ethers';
import { SldDecimal } from '../../util/decimal';
import { walletAgree } from './wallet-agree';
import { WcWalletInfo } from '../../services/wc-modal/wc-modal.service';
import { EthereumProviderName, Wallet } from '../../wallet/define';

export class WalletState {
  public readonly USER_ADDR: Observable<string>;
  public readonly NATIVE_BALANCE: Observable<SldDecimal>;
  public readonly NET_NATIVE_BALANCE: Observable<{ balance: SldDecimal; network: Network }>;
  public readonly IS_CONNECTED: Observable<boolean>;
  public readonly NETWORK: Observable<Network>;
  public readonly WALLET_TYPE: Observable<Wallet>;

  private readonly manager: WalletManager2 = walletManager2;
  private balanceTrigger: Subject<any> = new Subject();

  public refreshBalance() {
    this.balanceTrigger.next(true);
  }

  constructor() {
    this.USER_ADDR = this.watchUserAccount();
    this.IS_CONNECTED = this.watchIsConnected();
    this.NETWORK = this.watchNetwork();
    this.WALLET_TYPE = this.watchWalletType();
    this.NATIVE_BALANCE = this.watchBalance(this.balanceTrigger);
    this.NET_NATIVE_BALANCE = this.watchNetNativeBalance(this.balanceTrigger);
  }

  // the current connected wallet type
  watchWalletType(): Observable<Wallet> {
    return this.manager.watchConnectedWalletType().pipe(
      filter((type: Wallet | null) => type !== null),
      map(type => type as Wallet)
    );
  }

  // the wallet returned must be connected
  watchWalletInstance(): Observable<WalletInterface> {
    return this.manager.watchConnectedWalletInstance().pipe(
      filter(wallet => wallet !== null),
      map(wallet => wallet as WalletInterface)
    );
  }

  watchWalletName(): Observable<string> {
    return walletState.watchWalletInstance().pipe(
      switchMap((wallet: WalletInterface) => {
        return of(wallet.walletName());
      }),
      map(info => {
        return typeof info === 'string' ? info : info.name;
      })
    );
  }

  watchWeb3Provider(): Observable<providers.Web3Provider> {
    return this.watchWalletInstance().pipe(
      switchMap(wallet => {
        return wallet.watchProvider();
      })
    );
  }

  watchSigner(): Observable<Signer> {
    return this.watchWalletInstance().pipe(
      switchMap(wallet => {
        return wallet.watchSigner();
      })
    );
  }

  // user connected address
  watchUserAccount(): Observable<string> {
    return this.watchWalletInstance().pipe(
      switchMap((wallet: WalletInterface) => {
        return wallet.watchAccount();
      })
    );
  }

  getCurNetwork(): Network | null {
    const wallet: WalletInterface | null = this.manager.getCurWallet();
    if (wallet === null) {
      return null;
    }

    return wallet.getNetwork();
  }

  getCurAccount(): string | null {
    const wallet: WalletInterface | null = this.manager.getCurWallet();
    if (wallet === null) {
      return null;
    }

    return wallet.getAccount();
  }

  // user current selected network
  watchNetwork(): Observable<Network> {
    return this.watchWalletInstance().pipe(
      switchMap((wallet: WalletInterface) => {
        return wallet.watchNetwork();
      })
    );
  }

  watchBalance(refresh?: Observable<any>): Observable<SldDecimal> {
    return this.watchWalletInstance().pipe(
      switchMap((wallet: WalletInterface) => {
        return wallet.watchNativeBalance(refresh);
      }),
      map(res => res.balance)
    );
  }

  watchNetNativeBalance(refresh?: Observable<any>): Observable<{ balance: SldDecimal; network: Network }> {
    return this.watchWalletInstance().pipe(
      switchMap((wallet: WalletInterface) => {
        return wallet.watchNativeBalance(refresh);
      })
    );
  }

  // watch  if now has connected to any wallet
  watchIsConnected(): Observable<boolean> {
    const realConnected$: Observable<boolean> = this.manager.watchConnectedWalletInstance().pipe(
      switchMap((walletIns: WalletInterface | null) => {
        return walletIns === null ? of(false) : walletIns.wasConnected();
      })
    );
    const isWalletAgree$: Observable<boolean> = walletAgree.IS_AGREE;

    return combineLatest([isWalletAgree$, realConnected$]).pipe(
      map(([isAgree, isConnected]) => {
        return isConnected;
      }),
      distinctUntilChanged()
    );
  }

  // do connect the specified wallet.
  connectToWallet(wallet: Wallet, op?: { provider?: EthereumProviderName; walletInfo?: WcWalletInfo }): void {
    this.manager.doSelectWallet(wallet, op);
  }

  disconnectWallet(wallet: Wallet | null): Observable<boolean> {
    if (wallet) {
      return this.manager.disconnectWallet(wallet);
    }

    return of(false);
  }

  // switch to target network
  switchNetwork(network: Network): Observable<boolean> {
    const res = new AsyncSubject<boolean>();
    this.watchWalletInstance()
      .pipe(
        take(1),
        switchMap((wallet: WalletInterface) => {
          return wallet.switchNetwork(network);
        })
      )
      .subscribe(res);

    return res;
  }

  // sign the message
  signMessage(message: string): Observable<string> {
    return this.watchWalletInstance().pipe(
      take(1),
      switchMap((wallet: WalletInterface) => {
        return wallet.signMessage(message);
      }),
      map(res => res.signature)
    );
  }
}

export const walletState = new WalletState();
