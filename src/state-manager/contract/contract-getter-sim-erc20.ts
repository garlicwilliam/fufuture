import { BigNumber, Contract } from 'ethers';
import { EMPTY, Observable, of, switchMap, zip } from 'rxjs';
import { TokenErc20 } from '../state-types';
import { catchError, map } from 'rxjs/operators';
import { SldDecimal } from '../../util/decimal';
import { genContractCallPartial } from './contract-utils';
import { CACHE_10_SEC, CACHE_3_SEC, CACHE_FOREVER, cacheService } from '../mem-cache/cache-contract';
import {
  contractNetwork,
  createErc20Contract,
  isConnectedNetworkChanged,
  isValidContract,
} from '../const/contract-creator';
import { shortAddress } from '../../util';
import { Network } from '../../constant/network';
import { ZERO } from '../../constant';

const erc20Call = genContractCallPartial<any>('ERC20');

function genCacheKey(erc20Contract: Contract, key: string, param?: string): string {
  return key + '_' + contractNetwork(erc20Contract) + '-' + erc20Contract.address + '_' + (param ? param : '');
}

// ---------------------------------------------------------------------------------------------------------------------

export function erc20DecimalGetter(erc20Contract: Contract): Observable<number> {
  const cacheKey: string = genCacheKey(erc20Contract, 'erc20_decimal');
  const decimal$ = erc20Call(
    erc20Contract.decimals() as Promise<number>,
    `[${shortAddress(erc20Contract.address)}] decimals()`
  );
  return cacheService.tryUseCache(decimal$, cacheKey, CACHE_FOREVER);
}

export function erc20SymbolGetter(erc20Contract: Contract): Observable<string> {
  const cacheKey: string = genCacheKey(erc20Contract, 'erc20_symbol');
  const symbol$ = erc20Call(
    erc20Contract.symbol() as Promise<string>,
    `[${shortAddress(erc20Contract.address)}] symbol()`
  );

  return cacheService.tryUseCache(symbol$, cacheKey, CACHE_FOREVER);
}

export function erc20InfoGetter(erc20Contract: Contract): Observable<TokenErc20> {
  const cacheKey: string = genCacheKey(erc20Contract, 'erc20_info');
  const symbol$: Observable<string> = erc20SymbolGetter(erc20Contract);
  const decimal$: Observable<number> = erc20DecimalGetter(erc20Contract);

  const token$: Observable<TokenErc20> = zip(symbol$, decimal$).pipe(
    map(([symbol, decimal]) => {
      return {
        symbol,
        decimal,
        address: erc20Contract.address,
        network: contractNetwork(erc20Contract) as Network,
      };
    }),
    catchError(err => {
      console.warn('error', err, erc20Contract.address);
      throw err;
    })
  );

  return cacheService.tryUseCache(token$, cacheKey, CACHE_FOREVER);
}

export function erc20InfoByAddressGetter(erc20Address: string): Observable<TokenErc20> {
  return createErc20Contract(erc20Address).pipe(
    switchMap(erc20Contract => {
      return erc20InfoGetter(erc20Contract);
    })
  );
}

export function erc20UserBalanceGetter(
  erc20: Contract | TokenErc20 | null,
  userAddress: string,
  decimal?: number
): Observable<SldDecimal> {
  if (!erc20) {
    return of(SldDecimal.ZERO);
  }

  const erc20Contract$: Observable<Contract> = isValidContract(erc20)
    ? of(erc20 as Contract)
    : createErc20Contract(erc20.address);

  return erc20Contract$.pipe(
    switchMap((erc20Contract: Contract) => {
      const cacheKey: string = genCacheKey(erc20Contract, 'erc20_balance', userAddress);

      if (isConnectedNetworkChanged(erc20Contract)) {
        return EMPTY;
      }

      const decimal$ = decimal === undefined ? erc20DecimalGetter(erc20Contract) : of(decimal);
      const balancePromise$ = erc20Contract.balanceOf(userAddress) as Promise<BigNumber>;
      const balanceNum$: Observable<BigNumber> = erc20Call(balancePromise$, `balanceOf(${userAddress})`).pipe(
        catchError(err => {
          console.warn('Read Token Balance Error:', 'Account:', userAddress, 'Token:', erc20Contract.address);
          return of(ZERO);
        })
      );
      const balance$ = zip(decimal$, balanceNum$).pipe(
        map(([decimal, balance]) => {
          return SldDecimal.fromOrigin(balance, decimal);
        })
      );

      return cacheService.tryUseCache(balance$, cacheKey, CACHE_3_SEC);
    })
  );
}

export function erc20ApprovedAmountGetter(
  userAddress: string,
  erc20: Contract | TokenErc20,
  callerContract: Contract | string,
  decimal?: number
): Observable<SldDecimal> {
  const callerAddress: string = typeof callerContract === 'string' ? callerContract : callerContract.address;
  const isContract = isValidContract(erc20);
  const tokenContract$: Observable<Contract> = isContract ? of(erc20 as Contract) : createErc20Contract(erc20.address);

  return tokenContract$.pipe(
    switchMap((erc20Contract: Contract) => {
      const promise$ = erc20Contract.allowance(userAddress, callerAddress) as Promise<BigNumber>;
      const decimal$: Observable<number> = decimal
        ? of(decimal)
        : isContract
        ? erc20DecimalGetter(erc20Contract)
        : of((erc20 as TokenErc20).decimal);
      const methodName = `allowance(${shortAddress(userAddress)}, ${shortAddress(callerAddress)})`;

      const allowance$: Observable<BigNumber> = erc20Call(promise$, methodName);
      const approve$ = zip(decimal$, allowance$).pipe(
        map(([decimal, allowance]) => {
          return SldDecimal.fromOrigin(allowance, decimal);
        })
      );

      const cacheKey: string = genCacheKey(erc20Contract, 'erc20_approve', userAddress + ' ' + callerAddress);

      return cacheService.tryUseCache(approve$, cacheKey, CACHE_3_SEC);
    })
  );
}

export function erc20TotalSupplyGetter(erc20Contract: Contract, decimal?: number): Observable<SldDecimal> {
  const supply$ = erc20Call(erc20Contract.totalSupply() as Promise<BigNumber>, 'totalSupply()');
  const decimal$ = decimal === undefined ? erc20DecimalGetter(erc20Contract) : of(decimal);

  const approve$ = zip(supply$, decimal$).pipe(
    map(([total, decimal]) => {
      return SldDecimal.fromOrigin(total, decimal);
    })
  );

  const cacheKey: string = genCacheKey(erc20Contract, 'erc20_supply');

  return cacheService.tryUseCache(approve$, cacheKey, CACHE_10_SEC);
}
