import * as ethers from 'ethers';
import { Contract, providers, Signer } from 'ethers';
import * as _ from 'lodash';
import { Network } from '../../constant/network';
import { from, Observable, of, zip } from 'rxjs';
import { walletState } from '../wallet/wallet-state';
import { map, take } from 'rxjs/operators';
import { ERC20 } from '../../wallet/abi';
import { providerChainId } from '../contract/contract-provider-utils';

const signKeyVersion = '_creationVersion' as const;
const signKeyNetwork = '_creationNetwork' as const;
const signKeySigner = '_sldContractCreate' as const;

export function createErc20Contract(tokenAddress: string): Observable<Contract> {
  return createContractByCurEnv(tokenAddress, ERC20);
}

export function createContractByEnv(address: string, abi: any[], envContract: Contract): Contract {
  return createChainContract(address, abi, envContract.signer || envContract.provider, contractNetwork(envContract)!);
}

export function createContractByCurEnv(address: string, abi: any[]): Observable<Contract> {
  const provider$ = walletState.watchSigner().pipe(take(1));
  const network$ = walletState.watchNetwork().pipe(take(1));

  return zip(provider$, network$).pipe(
    map(([provider, network]) => {
      return createChainContract(address, abi, provider, network);
    })
  );
}

export function createContractByProvider(
  address: string,
  abi: any[],
  provider: ethers.providers.Provider | ethers.Signer
): Observable<Contract> {
  const isSigner: boolean = ethers.Signer.isSigner(provider);

  let chainId$: Observable<number>;
  if (isSigner) {
    chainId$ = from((provider as ethers.Signer).getChainId());
  } else {
    const chainId: number | undefined = providerChainId(provider as ethers.providers.Provider);

    chainId$ =
      chainId !== undefined
        ? of(chainId)
        : from((provider as ethers.providers.Provider).getNetwork()).pipe(map(network => network.chainId));
  }

  return chainId$.pipe(
    map((chain: number) => {
      const network: Network = String(chain) as Network;

      return createChainContract(address, abi, provider, network);
    })
  );
}

export function createChainContract(
  address: string,
  abi: any[],
  provider: providers.Provider | Signer,
  network: Network,
  version: number = 0
): Contract {
  try {
    const contract: Contract = new ethers.Contract(address, abi, provider);
    _.set(contract, signKeySigner, 'sld');
    _.set(contract, signKeyNetwork, network);
    _.set(contract, signKeyVersion, version);
    return contract;
  } catch (err) {
    console.warn('error', err);
    throw err;
  }
}

export function isValidContract(contract: any): boolean {
  return _.has(contract, signKeyNetwork) && _.has(contract, signKeyVersion) && _.has(contract, signKeySigner);
}

export function contractNetwork(contract: Contract): Network | null {
  const netInfo: Network | null = _.get(contract, signKeyNetwork, null);
  return netInfo ? netInfo : null;
}

export function contractVersion(contract: Contract): number {
  return _.get(contract, signKeyVersion, 0);
}

export function isConnectedNetworkChanged(contract: Contract): boolean {
  const conNetwork: Network | null = contractNetwork(contract);
  const curNetwork: Network | null = walletState.getCurNetwork();

  const rs = conNetwork !== null && curNetwork !== null && conNetwork !== curNetwork;
  return rs;
}
