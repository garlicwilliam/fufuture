import { ShieldTokenSearchList, TokenErc20 } from '../../../state-manager/state-types';
import { Observable, of, switchMap, combineLatest, Subject, zip, BehaviorSubject, Subscription } from 'rxjs';
import { SldDecimal } from '../../../util/decimal';
import { walletState } from '../../../state-manager/wallet/wallet-state';
import { Contract } from 'ethers';
import { erc20UserBalanceGetter } from '../../../state-manager/contract/contract-getter-sim-erc20';
import { filter, finalize, map, startWith, tap } from 'rxjs/operators';
import { contractNetwork, createChainContract } from '../../../state-manager/const/contract-creator';
import { ERC20 } from '../../../wallet/abi';
import { getShieldRpcProviderCache } from '../const/http-rpc';
import { poolTokenAddressListGetter } from '../../../state-manager/contract/contract-getter-cpx-shield';
import { shieldOptionTradeContracts } from '../contract/shield-option-trade-contract';
import { batchFetchTokenBalance, batchFetchTokenInfo } from './batch-fetch.service';
import { Network } from '../../../constant/network';
import { TokenBalanceList } from './types';

export class TokenBalanceService {
  private updateTrigger = new Subject<any>();

  private tokenList = new BehaviorSubject<ShieldTokenSearchList | null>(null);
  private tokenListPending: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  private tokenBalances = new BehaviorSubject<TokenBalanceList | null>(null);

  private subs: Subscription[] = [];

  constructor() {
    const sub: Subscription = this.watchSupportTokens()
      .pipe(
        tap(tokens => {
          this.tokenList.next(tokens);
        }),
        switchMap(tokens => {
          const balances$ = walletState.USER_ADDR.pipe(
            switchMap((user: string) => {
              return this.doGetTokenBalance(user, tokens);
            })
          );

          return combineLatest([balances$, of(tokens.network)]);
        }),
        tap(([balances, network]) => {
          this.tokenBalances.next({ network, tokens: balances });
        })
      )
      .subscribe();

    this.subs.push(sub);
  }

  // ------

  public watchTokenList(): Observable<ShieldTokenSearchList> {
    return this.tokenList.pipe(filter(Boolean));
  }

  public watchTokenListPending(): Observable<boolean> {
    return this.tokenListPending;
  }

  // ----

  public watchTokenBalance(token?: TokenErc20): Observable<SldDecimal> {
    if (!token) {
      return of(SldDecimal.ZERO);
    }

    return combineLatest([walletState.NETWORK, walletState.USER_ADDR, this.updateTrigger.pipe(startWith(0))]).pipe(
      switchMap(([network, userAddress, __]) => {
        if (network !== token.network) {
          return of(SldDecimal.ZERO);
        }

        const cacheValue$ = this.tokenBalances.pipe(
          switchMap(tokenBalances => {
            if (!tokenBalances) {
              return of(null);
            }

            const isMatch = network === tokenBalances.network;
            if (isMatch) {
              const balance = tokenBalances.tokens[token.address.toLowerCase()];
              return balance ? of(balance) : of(null);
            } else {
              return of(null);
            }
          })
        );

        return cacheValue$.pipe(
          switchMap((value: SldDecimal | null) => {
            if (value !== null) {
              return of(value);
            }

            const provider = getShieldRpcProviderCache(network);
            const erc20Contract = createChainContract(token.address, ERC20, provider, network);
            return erc20UserBalanceGetter(erc20Contract, userAddress, token.decimal);
          })
        );
      })
    );
  }

  public refresh() {
    this.updateTrigger.next(true);
  }

  // -------------------------------------------------------------------------------------------------------------------

  // watch support tokens
  private watchSupportTokens(): Observable<ShieldTokenSearchList> {
    const manager$: Observable<Contract> = shieldOptionTradeContracts.CONTRACTS.liquidityManager;

    return manager$.pipe(
      switchMap((manager: Contract) => {
        return this.doGetTokenList(manager);
      })
    );
  }

  private doGetTokenList(manager: Contract): Observable<ShieldTokenSearchList> {
    const network: Network = contractNetwork(manager)!;

    this.tokenListPending.next(true);

    return zip(poolTokenAddressListGetter(manager), of(network)).pipe(
      switchMap(([tokenAddressList, network]) => {
        const info$ = batchFetchTokenInfo(tokenAddressList, network, 'token balance 145');
        return zip(info$, of(network));
      }),
      map(([tokens, network]) => {
        return {
          tokens: Object.values(tokens),
          network,
        };
      }),
      finalize(() => {
        this.tokenListPending.next(false);
      })
    );
  }

  private doGetTokenBalance(user: string, tokenList: ShieldTokenSearchList): Observable<{ [k: string]: SldDecimal }> {
    return batchFetchTokenBalance(tokenList, user);
  }
}

export const tokenBalanceService: TokenBalanceService = new TokenBalanceService();
