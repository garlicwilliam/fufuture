import { combineLatest, NEVER, Observable, of } from 'rxjs';
import { Network } from '../../constant/network';
import { walletState } from '../wallet/wallet-state';
import { catchError, distinctUntilChanged, filter, map, switchMap } from 'rxjs/operators';
import { Contract, providers, Signer } from 'ethers';
import { createChainContract } from './contract-creator';
import { isValidAddress } from '../../util/address';

export type ContractAddress = { address: string; network: Network };

export abstract class BaseContractManager<F extends string> {
  abstract getContractAddress(network: Network, contractName: F): string | undefined;

  abstract getContractAbi(contractName: F): any[];

  abstract getConfigContractNames(): readonly F[];

  public readonly CONTRACTS = this.createContractObservableMap();
  public readonly CONTRACTS_ADDRESS = this.createContractAddressesMap();

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
      res[name] = this.watchContractAddress(name).pipe(map(info => info.address));
    });

    return res;
  }

  protected watchContract(contractName: F): Observable<Contract> {
    const address$ = this.watchContractAddress(contractName);
    const provider$ = this.watchProvider();
    const abi$ = this.watchContractAbi(contractName);

    return combineLatest([address$, provider$, abi$]).pipe(
      switchMap(([address, provider, abi]) => {
        if (!address?.address || !provider || !abi) {
          return NEVER;
        }

        return of(createChainContract(address.address, abi, provider, address.network));
      })
    );
  }

  protected watchContractAbi(name: F): Observable<any[]> {
    return of(this.getContractAbi(name));
  }

  protected watchContractAddress(contractName: F): Observable<ContractAddress> {
    return this.watchNetwork().pipe(
      map((network: Network) => {
        const address: string | undefined = this.getContractAddress(network, contractName);
        return !!address && isValidAddress(address) ? { address, network } : null;
      }),
      filter(Boolean)
    );
  }

  protected watchProvider(): Observable<providers.Provider | Signer> {
    return walletState.watchWalletInstance().pipe(
      switchMap(wallet => {
        return wallet.watchSigner();
      }),
      catchError(err => {
        console.warn('error', err);
        return NEVER;
      })
    );
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
