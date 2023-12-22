import { AsyncSubject, from, mergeMap, Observable, of, Subscription, switchMap } from 'rxjs';
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
import * as net from 'net';

export type RateStruct = {
  rate: SldDecPercent;
  network: Network;
  dayIndex: number;
};

export class ShieldOptionMatrixService {
  private cache: Map<Network, Map<number, SldDecPercent>> = new Map<Network, Map<number, SldDecPercent>>();
  private matrixInit: Map<Network, AsyncSubject<boolean>> = new Map<Network, AsyncSubject<boolean>>();

  private sub: Subscription | null = null;
  constructor() {
    this.init();
  }

  private matrixInitStatus(network: Network): Observable<boolean> {
    if (!this.matrixInit.has(network)) {
      this.matrixInit.set(network, new AsyncSubject<boolean>());
    }

    return this.matrixInit.get(network) as AsyncSubject<boolean>;
  }

  private matrixInitialized(network: Network) {
    if (!this.matrixInit.has(network)) {
      this.matrixInit.set(network, new AsyncSubject<boolean>());
    }

    const initSubject = this.matrixInit.get(network) as AsyncSubject<boolean>;
    initSubject.next(true);
    initSubject.complete();
  }

  private initMatrixCache(network: Network, rates: SldDecPercent[]) {
    const cacheMap = new Map<number, SldDecPercent>();

    rates.forEach((rate: SldDecPercent, i: number) => {
      cacheMap.set(i, rate);
    });

    this.cache.set(network, cacheMap);
    this.matrixInitialized(network);
  }

  private init() {
    const sub = this.contract()
      .pipe(
        switchMap((contract: Contract) => {
          return paramFundingRateMatrixGetter(contract).pipe(
            map((rates: SldDecPercent[]) => {
              return { rates, network: contractNetwork(contract)! };
            })
          );
        }),
        tap(({ rates, network }) => {
          this.initMatrixCache(network, rates);
        })
      )
      .subscribe();
  }

  public getRate(dayIndex: number, network: Network): Observable<SldDecPercent> {
    return this.getRateStruct(dayIndex, network).pipe(map(res => res.rate));
  }

  public getRates(dayIndex: number[], network: Network): Observable<SldDecPercent[]> {
    return this.getRatesList(dayIndex, network).pipe(map(rates => rates.map(one => one.rate)));
  }

  public getDayRates(fromDay: number, dayCount: number, network: Network): Observable<SldDecPercent[]> {
    const indexes = arrayInteger(dayCount, fromDay);
    return this.getRates(indexes, network);
  }

  public getRatesList(dayIndexes: number[], network: Network): Observable<RateStruct[]> {
    return from(dayIndexes).pipe(
      mergeMap((dayIndex: number) => {
        return this.getRateStruct(dayIndex, network);
      }),
      toArray(),
      map((rates: RateStruct[]) => {
        return rates.sort((a, b) => a.dayIndex - b.dayIndex);
      })
    );
  }

  // ------------------------------------------------------------------------------------------------------

  private getRateStruct(dayIndex: number, network: Network): Observable<RateStruct> {
    return this.matrixInitStatus(network).pipe(
      map(() => {
        return this.getCacheStruct(dayIndex, network);
      })
    );
  }

  private getCacheStruct(dayIndex: number, network: Network): RateStruct {
    const cacheMap = this.cache.get(network) as Map<number, SldDecPercent>;

    if (dayIndex >= cacheMap.size) {
      dayIndex = cacheMap.size - 1;
    }

    const rate: SldDecPercent = cacheMap.get(dayIndex) as SldDecPercent;

    return {
      rate,
      network,
      dayIndex,
    };
  }

  private contract(): Observable<Contract> {
    return shieldOptionTradeContracts.CONTRACTS.optionTrade;
  }
}

export const shieldOptionMatrixService = new ShieldOptionMatrixService();
