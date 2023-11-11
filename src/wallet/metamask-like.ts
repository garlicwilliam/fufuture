import { asyncScheduler, BehaviorSubject, combineLatest, Observable, of, switchMap, zip } from 'rxjs';
import { WalletInterface } from './wallet-interface';
import { Network } from '../constant/network';
import { SldDecimal } from '../util/decimal';
import { EthereumProviderName, Wallet } from '../constant';
import * as ethers from 'ethers';
import { BigNumber, providers, Signer } from 'ethers';
import {
  ethAccounts,
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

export class MetamaskLike implements WalletInterface {
  public readonly walletType: Wallet = Wallet.Metamask;

  private curAccount = new BehaviorSubject<string | null | undefined>(undefined);
  private curNetwork = new BehaviorSubject<Network | null | undefined>(undefined);

  private accountHandler = (accounts: string[]) => this.updateAccount(accounts);
  private networkHandler = (chainId: string | number) => {
    const network: Network =
      typeof chainId === 'number'
        ? (chainId.toString() as Network)
        : chainId.startsWith('0x')
        ? (parseInt(chainId, 16).toString() as Network)
        : (parseInt(chainId, 10).toString() as Network);

    this.updateNetwork(network);
  };

  private manager = metamaskProviderManager;
  private provider: EthereumProviderInterface | null = null;

  constructor() {
    this.watchProviderAndConnect().subscribe();
  }

  private watchProviderAndConnect() {
    return this.manager.watchCurrentSelected().pipe(
      switchMap((state: EthereumProviderState | null) => {
        const account$ = state
          ? state.specifyMethod === EthereumSpecifyMethod.Auto
            ? ethAccounts(state.instance)
            : ethRequestAccounts(state.instance)
          : of([]);

        return zip(account$, of(state));
      }),
      switchMap(([accounts, state]: [string[], EthereumProviderState | null]) => {
        this.updateAccount(accounts);

        const network$ = state ? netVersion(state.instance).pipe(map(id => id.toString() as Network)) : of(null);

        return zip(network$, of(state));
      }),
      tap(([network, state]) => {
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

  private updateNetwork(network: Network | null): void {
    if (this.curNetwork.getValue() === network) {
      return;
    }

    asyncScheduler.schedule(() => {
      this.curNetwork.next(network);
    });
  }

  private account(): Observable<string | null> {
    return this.curAccount.pipe(
      filter(account => account !== undefined),
      map(account => account as string | null),
      switchMap((account: string | null) => {
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
      filter(network => network !== undefined),
      map(network => network as Network | null),
      switchMap((network: Network | null) => {
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
      map((network: string) => {
        this.updateNetwork(network as Network);

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
    const refreshTrigger: Observable<any> = trigger ? trigger.pipe(startWith(true)) : of(null);

    return combineLatest([this.watchProvider(), this.watchAccount(), this.watchNetwork(), refreshTrigger]).pipe(
      switchMap(([provider, address, network, refresh]) => {
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
    return this.watchProvider().pipe(map(provider => provider.getSigner()));
  }

  public walletName(): string {
    const curProviderState = this.manager.getCurrentSelected();
    return curProviderState ? curProviderState.name : EthereumProviderName.MetaMask;
  }
}
