import { BigNumber, Contract } from 'ethers';
import { from, Observable, zip } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { keepE18Number } from '../../util/ethers';
import { SldDecPrice } from '../../util/decimal';
import { CACHE_1_MIN, CACHE_3_SEC, cacheService } from '../mem-cache/cache-contract';
import { contractNetwork } from '../const/contract-creator';
import { Network } from '../../constant/network';

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

  const network: Network | null = contractNetwork(proxyContract);
  const cacheKey: string = '_chain_link_linkAnswerGetter_' + network?.toString() + proxyContract.address;

  return cacheService.tryUseCache(tokenPrice$, cacheKey, CACHE_3_SEC);
}
