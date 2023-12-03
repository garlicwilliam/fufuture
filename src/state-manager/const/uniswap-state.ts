import { EMPTY, Observable, zip } from 'rxjs';
import { Contract, ethers } from 'ethers';
import { map, take } from 'rxjs/operators';
import {
  DEX_POOL_FACTORY_ABI,
  IZUMI_FACTORY_ABI,
  IZUMI_POOL_ABI,
  UNI_FACTORY_V2_ABI,
  UNI_FACTORY_V3_ABI,
  UNI_POOL_MIN_ABI,
  UNI_V2_POOL_ABI,
  UNI_V3_POOL_ABI,
} from '../../wallet/abi';
import { walletState } from '../wallet/wallet-state';
import { isValidAddress } from '../../util/address';
import { DexVersion } from '../state-types';
import { DexType } from '../../constant';
import { getDexFactoryVersion } from '../../util-bussiness/uniswap';
import { Network } from '../../constant/network';
import { createChainContract } from './contract-creator';

export class UniSwapState {
  public createDexMinContract(poolAddress: string): Observable<Contract> {
    const network$: Observable<Network> = walletState.watchNetwork().pipe(take(1));
    const provider$: Observable<ethers.Signer> = walletState.watchSigner().pipe(take(1));

    return zip(network$, provider$).pipe(
      map(([network, provider]) => {
        return createChainContract(poolAddress, DEX_POOL_FACTORY_ABI, provider, network);
      })
    );
  }

  /**
   * Create pool contract with minimal abi
   *
   * @param poolAddress
   */
  public createUniSwapPoolMinContract(poolAddress: string): Observable<Contract> {
    const network$: Observable<Network> = walletState.watchNetwork().pipe(take(1));
    const provider$: Observable<ethers.Signer> = walletState.watchSigner().pipe(take(1));

    return zip(provider$, network$).pipe(
      map(([provider, network]) => {
        return createChainContract(poolAddress, UNI_POOL_MIN_ABI, provider, network);
      })
    );
  }

  /**
   * Create pool contract with v2 abi
   *
   * @param pairAddress
   */
  public createV2PairContract(pairAddress: string): Observable<Contract> {
    const network$: Observable<Network> = walletState.watchNetwork().pipe(take(1));
    const provider$: Observable<ethers.Signer> = walletState.watchSigner().pipe(take(1));

    return zip(provider$, network$).pipe(
      map(([provider, network]) => {
        return createChainContract(pairAddress, UNI_V2_POOL_ABI, provider, network);
      })
    );
  }

  /**
   * Create pool contract with v3 abi
   *
   * @param poolAddress
   */
  public createV3PoolContract(poolAddress: string): Observable<Contract> {
    const network$: Observable<Network> = walletState.watchNetwork().pipe(take(1));
    const provider$: Observable<ethers.Signer> = walletState.watchSigner().pipe(take(1));

    return zip(provider$, network$).pipe(
      map(([provider, network]) => {
        return createChainContract(poolAddress, UNI_V3_POOL_ABI, provider, network);
      })
    );
  }

  /**
   * Create IZUMI liquidity pool contract
   * @param poolAddress
   */
  public createIzumiPoolContract(poolAddress: string): Observable<Contract> {
    const network$: Observable<Network> = walletState.watchNetwork().pipe(take(1));
    const provider$: Observable<ethers.Signer> = walletState.watchSigner().pipe(take(1));

    return zip(provider$, network$).pipe(
      map(([provider, network]) => {
        return createChainContract(poolAddress, IZUMI_POOL_ABI, provider, network);
      })
    );
  }

  /**
   * Create Liquidity pool Factory contract
   * @param factoryAddress
   */
  public createFactoryContract(factoryAddress: string): Observable<Contract> {
    if (!isValidAddress(factoryAddress)) {
      return EMPTY;
    }

    const factoryObj: DexVersion | undefined = getDexFactoryVersion(factoryAddress);

    if (!factoryObj) {
      return EMPTY;
    }

    const abi: any =
      factoryObj.dex === DexType.CAKE || (factoryObj.dex === DexType.UNI && factoryObj.ver === 2)
        ? UNI_FACTORY_V2_ABI
        : factoryObj.dex === DexType.IZUMI
        ? IZUMI_FACTORY_ABI
        : factoryObj.dex === DexType.UNI && factoryObj.ver === 3
        ? UNI_FACTORY_V3_ABI
        : null;

    if (!abi) {
      return EMPTY;
    }

    const network$: Observable<Network> = walletState.watchNetwork().pipe(take(1));
    const provider$: Observable<ethers.Signer> = walletState.watchSigner().pipe(take(1));
    return zip(provider$, network$).pipe(
      map(([provider, network]) => {
        return createChainContract(factoryAddress, abi, provider, network);
      })
    );
  }
}

export const uniSwapState = new UniSwapState();
