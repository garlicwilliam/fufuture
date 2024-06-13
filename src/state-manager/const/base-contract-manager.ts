import { combineLatest, EMPTY, from, NEVER, Observable, of, retry } from 'rxjs';
import { Network } from '../../constant/network';
import { walletState } from '../wallet/wallet-state';
import { catchError, distinctUntilChanged, filter, map, switchMap } from 'rxjs/operators';
import { Contract, ethers, providers, Signer } from 'ethers';
import { createChainContract } from './contract-creator';
import { isValidAddress } from '../../util/address';
import { getRpcProvider } from '../../constant/chain-rpc';
import { WalletInterface } from '../../wallet/wallet-interface';
import { networkParse } from '../../util/network';

export type ContractAddress = { address: string; network: Network };

export class ContractCache {
  private readonly cache: Map<string, Contract> = new Map<string, Contract>();

  public genKey(address: string, network: Network, providerSrc: 'wallet' | 'rpc'): string {
    return `${address}-${network}-${providerSrc}`;
  }

  public setContract(key: string, contract: Contract): void {
    this.cache.set(key, contract);
  }

  public getContract(key: string): Contract | null {
    return this.cache.get(key) || null;
  }

  public tryGetContract(
    address: string,
    network: Network,
    providerSrc: 'wallet' | 'rpc',
    create: () => Contract
  ): Contract {
    const key = this.genKey(address, network, providerSrc);
    const cache: Contract | null = this.getContract(key);

    if (cache) {
      return cache;
    } else {
      const contract = create();
      this.setContract(key, contract);
      return contract;
    }
  }
}

export abstract class BaseContractManager<F extends string> {
  abstract getContractAddress(network: Network, contractName: F): string | undefined;

  abstract getContractAbi(contractName: F): any[];

  abstract getConfigContractNames(): readonly F[];

  private readonly contractCache: ContractCache = new ContractCache();

  public readonly CONTRACTS = this.createContractObservableMap();
  public readonly CONTRACTS_ADDRESS = this.createContractAddressesMap();

  public getReadonlyContract(network: Network, name: F): Observable<Contract> {
    const address: string | undefined = this.getContractAddress(network, name);
    if (!address) {
      return EMPTY;
    }

    const abi: any[] = this.getContractAbi(name);
    const provider: providers.JsonRpcProvider | undefined = getRpcProvider(network);
    if (!provider) {
      return EMPTY;
    }

    const creator = () => createChainContract(address, abi, provider, network);
    const contract: Contract = this.contractCache.tryGetContract(address, network, 'rpc', creator);

    return of(contract);
  }

  public createReadonlyContract(network: Network, address: string, abi: any[]): Contract {
    const provider: providers.JsonRpcProvider = getRpcProvider(network)!;

    const creator = () => createChainContract(address, abi, provider, network);

    return this.contractCache.tryGetContract(address, network, 'rpc', creator);
  }

  // -------------------------------------------------------------------------------------------------------------------

  protected createContractObservableMap(): { [k in F]: Observable<Contract> } {
    const res = {} as { [k in F]: Observable<Contract> };

    this.getConfigContractNames().map((name: F) => {
      res[name] = this.watchContract(name);
    });

    return res;
  }

  protected createContractAddressesMap(): { [k in F]: Observable<string> } {
    const res = {} as { [k in F]: Observable<string> };

    this.getConfigContractNames().map((name: F) => {
      res[name] = this.watchContractAddress(name).pipe(
        filter(Boolean),
        map(info => info.address)
      );
    });

    return res;
  }

  protected watchContract(contractName: F): Observable<Contract> {
    const address$: Observable<ContractAddress | null> = this.watchContractAddress(contractName);
    const provider$: Observable<ethers.Signer> = this.watchProvider();
    const abi$: Observable<any[]> = this.watchContractAbi(contractName);

    return combineLatest([address$, provider$, abi$]).pipe(
      switchMap(([address, signer, abi]) => {
        if (!address?.address || !signer || !abi) {
          return NEVER;
        }

        const isMatchNetwork$: Observable<boolean> = from(signer.getChainId() as Promise<number>).pipe(
          map(chainId => networkParse(chainId)),
          map((network: Network) => {
            return network === address.network;
          })
        );

        return isMatchNetwork$.pipe(
          map((isMatch: boolean) => {
            if (!isMatch) {
              console.error('Network Not Match');
              throw new Error('network not match');
            }

            return createChainContract(address.address, abi, signer, address.network);
          })
        );
      })
    );
  }

  protected watchContractAbi(name: F): Observable<any[]> {
    return of(this.getContractAbi(name));
  }

  protected watchContractAddress(contractName: F): Observable<ContractAddress | null> {
    return this.watchNetwork().pipe(
      map((network: Network) => {
        const address: string | undefined = this.getContractAddress(network, contractName);

        return !!address && isValidAddress(address) ? { address, network } : null;
      })
    );
  }

  protected watchProvider(): Observable<Signer> {
    return walletState.watchSigner();
  }

  protected watchNetwork(): Observable<Network> {
    return walletState.watchIsConnected().pipe(
      switchMap(connected => {
        return connected ? walletState.watchNetwork() : NEVER;
      }),
      distinctUntilChanged()
    );
  }
}
