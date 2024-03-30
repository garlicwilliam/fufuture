import { WalletInterface } from './wallet-interface';
import {ETH_DECIMAL, Wallet} from '../constant';
import * as ethers from 'ethers';
import { BigNumber, providers, Signer } from 'ethers';
import { Network } from '../constant/network';
import {
  asyncScheduler,
  AsyncSubject,
  BehaviorSubject,
  combineLatest,
  from,
  NEVER,
  Observable,
  of,
  switchMap,
  zip,
} from 'rxjs';
import { catchError, filter, map, startWith, take, tap } from 'rxjs/operators';
import { SldDecimal } from '../util/decimal';
import { WcNetNamespace } from '../constant/walletconnect';
import { wcOps } from '../constant/walletconnect.conf';
import { UniversalProvider, UniversalProviderOpts } from '@walletconnect/universal-provider';
import IUniversalProvider from '@walletconnect/universal-provider';
import { SessionTypes } from '@walletconnect/types';
import { WalletConnectModal } from '@walletconnect/modal';
import { networkHex } from '../constant/network-util';
import { wcModalService, WcWalletInfo } from '../services/wc-modal/wc-modal.service';

function getAccountsFromSession(session: SessionTypes.Struct, chain: string): string[] {
  const namespace: SessionTypes.BaseNamespace | undefined = session.namespaces[WcNetNamespace.eip155];

  if (!namespace) {
    return [];
  }

  const accounts: string[] = namespace.accounts.map((account: string) => {
    const parts: string[] = account.split(':');
    return parts.pop() as string;
  });

  return Array.from(new Set(accounts));
}

export class WalletConnect implements WalletInterface {
  readonly walletType: Wallet = Wallet.WalletConnect;

  private walletConnectProviderHolder = new BehaviorSubject<IUniversalProvider | null>(null);
  private web3ProviderHolder = new BehaviorSubject<ethers.providers.Web3Provider | null>(null);

  private curAccount: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);
  private curNetwork: BehaviorSubject<Network | null> = new BehaviorSubject<Network | null>(null);

  private modal: WalletConnectModal = new WalletConnectModal({
    projectId: this.createProjectId(),
    themeVariables: { '--wcm-z-index': '2000' },
  });

  private customWalletInfo: WcWalletInfo | null = null;

  constructor() {
    this.initialize();
    this.wrapperProvider();

    this.watchEvents().subscribe();
  }

  private initialize() {
    return from(UniversalProvider.init(this.createInitOpts()))
      .pipe(
        tap((provider: IUniversalProvider) => {
          this.walletConnectProviderHolder.next(provider);
        })
      )
      .subscribe();
  }

  private createInitOpts(): UniversalProviderOpts {
    return wcOps.initProviderOps;
  }

  private createProjectId(): string {
    return wcOps.initProviderOps.projectId || '';
  }

  private wrapperProvider() {
    return this.walletConnectProviderHolder
      .pipe(
        filter(Boolean),
        filter(wcProvider => wcProvider.isWalletConnect),
        map((wcProvider: IUniversalProvider) => {
          return this.newWeb3Provider(wcProvider);
        }),
        tap(provider => {
          this.web3ProviderHolder.next(provider);
        })
      )
      .subscribe();
  }

  private requestAccounts(provider: IUniversalProvider): Observable<{ accounts: string[]; chain: string }> {
    const opts = wcOps.connectOps;
    const defChain: string = wcOps.defaultChain;

    let accounts$: Observable<string[]>;
    if (provider.session) {
      provider.setDefaultChain(defChain);

      accounts$ = from(provider.request({ method: 'eth_requestAccounts' }) as Promise<string[]>);
    } else {
      this.modal.subscribeModal((state: { open: boolean }) => {
        if (!state.open && !provider.session) {
          provider.abortPairingAttempt();
        }
      });

      wcModalService.subscribeState().subscribe(state => {
        if (!state && !provider.session) {
          provider.abortPairingAttempt();
        }
      });

      accounts$ = from(provider.connect(opts)).pipe(
        switchMap((session: SessionTypes.Struct | undefined) => {
          if (session) {
            provider.setDefaultChain(defChain);
            this.modal.closeModal();
            wcModalService.hide();

            return of(getAccountsFromSession(session, defChain));
          } else {
            return NEVER;
          }
        })
      );
    }

    return accounts$.pipe(map(accounts => ({ accounts, chain: defChain })));
  }

  doConnect(wallet?: WcWalletInfo): Observable<boolean> {
    if (wallet) {
      this.customWalletInfo = wallet;
    } else {
      this.customWalletInfo = null;
    }

    return this.walletConnectProviderHolder.pipe(
      filter(Boolean),
      take(1),
      switchMap((provider: IUniversalProvider) => {
        const accounts$ = this.requestAccounts(provider);
        return zip([accounts$, of(provider)]);
      }),
      tap(([{ accounts, chain }, provider]) => {
        this.walletConnectProviderHolder.next(provider);
      }),
      map(([{ accounts, chain }, provider]) => {
        // connected
        asyncScheduler.schedule(() => {
          this.updateNetwork(chain);
          this.updateAccount(accounts);
        });

        return accounts.length > 0;
      })
    );
  }

  disconnect(): Observable<boolean> {
    const provider: IUniversalProvider | null = this.walletConnectProviderHolder.getValue();

    if (provider) {
      const res = new AsyncSubject<boolean>();

      from(provider.disconnect())
        .pipe(
          map(() => true),
          catchError(err => of(false)),
          tap((isDone: boolean) => {
            if (isDone) {
              this.updateAccount([]);
            }

            res.next(isDone);
            res.complete();
          })
        )
        .subscribe();

      return res;
    }

    return of(false);
  }

  getAccount(): string | null {
    return this.curAccount.getValue();
  }

  getNetwork(): Network | null {
    return this.curNetwork.getValue();
  }

  watchProvider(): Observable<providers.Web3Provider> {
    return this.web3ProviderHolder.pipe(
      filter(p => p !== null),
      map(p => p as providers.Web3Provider)
    );
  }

  watchSigner(): Observable<Signer> {
    return this.watchProvider().pipe(
      switchMap((provider: providers.Web3Provider) => {
        return this.watchNetwork().pipe(
          switchMap((net: Network) => {
            return this.watchAccount().pipe(
              map((account: string) => {
                return provider.getSigner(account);
              })
            );
          })
        );
      })
    );
  }

  switchNetwork(id: Network): Observable<boolean> {
    const provider: IUniversalProvider | null = this.walletConnectProviderHolder.getValue();
    if (!provider) {
      return of(false);
    }

    return from(provider.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: networkHex(id) }] })).pipe(
      tap(() => {
        provider.setDefaultChain(networkHex(id));
        this.walletConnectProviderHolder.next(provider);
      }),
      map(() => {
        return true;
      }),
      catchError(err => {
        console.warn('error', err);
        return of(false);
      })
    );
  }

  wasConnected(): Observable<boolean> {
    return this.curAccount.pipe(map(accounts => !!accounts));
  }

  watchAccount(): Observable<string> {
    return this.curAccount.pipe(filter(Boolean));
  }

  watchNetwork(): Observable<Network> {
    return this.curNetwork.pipe(filter(Boolean));
  }

  walletName(): string {
    const provider = this.walletConnectProviderHolder.getValue();
    if (provider && provider.isWalletConnect) {
      const session = provider.session;
      if (session) {
        return session.peer.metadata.name;
      }
    }

    return '';
  }

  public getNativeBalance(): Observable<SldDecimal> {
    const address: string | null = this.getAccount();

    if (!address) {
      return of(SldDecimal.ZERO);
    }

    return this.watchProvider().pipe(
      switchMap((provider: providers.Web3Provider) => {
        return provider.getBalance(address);
      }),
      map((balance: BigNumber) => {
        return SldDecimal.fromOrigin(balance, ETH_DECIMAL);
      }),
      take(1)
    );
  }

  public watchNativeBalance(trigger?: Observable<any>): Observable<SldDecimal> {
    const refreshTrigger: Observable<any> = trigger ? trigger.pipe(startWith(true)) : of(null);
    return combineLatest([this.watchProvider(), this.watchAccount(), this.watchNetwork(), refreshTrigger]).pipe(
      switchMap(([provider, address, network, refresh]) => {
        return provider.getBalance(address);
      }),
      map((balance: BigNumber) => {
        return SldDecimal.fromOrigin(balance, ETH_DECIMAL);
      })
    );
  }

  // ===============================================================================

  private newWeb3Provider(wcProvider: IUniversalProvider): ethers.providers.Web3Provider {
    return new ethers.providers.Web3Provider(wcProvider);
  }

  private updateAccount(accounts: string[]) {
    if (accounts.length > 0) {
      this.curAccount.next(accounts[0]);
    } else {
      this.curAccount.next(null);
    }
  }

  private updateNetwork(chainId: string | number | null) {
    if (chainId === null) {
      this.curNetwork.next(null);
      return;
    }

    const network: Network =
      typeof chainId === 'number'
        ? (chainId.toString() as Network)
        : chainId.startsWith('0x')
        ? (parseInt(chainId, 16).toString() as Network)
        : chainId.includes(':')
        ? (chainId.split(':')[1] as Network)
        : (parseInt(chainId, 10).toString() as Network);

    this.curNetwork.next(network);
  }

  private watchEvents(): Observable<any> {
    return this.walletConnectProviderHolder.pipe(
      filter(Boolean),
      tap((provider: IUniversalProvider) => {
        provider.on('disconnect', (error: IUniversalProvider) => {
          this.updateAccount([]);
        });
        provider.on('accountsChanged', (accounts: string[]) => {
          this.updateAccount(accounts);
        });
        provider.on('chainChanged', (chainId: string) => {
          this.updateNetwork(chainId);
        });
        provider.on('session_event', event => {
          console.log('session event', event);
        });
        provider.on('session_update', event => {
          console.log('session update', event);
        });
        provider.on('session_delete', event => {
          this.updateNetwork(null);
          this.updateAccount([]);
        });
        provider.on('display_uri', uri => {
          if (this.customWalletInfo) {
            wcModalService.hide();
            wcModalService.show({ ...this.customWalletInfo, uri });
          } else {
            this.modal.closeModal();
            this.modal.openModal({ uri });
          }
        });
        provider.on('default_chain_changed', (chainId: string) => {
          this.updateNetwork(chainId);
        });
      })
    );
  }
}
