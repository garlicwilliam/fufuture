import { AsyncSubject, EMPTY, Observable, of, switchMap } from 'rxjs';
import { TokenErc20 } from '../../../state-manager/state-types';
import { Network } from '../../../constant/network';
import { walletState } from '../../../state-manager/wallet/wallet-state';
import { Contract } from 'ethers';
import { erc20InfoGetter } from '../../../state-manager/contract/contract-getter-sim-erc20';
import { catchError, finalize, map, tap } from 'rxjs/operators';
import { httpJson } from '../../../util/http';
import { createErc20Contract } from '../../../state-manager/const/contract-creator';
import { SLD_ENV_CONF } from '../const/env';

export class TokenCacheService {
  private readonly cacheMapToken = new Map<string, TokenErc20>();
  private readonly cacheMapIcon = new Map<string, string>();
  private readonly isIconLoaded: AsyncSubject<boolean> = new AsyncSubject<boolean>();

  static genCacheKey(tokenAddress: string, network: Network): string {
    return tokenAddress.toLowerCase() + '-' + network.toLowerCase();
  }

  constructor() {
    this.loadIconConfig();
  }

  public getToken(tokenAddress: string, network: Network): Observable<TokenErc20 | null> {
    const cacheKey: string = TokenCacheService.genCacheKey(tokenAddress, network);

    if (this.cacheMapToken.has(cacheKey)) {
      return of(this.cacheMapToken.get(cacheKey) as TokenErc20);
    } else if (this.getCurNetwork() !== network) {
      return of(null);
    } else {
      return this.doGet(tokenAddress, network).pipe(
        tap((token: TokenErc20) => {
          this.cacheMapToken.set(cacheKey, token);
        })
      );
    }
  }

  public getTokenIcon(token: TokenErc20): Observable<string | null> {
    return this.getIcon(token.address, token.network);
  }

  public getIcon(tokenAddress: string, network: Network): Observable<string | null> {
    return this.isIconLoaded.pipe(
      map(l => {
        const cacheKey: string = TokenCacheService.genCacheKey(tokenAddress, network);

        if (this.cacheMapIcon.has(cacheKey)) {
          return this.cacheMapIcon.get(cacheKey) as string;
        } else {
          return null;
        }
      })
    );
  }

  // -------------------------------------------------------------------------------------------------------------------

  private loadIconConfig() {
    httpJson(SLD_ENV_CONF.TokenIcon)
      .pipe(
        tap(config => {
          Object.keys(config).forEach(network => {
            Object.keys(config[network]).forEach(address => {
              const icon = config[network][address];
              const cacheKey = TokenCacheService.genCacheKey(address, network as Network);

              this.cacheMapIcon.set(cacheKey, icon);
            });
          });
        }),
        catchError(() => {
          return EMPTY;
        }),
        finalize(() => {
          this.isIconLoaded.next(true);
          this.isIconLoaded.complete();
        })
      )
      .subscribe();
  }

  private doGet(tokenAddress: string, network: Network): Observable<TokenErc20> {
    return createErc20Contract(tokenAddress).pipe(
      switchMap((contract: Contract) => {
        return erc20InfoGetter(contract);
      })
    );
  }

  private getCurNetwork(): Network | null {
    return walletState.getCurNetwork();
  }
}

export const tokenCacheService = new TokenCacheService();
