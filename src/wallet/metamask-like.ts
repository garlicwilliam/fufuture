import {
  asyncScheduler,
  BehaviorSubject,
  combineLatest,
  EMPTY,
  from,
  interval,
  Observable,
  of,
  Subject,
  switchMap,
  zip,
} from 'rxjs';
import { WalletInterface } from './wallet-interface';
import { Network } from '../constant/network';
import { SldDecimal } from '../util/decimal';
import { ETH_DECIMAL } from '../constant';
import * as ethers from 'ethers';
import { BigNumber, providers, Signer } from 'ethers';
import {
  ethAccounts,
  EthereumProviderStateManager,
  ethRequestAccounts,
  metamaskProviderManager,
  netVersion,
  walletAddChain,
  walletAddToken,
  walletSwitchChain,
} from './metamask-like-manager';
import { catchError, delay, expand, filter, map, startWith, take, tap } from 'rxjs/operators';
import { EthereumProviderInterface, EthereumProviderState, EthereumSpecifyMethod } from './metamask-like-types';
import { NetworkParams } from '../constant/network-conf';
import { NetworkParamConfig } from '../constant/network-type';
import { EthereumProviderName, SldWalletId, Wallet } from './define';
import { TokenErc20 } from '../state-manager/state-types';
import { WALLET_ICONS_MAP } from '../components/connect-wallet/wallet-icons';
import { message } from 'antd';
import { TESTING_ADDR } from './_testing';
import { networkParse } from '../util/network';

type AccountRetrievedType = string | null;
type AccountValType = AccountRetrievedType | undefined;
type NetworkRetrievedType = Network | null;
type NetworkValType = NetworkRetrievedType | undefined;
type ProviderStateType = EthereumProviderState | null;

export class MetamaskLike implements WalletInterface {
  public readonly walletType: Wallet = Wallet.Metamask;

  private curAccount: BehaviorSubject<AccountValType> = new BehaviorSubject<AccountValType>(undefined);
  private curNetwork: BehaviorSubject<NetworkValType> = new BehaviorSubject<NetworkValType>(undefined);

  private accountHandler = (accounts: string[]) => this.updateAccount(accounts);
  private networkHandler = (chainId: string | number): void => {
    const network: Network = networkParse(chainId);
    this.updateNetwork(network);
  };

  private manager: EthereumProviderStateManager = metamaskProviderManager;

  // -----------------
  private providerInstance: EthereumProviderInterface | null = null;

  private provider: BehaviorSubject<providers.Web3Provider | null> = new BehaviorSubject<providers.Web3Provider | null>(
    null
  );
  private providerName: BehaviorSubject<EthereumProviderName | null> = new BehaviorSubject<EthereumProviderName | null>(
    null
  );

  constructor() {
    this.watchProviderAndConnect().subscribe();
  }

  // -------------------------------------------------------------------------------------------------------------------

  private newWeb3Provider(injected: any, network?: Network) {
    return new ethers.providers.Web3Provider(injected, 'any');
  }

  private watchProviderAndConnect(): Observable<any> {
    return this.manager.watchCurrentSelected().pipe(
      tap(state => {
        if (state) {
          this.provider.next(this.newWeb3Provider(state.instance));
          this.providerName.next(state.name);
        }
      }),
      switchMap((state: ProviderStateType) => {
        const account$: Observable<string[]> = state
          ? state.specifyMethod === EthereumSpecifyMethod.Auto
            ? ethAccounts(state.instance)
            : ethRequestAccounts(state.instance)
          : of([]);

        return zip(account$, of(state));
      }),
      switchMap(([accounts, state]: [string[], ProviderStateType]) => {
        this.updateAccount(accounts);

        const network$: Observable<NetworkValType> = state
          ? netVersion(state.instance).pipe(map((id: string) => networkParse(id)))
          : of(null);

        return zip(network$, of(state));
      }),
      tap(([network, state]: [NetworkValType, ProviderStateType]): void => {
        this.updateNetwork(network, state?.instance);

        if (state) {
          this.listenProvider(state.instance);
        } else {
          this.clearProvider();
        }
      })
    );
  }

  private updateAccount(accounts: string[]): void {
    const account: string | null = accounts.length > 0 ? accounts[0] : null;
    if (this.curAccount.getValue() === account) {
      return;
    }

    asyncScheduler.schedule(() => {
      const useAccount: string | null = TESTING_ADDR !== null ? (TESTING_ADDR as string) : account;
      this.curAccount.next(useAccount);
    });
  }

  private updateNetwork(network: NetworkValType, injectedProvider?: EthereumProviderInterface): void {
    if (this.curNetwork.getValue() === network) {
      return;
    }

    interval(200)
      .pipe(
        switchMap((n: number) => {
          const provider: providers.Web3Provider | null = this.provider.getValue();

          if (!provider) {
            return of(network);
          }

          const chainId$: Observable<Network> = from(provider.getNetwork()).pipe(
            map(net => net.chainId),
            map(chainId => networkParse(chainId))
          );

          return chainId$.pipe(
            map((chainId: Network) => {
              return n >= 4 || chainId === network ? chainId : null;
            })
          );
        }),
        filter(Boolean),
        take(1),
        tap(chainId => {
          this.curNetwork.next(chainId);
        })
      )
      .subscribe();
  }

  private account(): Observable<AccountRetrievedType> {
    return this.curAccount.pipe(
      filter((account: AccountValType): boolean => account !== undefined),
      map((account: AccountValType) => account as string | null),
      switchMap((account: AccountRetrievedType): Observable<AccountRetrievedType> => {
        if (account === null) {
          return this.manager.hasInit().pipe(map(() => account));
        } else {
          return of(account);
        }
      })
    );
  }

  private network(): Observable<Network | null> {
    return this.curNetwork.pipe(
      filter((network: NetworkValType): boolean => network !== undefined),
      map((network: NetworkValType) => network as Network | null),
      switchMap((network: NetworkRetrievedType): Observable<NetworkRetrievedType> => {
        if (network === null) {
          return this.manager.hasInit().pipe(map(() => network));
        } else {
          return of(network);
        }
      })
    );
  }

  private clearProvider(): void {
    if (this.providerInstance) {
      this.providerInstance.removeListener('accountsChanged', this.accountHandler);
      this.providerInstance.removeListener('chainChanged', this.networkHandler);
    }

    this.providerInstance = null;
  }

  private listenProvider(provider: EthereumProviderInterface): void {
    this.clearProvider();

    provider.on('accountsChanged', this.accountHandler);
    provider.on('chainChanged', this.networkHandler);

    this.providerInstance = provider;
  }

  // only for coin base
  public disconnect(): Observable<boolean> {
    const curProvider: EthereumProviderState | null = this.manager.getCurrentSelected();

    if (curProvider && curProvider.name === EthereumProviderName.Coinbase && !!curProvider.instance.close) {
      curProvider.instance.close();
    } else {
      this.updateAccount([]);
    }

    return of(true);
  }

  public doConnect(): Observable<boolean> {
    return of(false);
  }

  public getAccount(): string | null {
    return this.curAccount.getValue() || null;
  }

  public getNativeBalance(): Observable<SldDecimal> {
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

  public getNetwork(): Network | null {
    return this.curNetwork.getValue() || null;
  }

  public switchNetwork(id: Network): Observable<boolean> {
    if (this.curNetwork.getValue() === id) {
      return of(false);
    }

    const provider: EthereumProviderState | null = this.manager.getCurrentSelected();

    if (!provider) {
      return of(false);
    }

    const param: NetworkParamConfig = NetworkParams[id];

    const switchNetworkObs$: Observable<any> = walletSwitchChain(provider.instance, param).pipe(
      catchError(err => {
        if (err.code === 4001) {
          message.warn(err.message);
          return of(false);
        }

        return walletAddChain(provider.instance, param);
      })
    );

    const waitForNetwork = (target: Network): Observable<Network> => {
      const callNetwork$: Observable<Network> = netVersion(provider.instance).pipe(map(netStr => networkParse(netStr)));
      let tryTimes = 0;

      return callNetwork$.pipe(
        expand((network: Network) => {
          tryTimes += 1;

          if (network === target || tryTimes > 5) {
            return EMPTY;
          }

          return callNetwork$.pipe(delay(500));
        })
      );
    };

    return switchNetworkObs$.pipe(
      switchMap(() => {
        return waitForNetwork(id);
      }),
      map((cur: Network) => {
        this.updateNetwork(cur);
        return cur === id;
      }),
      catchError(err => {
        if (err.code === 4001) {
          message.warn(err.message);
        } else {
          console.warn('error', err);
          message.warn('Switch network failed, please switch the network in your wallet.');
        }

        return of(false);
      })
    );
  }

  public addErc20Token(token: TokenErc20, icon?: string): Observable<boolean> {
    const provider: EthereumProviderState | null = this.manager.getCurrentSelected();

    if (!provider) {
      return of(false);
    }

    return walletAddToken(provider.instance, token, icon).pipe(
      map(rs => {
        return !!rs;
      })
    );
  }

  public wasConnected(): Observable<boolean> {
    return this.account().pipe(map((account: string | null): boolean => account !== null));
  }

  public watchAccount(): Observable<string> {
    return this.account().pipe(filter(Boolean));
  }

  public watchNativeBalance(trigger?: Subject<any>): Observable<{ balance: SldDecimal; network: Network }> {
    type CombineRs = [ethers.providers.Provider, string, Network, any];

    const refreshTrigger: Observable<any> = trigger ? trigger.pipe(startWith(true)) : of(true);

    return combineLatest([this.watchProvider(), this.watchAccount(), this.watchNetwork(), refreshTrigger]).pipe(
      filter(([provider, address, network]) => {
        return !!provider && !!address && !!network;
      }),
      switchMap(([provider, address, network, refresh]: CombineRs) => {
        const balance$: Observable<BigNumber> = from(provider.getBalance(address) as Promise<BigNumber>);
        const network$: Observable<Network> = from(provider.getNetwork() as Promise<ethers.providers.Network>).pipe(
          map(net => networkParse(net.chainId))
        );

        return zip(balance$, network$, of(network)).pipe(take(1));
      }),
      map(([balance, network, targetNetwork]: [BigNumber, Network, Network]) => {
        if (targetNetwork !== network) {
          return {
            balance: SldDecimal.ZERO,
            network: targetNetwork,
          };
        }

        const decimals: number = NetworkParams[network]?.nativeCurrency?.decimals || 18;
        return {
          balance: SldDecimal.fromOrigin(balance, decimals),
          network,
        };
      })
    );
  }

  public watchNetwork(): Observable<Network> {
    return this.network().pipe(filter(Boolean));
  }

  public watchProvider(): Observable<providers.Web3Provider> {
    return this.watchNetwork().pipe(
      switchMap((network: Network) => {
        return this.provider.pipe(
          filter(Boolean)
          // filter(one => {
          //   return one.network.chainId === Number(network);
          // })
        );
      })
    );
  }

  public walletId(): Observable<SldWalletId> {
    return this.providerName.pipe(
      filter(Boolean),
      map((name: EthereumProviderName) => {
        return {
          wallet: Wallet.Metamask,
          id: name,
        };
      })
    );
  }

  public walletIcon(): Observable<string> {
    return this.providerName.pipe(
      filter(Boolean),
      map(name => WALLET_ICONS_MAP[name])
    );
  }

  public watchSigner(): Observable<Signer> {
    return this.watchProvider().pipe(
      map((provider: providers.Web3Provider) => {
        return provider.getSigner();
      })
    );
  }

  public walletName(): string {
    const curProviderState: ProviderStateType = this.manager.getCurrentSelected();
    return curProviderState ? curProviderState.name : EthereumProviderName.MetaMask;
  }

  public signMessage(message: string): Observable<{ signature: string }> {
    return this.watchSigner().pipe(
      take(1),
      switchMap((signer: Signer) => {
        return from(signer.signMessage(message));
      }),
      map(signature => {
        return { signature };
      })
    );
  }
}
