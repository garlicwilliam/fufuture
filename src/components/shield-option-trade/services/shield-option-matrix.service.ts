import { from, mergeMap, Observable, of, switchMap } from 'rxjs';
import { SldDecPercent } from '../../../util/decimal';
import { shieldOptionTradeContracts } from '../contract/shield-option-trade-contract';
import { map, take, tap, toArray } from 'rxjs/operators';
import { Network } from '../../../constant/network';
import { Contract } from 'ethers';
import {
  paramFundingRateGetter,
  paramFundingRateMatrixGetter,
} from '../../../state-manager/contract/contract-getter-cpx-shield';
import { contractNetwork } from '../../../state-manager/const/contract-creator';
import { walletState } from '../../../state-manager/wallet/wallet-state';
import { arrayInteger } from '../../../util/array';

export type RateStruct = {
  rate: SldDecPercent;
  network: Network;
  dayIndex: number;
};

export class ShieldOptionMatrixService {
  private cache: Map<Network, Map<number, SldDecPercent>> = new Map<Network, Map<number, SldDecPercent>>();

  constructor() {
    this.init();
  }

  private init() {
    this.contract()
      .pipe(
        switchMap((contract: Contract) => {
          return paramFundingRateMatrixGetter(contract).pipe(
            map((rates: SldDecPercent[]) => {
              return { rates, network: contractNetwork(contract) };
            })
          );
        }),
        tap(({ rates, network }) => {
          rates.forEach((rate, i) => {
            const struct: RateStruct = { rate, network: network!, dayIndex: i };
            this.setCache(struct);
          });
        })
      )
      .subscribe();
  }

  public getRate(dayIndex: number): Observable<SldDecPercent> {
    return this.getRateStruct(dayIndex).pipe(map(res => res.rate));
  }

  public getRates(dayIndex: number[]): Observable<SldDecPercent[]> {
    return this.getRatesList(dayIndex).pipe(map(rates => rates.map(one => one.rate)));
  }

  public getDayRates(fromDay: number, dayCount: number): Observable<SldDecPercent[]> {
    const indexes = arrayInteger(dayCount, fromDay);
    return this.getRates(indexes);
  }

  public getRatesList(dayIndexes: number[]): Observable<RateStruct[]> {
    return from(dayIndexes).pipe(
      mergeMap((dayIndex: number) => {
        return this.getRateStruct(dayIndex);
      }),
      toArray(),
      map((rates: RateStruct[]) => {
        return rates.sort((a, b) => a.dayIndex - b.dayIndex);
      })
    );
  }

  // ------------------------------------------------------------------------------------------------------

  private getRateStruct(dayIndex: number): Observable<RateStruct> {
    if (dayIndex > 364) {
      throw Error('Funding Rate Matrix Overflow');
    }

    const res = this.getCache(dayIndex);
    if (res) {
      return of(res);
    }

    return this.doQuery(dayIndex).pipe(
      tap((res: RateStruct) => {
        this.setCache(res);
      })
    );
  }

  private setCache(res: RateStruct) {
    if (!this.cache.has(res.network)) {
      this.cache.set(res.network, new Map<number, SldDecPercent>());
    }

    const cacheMap = this.cache.get(res.network) as Map<number, SldDecPercent>;
    if (!cacheMap.has(res.dayIndex)) {
      cacheMap.set(res.dayIndex, res.rate);
    }
  }

  private getCacheStruct(dayIndex: number, network: Network): RateStruct | null {
    const cacheMap = this.cache.get(network);
    if (cacheMap) {
      const rate = cacheMap.get(dayIndex);
      if (rate) {
        return {
          rate,
          network,
          dayIndex,
        };
      }
    }

    return null;
  }

  private getCache(dayIndex: number): RateStruct | null {
    const network = walletState.getCurNetwork();
    if (!network) {
      return null;
    }

    return this.getCacheStruct(dayIndex, network);
  }

  private doQuery(dayIndex: number): Observable<RateStruct> {
    return this.contract().pipe(
      switchMap((contract: Contract) => {
        return paramFundingRateGetter(contract, dayIndex).pipe(
          map((rate: SldDecPercent): RateStruct => {
            const network: Network = contractNetwork(contract)!;

            return {
              rate,
              network,
              dayIndex,
            };
          })
        );
      })
    );
  }

  private contract(): Observable<Contract> {
    return shieldOptionTradeContracts.CONTRACTS.optionTrade.pipe(take(1));
  }
}

export const shieldOptionMatrixService = new ShieldOptionMatrixService();
