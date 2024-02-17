import { asyncScheduler, BehaviorSubject, combineLatest, Observable, of, switchMap, zip } from 'rxjs';
import { WalletInterface } from './wallet-interface';
import { Network } from '../constant/network';
import { SldDecimal } from '../util/decimal';
import { EthereumProviderName, Wallet } from '../constant';
import * as ethers from 'ethers';
import { BigNumber, providers, Signer } from 'ethers';
import {
  ethAccounts,
  EthereumProviderStateManager,
  ethRequestAccounts,
  metamaskProviderManager,
  netVersion,
  walletAddChain,
  walletSwitchChain,
} from './metamask-like-manager';
import { catchError, filter, map, startWith, take, tap } from 'rxjs/operators';
import { EthereumProviderInterface, EthereumProviderState, EthereumSpecifyMethod } from './metamask-like-types';
import { ETH_WEI } from '../util/ethers';
import { isEthNetworkGroup } from '../constant/network-util';
import { NetworkParams } from '../constant/network-conf';
import { NetworkParamConfig } from '../constant/network-type';

type AccountRetrievedType = string | null;
type AccountValType = AccountRetrievedType | undefined;
type NetworkRetrievedType = Network | null;
type NetworkValType = NetworkRetrievedType | undefined;

type ProviderStateType = EthereumProviderState | null;

function networkParse(chainId: string | number): Network {
  const network: Network =
    typeof chainId === 'number'
      ? (chainId.toString() as Network)
      : chainId.startsWith('0x')
      ? (parseInt(chainId, 16).toString() as Network)
      : (parseInt(chainId, 10).toString() as Network);

  return network;
}

export class MetamaskLike implements WalletInterface {
  public readonly walletType: Wallet = Wallet.Metamask;

  private curAccount: BehaviorSubject<AccountValType> = new BehaviorSubject<AccountValType>(undefined);
  private curNetwork: BehaviorSubject<NetworkValType> = new BehaviorSubject<NetworkValType>(undefined);

  private accountHandler = (accounts: string[]) => this.updateAccount(accounts);
  private networkHandler = (chainId: string | number) => {
    const network: Network = networkParse(chainId);
    this.updateNetwork(network);
  };

  private manager: EthereumProviderStateManager = metamaskProviderManager;
  private provider: EthereumProviderInterface | null = null;

  constructor() {
    this.watchProviderAndConnect().subscribe();
  }

  private watchProviderAndConnect(): Observable<any> {
    return this.manager.watchCurrentSelected().pipe(
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
      tap(([network, state]: [NetworkValType, ProviderStateType]) => {
        this.updateNetwork(network);

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
      this.curAccount.next(account);
    });
  }

  private updateNetwork(network: NetworkValType): void {
    if (this.curNetwork.getValue() === network) {
      return;
    }

    asyncScheduler.schedule(() => {
      this.curNetwork.next(network);
    });
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

  private clearProvider() {
    if (this.provider) {
      this.provider.removeListener('accountsChanged', this.accountHandler);
      this.provider.removeListener('chainChanged', this.networkHandler);
    }

    this.provider = null;
  }

  private listenProvider(provider: EthereumProviderInterface) {
    this.clearProvider();

    provider.on('accountsChanged', this.accountHandler);
    provider.on('chainChanged', this.networkHandler);

    this.provider = provider;
  }

  // only for coin base
  public disconnect(): Observable<boolean> {
    const curProvider: EthereumProviderState | null = this.manager.getCurrentSelected();

    if (curProvider && curProvider.name === EthereumProviderName.Coinbase && !!curProvider.instance.close) {
      curProvider.instance.close();
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
        return SldDecimal.fromOrigin(balance, ETH_WEI);
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

    const unsupportedAddChain: EthereumProviderName[] = [EthereumProviderName.ImToken];
    const param: NetworkParamConfig = NetworkParams[id];

    const obs$ =
      !isEthNetworkGroup(id) && unsupportedAddChain.indexOf(provider.name) < 0
        ? walletAddChain(provider.instance, param)
        : walletSwitchChain(provider.instance, param);

    return obs$.pipe(
      switchMap(() => {
        return netVersion(provider.instance);
      }),
      map((networkStr: string) => {
        this.updateNetwork(networkParse(networkStr));

        return true;
      }),
      catchError(err => {
        console.warn('error', err);
        return of(false);
      })
    );
  }

  public wasConnected(): Observable<boolean> {
    return this.account().pipe(map((account: string | null) => account !== null));
  }

  public watchAccount(): Observable<string> {
    return this.account().pipe(filter(Boolean));
  }

  public watchNativeBalance(trigger?: Observable<any>): Observable<SldDecimal> {
    type CombineRs = [ethers.providers.Provider, string, Network, any];
    const refreshTrigger: Observable<any> = trigger ? trigger.pipe(startWith(true)) : of(null);

    return combineLatest([this.watchProvider(), this.watchAccount(), this.watchNetwork(), refreshTrigger]).pipe(
      switchMap(([provider, address, network, refresh]: CombineRs) => {
        return provider.getBalance(address);
      }),
      map((balance: BigNumber) => {
        return SldDecimal.fromOrigin(balance, ETH_WEI);
      })
    );
  }

  public watchNetwork(): Observable<Network> {
    return this.network().pipe(filter(Boolean));
  }

  public watchProvider(): Observable<providers.Web3Provider> {
    return this.manager.watchCurrentSelected().pipe(
      filter(Boolean),
      map((state: EthereumProviderState) => {
        return new ethers.providers.Web3Provider(state.instance, 'any');
      })
    );
  }

  public watchSigner(): Observable<Signer> {
    return this.watchProvider().pipe(map((provider: ethers.providers.Web3Provider) => provider.getSigner()));
  }

  public walletName(): string {
    const curProviderState: ProviderStateType = this.manager.getCurrentSelected();
    return curProviderState ? curProviderState.name : EthereumProviderName.MetaMask;
  }
}
