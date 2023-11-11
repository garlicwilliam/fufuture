import { AsyncSubject, distinctUntilChanged, Observable, of, Subject, combineLatest } from 'rxjs';
import { EthereumProviderName, Wallet } from '../../constant';
import { walletManager2 } from '../../wallet/wallet-manager2';
import { filter, map, switchMap, take } from 'rxjs/operators';
import { WalletInterface } from '../../wallet/wallet-interface';
import { Network } from '../../constant/network';
import { Signer, providers } from 'ethers';
import { SldDecimal } from '../../util/decimal';
import { walletAgree } from './wallet-agree';

export class WalletState {
  public readonly USER_ADDR: Observable<string>;
  public readonly NATIVE_BALANCE: Observable<SldDecimal>;
  public readonly IS_CONNECTED: Observable<boolean>;
  public readonly NETWORK: Observable<Network>;
  public readonly WALLET_TYPE: Observable<Wallet>;

  private readonly manager = walletManager2;
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
        return isAgree && isConnected;
      }),
      distinctUntilChanged()
    );
  }

  // do connect the specified wallet.
  connectToWallet(wallet: Wallet, provider?: EthereumProviderName): void {
    this.manager.doSelectWallet(wallet, provider);
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
}

export const walletState = new WalletState();
