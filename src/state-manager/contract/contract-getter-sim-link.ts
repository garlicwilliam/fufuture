import { BigNumber, Contract } from 'ethers';
import { from, Observable, zip } from 'rxjs';
import { map } from 'rxjs/operators';
import { keepE18Number } from '../../util/ethers';
import { SldDecPrice } from '../../util/decimal';
import { CACHE_3_SEC, CACHE_FOREVER, cacheService } from '../mem-cache/cache-contract';
import { contractNetwork } from '../const/contract-creator';
import { Network } from '../../constant/network';

function genCacheKey(contract: Contract, key: string): string {
  const network: Network | null = contractNetwork(contract);
  const address: string = contract.address;

  return `_chain_link-net:${network}-addr:${address}-key:${key}`;
}

export function linkAnswerGetter(proxyContract: Contract): Observable<SldDecPrice> {
  type Rs = {
    roundId: BigNumber;
    answer: BigNumber;
    startedAt: BigNumber;
    updatedAt: BigNumber;
    answeredInRound: BigNumber;
  };

  const decimal$ = from(proxyContract.decimals() as Promise<BigNumber>);
  const price$ = from(proxyContract.latestRoundData() as Promise<Rs>).pipe(
    map(rs => {
      return rs.answer;
    })
  );

  const tokenPrice$ = zip(decimal$, price$).pipe(
    map(([decimal, price]) => {
      const decimalNum = typeof decimal === 'number' ? decimal : decimal.toNumber();
      return keepE18Number(price, decimalNum);
    }),
    map(price => {
      return SldDecPrice.fromE18(price);
    })
  );

  const cacheKey: string = genCacheKey(proxyContract, 'linkAnswerGetter');

  return cacheService.tryUseCache(tokenPrice$, cacheKey, CACHE_3_SEC);
}

export function linkDescGetter(proxyContract: Contract): Observable<string> {
  const cacheKey: string = genCacheKey(proxyContract, 'linkDescGetter');
  const desc$ = from(proxyContract.description() as Promise<string>);

  return cacheService.tryUseCache(desc$, cacheKey, CACHE_FOREVER);
}
