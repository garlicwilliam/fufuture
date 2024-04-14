import { WalletInterface } from './wallet-interface';
import {
  asyncScheduler,
  AsyncSubject,
  BehaviorSubject,
  combineLatest,
  EMPTY,
  from,
  interval,
  Observable,
  of,
  retry,
  switchMap,
  zip,
} from 'rxjs';
import { WcWalletInfo } from '../services/wc-modal/wc-modal.service';
import { SldDecimal } from '../util/decimal';
import { Network } from '../constant/network';
import { BigNumber, ethers, providers, Signer } from 'ethers';
import { Wallet } from './define';
import { SafeAppProvider } from '@safe-global/safe-apps-provider';
import SafeAppsSDK, { SafeAppInfo, SafeInfo, SignMessageResponse } from '@safe-global/safe-apps-sdk';
import { catchError, delay, expand, filter, map, startWith, take, tap } from 'rxjs/operators';
import { ETH_DECIMAL } from '../constant';
import { NetworkParamConfig } from '../constant/network-type';
import * as _ from 'lodash';
import { NetworkParams } from '../constant/network-conf';
import { OffChainSignMessageResponse, SendTransactionsResponse } from '@safe-global/safe-apps-sdk/src/types/sdk';

function networkParse(chainId: string | number): Network {
  const network: Network =
    typeof chainId === 'number'
      ? (chainId.toString() as Network)
      : chainId.startsWith('0x')
      ? (parseInt(chainId, 16).toString() as Network)
      : (parseInt(chainId, 10).toString() as Network);

  return network;
}

function ethAccounts(ethereum: SafeAppProvider): Observable<string[]> {
  return from(ethereum.request({ method: 'eth_accounts' }) as Promise<string[]>).pipe(
    retry(1),
    catchError(err => {
      console.warn('error', err);
      return of([]);
    })
  );
}

function netVersion(ethereum: SafeAppProvider): Observable<string> {
  return from(ethereum.request({ method: 'net_version' }) as Promise<string>).pipe(map(net => net.toString()));
}

function ethRequestAccounts(ethereum: SafeAppProvider): Observable<string[]> {
  return from(ethereum.request({ method: 'eth_requestAccounts' }) as Promise<string[]>).pipe(
    catchError(err => {
      return of([]);
    })
  );
}

export function switchNetwork(provider: SafeAppProvider, chainParam: NetworkParamConfig): Observable<boolean> {
  const request = provider.request;

  if (!request) {
    return of(false);
  }

  const switch1$: Observable<any> = from(
    request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: chainParam.chainId }],
    })
  );

  const add$: Observable<any> = from(
    request({
      method: 'wallet_addEthereumChain',
      params: [chainParam],
    })
  );

  const switch$: Observable<any> = switch1$.pipe(
    catchError(err => {
      if (err.code === 4902) {
        return add$;
      }

      return of(false);
    })
  );

  return switch$;
}

export class SafeWallet implements WalletInterface {
  walletType: Wallet = Wallet.SafeWallet;

  private appSdk: SafeAppsSDK;
  private safeInfo?: SafeInfo;
  private provider$ = new BehaviorSubject<SafeAppProvider | null>(null);
  private account$: BehaviorSubject<string | null | undefined> = new BehaviorSubject<string | null | undefined>(
    undefined
  );
  private network$: BehaviorSubject<Network | null | undefined> = new BehaviorSubject<Network | null | undefined>(
    undefined
  );

  private handlerAccounts = (accounts: string[]) => {
    console.log('accounts', accounts);
    const account = accounts[0] || null;
    this.account$.next(account);
  };

  private handlerChainChanged = (chainId: string | number) => {
    const network: Network = networkParse(chainId);

    console.log(network);
    if (this.network$.getValue() !== network) {
      asyncScheduler.schedule(() => {
        this.network$.next(network);
      });
    }
  };

  public constructor() {
    this.appSdk = new SafeAppsSDK({ debug: true });
    const safeInfo$ = from(this.appSdk.safe.getInfo());

    safeInfo$.subscribe(info => {
      this.safeInfo = info;
      console.log('info', info);
      const provider = new SafeAppProvider(info, this.appSdk);
      this.provider$.next(provider);
    });

    this.watch();
  }

  private watch() {
    this.provider$
      .pipe(
        filter(Boolean),
        tap((provider: SafeAppProvider) => {
          console.log('provider', provider);
          provider.on('chainChanged', this.handlerChainChanged);
          provider.on('accountsChanged', this.handlerAccounts);
        }),
        tap((provider: SafeAppProvider) => {
          ethAccounts(provider).subscribe(this.handlerAccounts);
          netVersion(provider).subscribe((chainId: string) => {
            this.handlerChainChanged(chainId);
          });
        })
      )
      .subscribe();
  }

  disconnect(): Observable<boolean> {
    const provider = this.provider$.getValue();

    if (provider) {
      const rs = new AsyncSubject<boolean>();
      from(provider.disconnect())
        .pipe(map(() => true))
        .subscribe(rs);

      return rs;
    } else {
      return of(false);
    }
  }

  doConnect(): Observable<boolean> {
    const provider = this.provider$.getValue();
    if (provider) {
      return from(provider.connect()).pipe(map(() => true));
    } else {
      return of(false);
    }
  }

  getAccount(): string | null {
    return this.account$.getValue() || null;
  }

  getNativeBalance(): Observable<SldDecimal> {
    const account: string | null = this.getAccount();

    if (!account) {
      return of(SldDecimal.ZERO);
    }

    return this.watchProvider().pipe(
      switchMap((provider: providers.Web3Provider) => {
        return provider.getBalance(account);
      }),
      map((balance: BigNumber) => {
        return SldDecimal.fromOrigin(balance, ETH_DECIMAL);
      }),
      take(1)
    );
  }

  getNetwork(): Network | null {
    return this.network$.getValue() || null;
  }

  switchNetwork(id: Network): Observable<boolean> {
    if (this.network$.getValue() === id) {
      return of(false);
    }

    const provider: SafeAppProvider | null = this.provider$.getValue();
    if (!provider) {
      return of(false);
    }

    const param: NetworkParamConfig = NetworkParams[id];

    return switchNetwork(provider, param);
  }

  walletName(): string | { name: string; url: string } {
    return { name: 'SafeWallet', url: 'https://app.safe.global/' };
  }

  wasConnected(): Observable<boolean> {
    return this.account$.pipe(map(account => !!account));
  }

  watchAccount(): Observable<string> {
    return this.account$.pipe(filter(Boolean));
  }

  watchNativeBalance(trigger?: Observable<any>): Observable<SldDecimal> {
    type CombineRs = [ethers.providers.Provider, string, Network, any];
    const refreshTrigger: Observable<any> = trigger ? trigger.pipe(startWith(true)) : of(null);

    return combineLatest([this.watchProvider(), this.watchAccount(), this.watchNetwork(), refreshTrigger]).pipe(
      switchMap(([provider, address, network, refresh]: CombineRs) => {
        return provider.getBalance(address);
      }),
      map((balance: BigNumber) => {
        return SldDecimal.fromOrigin(balance, ETH_DECIMAL);
      })
    );
  }

  watchNetwork(): Observable<Network> {
    return this.network$.pipe(filter(Boolean));
  }

  watchProvider(): Observable<ethers.providers.Web3Provider> {
    return this.provider$.pipe(
      filter(Boolean),
      map((provider: SafeAppProvider) => {
        return new ethers.providers.Web3Provider(provider);
      })
    );
  }

  watchSigner(): Observable<Signer> {
    return this.watchProvider().pipe(map(provider => provider.getSigner()));
  }

  signMessage(message: string): Observable<{ signature: string }> {
    return from(this.appSdk.eth.setSafeSettings([{ offChainSigning: true }])).pipe(
      switchMap(offChain => {
        return from(this.appSdk.txs.signMessage(message)).pipe(
          switchMap((signRes: SignMessageResponse) => {
            return of(false).pipe(
              expand((signed: boolean) => {
                if (signed) {
                  return EMPTY;
                }

                return from(this.appSdk.safe.isMessageSigned(message)).pipe(delay(1000));
              }),
              filter(Boolean),
              take(1),
              map(() => {
                return { signature: '0x', safeTxHash: signRes['safeTxHash'] };
              })
            );
          })
        );
      })
    );
  }
}
