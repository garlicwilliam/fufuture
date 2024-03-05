import { WALLET_AGREE_CACHE_KEY } from '../cache/cache-state-vars';
import { AppName, getAppName } from '../../util/app';
import { combineLatest, interval, Observable, Subject } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

export class WalletAgree {
  public readonly IS_AGREE: Observable<boolean>;
  private readonly triggerEvent = new Subject();
  public readonly INIT_AGREE: boolean;

  constructor() {
    this.INIT_AGREE = this.isAgree();
    this.IS_AGREE = this.intervalCheck();
  }

  public trigger() {
    this.triggerEvent.next(true);
  }

  public setAgree(isAgree: boolean | 'Y' | 'N' | null) {
    const stateVal: string | null = typeof isAgree === 'boolean' ? (isAgree ? 'Y' : 'N') : isAgree;
    if (stateVal === null) {
      localStorage.removeItem(WALLET_AGREE_CACHE_KEY);
    } else {
      localStorage.setItem(WALLET_AGREE_CACHE_KEY, stateVal);
    }

    this.trigger();
  }

  private intervalCheck(): Observable<boolean> {
    return combineLatest([this.triggerEvent.pipe(startWith(true)), interval(10000).pipe(startWith(0))]).pipe(
      startWith([true, 0]),
      map(() => {
        return this.isAgree();
      })
    );
  }

  private isAgree(): boolean {
    const appName: AppName = getAppName();
    return appName === AppName.Stone || appName === AppName.StoneOmni ? this.getAgreeState() : true;
  }

  private getAgreeState(): boolean {
    const state: string | null = localStorage.getItem(WALLET_AGREE_CACHE_KEY);
    return state === 'Y';
  }
}

export const walletAgree = new WalletAgree();
