import { SldDecimal, SldDecPrice } from '../../../util/decimal';
import { from, Observable, of, switchMap, zip } from 'rxjs';
import { shieldOptionTradeContracts } from '../contract/shield-option-trade-contract';
import { catchError, map, take } from 'rxjs/operators';
import { Contract, BigNumber } from 'ethers';
import { EMPTY_ADDRESS, MAX_UINT_256 } from '../../../constant';
import {
  ShieldMakerOrderInfo,
  ShieldMakerPrivatePoolInfo,
  ShieldOptionType,
  ShieldUnderlyingType,
  TokenErc20,
} from '../../../state-manager/state-types';
import { createContractByCurEnv, createErc20Contract } from '../../../state-manager/const/contract-creator';
import { loadingObs } from '../../../services/utils';
import { i18n } from '../../i18n/i18n-fn';
import { ABI_PRIVATE_POOL, ABI_PUBLIC_POOL } from '../const/shield-option-abi';

export class ShieldOptionTradeService {
  public approveAddLiquidity(token: TokenErc20) {
    const manager$ = shieldOptionTradeContracts.CONTRACTS_ADDRESS.liquidityManager;

    const approve$ = zip(manager$).pipe(
      switchMap(([manager]) => {
        return this.approve(token.address, manager);
      })
    );

    return loadingObs(approve$, i18n('trade-approve-failed'), i18n('trade-approving'));
  }

  public deposit(tokenAddress: string, depositAmount: SldDecimal, referral?: string): Observable<boolean> {
    const deposit$ = shieldOptionTradeContracts.CONTRACTS.optionTrade.pipe(take(1)).pipe(
      switchMap(contract => {
        const deposit$: Observable<boolean> = from(
          contract.deposit(tokenAddress, depositAmount.toOrigin(), referral || EMPTY_ADDRESS) as Promise<boolean>
        );

        return this.boolExe(deposit$, 'Deposit Error:');
      })
    );

    return loadingObs(deposit$, i18n('trade-deposit-failed'), i18n('trade-depositing'));
  }

  public depositApprove(tokenAddress: string): Observable<boolean> {
    const approve$ = shieldOptionTradeContracts.CONTRACTS_ADDRESS.optionTrade.pipe(take(1)).pipe(
      switchMap((contractAddress: string) => {
        return this.approve(tokenAddress, contractAddress);
      })
    );

    return loadingObs(approve$, i18n('trade-approve-failed'), i18n('trade-approving'));
  }

  public withdraw(tokenAddress: string, withdrawAmount: SldDecimal): Observable<boolean> {
    const withdraw$ = shieldOptionTradeContracts.CONTRACTS.optionTrade.pipe(take(1)).pipe(
      switchMap((contract: Contract) => {
        return this.boolExe(from(contract.withdraw(tokenAddress, withdrawAmount.toOrigin())), 'Withdraw Error:');
      })
    );

    return loadingObs(withdraw$);
  }

  public openOrder(
    token: TokenErc20,
    indexUnderling: string,
    makerAddress: string,
    optionType: ShieldOptionType,
    indexAmount: SldDecimal,
    downPrice: SldDecPrice,
    upPrice: SldDecPrice,
    deadline: number
  ): Observable<boolean> {
    const open$ = shieldOptionTradeContracts.CONTRACTS.optionTrade.pipe(take(1)).pipe(
      switchMap((contract: Contract) => {
        const isBuy: boolean = optionType === ShieldOptionType.Call;

        return this.increaseGas(
          contract.estimateGas.trade,
          indexUnderling,
          token.address,
          makerAddress,
          isBuy,
          indexAmount.toOrigin(),
          downPrice.toE18(),
          upPrice.toE18(),
          deadline
        ).pipe(
          switchMap(newGas => {
            return from(
              contract.trade(
                indexUnderling,
                token.address,
                makerAddress,
                isBuy,
                indexAmount.toOrigin(),
                downPrice.toE18(),
                upPrice.toE18(),
                deadline,
                newGas
              ) as Promise<any>
            );
          }),
          switchMap((rs: any) => {
            return from(rs.wait());
          }),
          map(rs => {
            return true;
          }),
          catchError(err => {
            return of(false);
          })
        );
      })
    );

    return loadingObs(open$);
  }

  public closeOrder(orderId: BigNumber, downPrice: SldDecPrice, upPrice: SldDecPrice): Observable<boolean> {
    const close$: Observable<any> = shieldOptionTradeContracts.CONTRACTS.optionTrade.pipe(
      take(1),
      switchMap((contract: Contract) => {
        const close$ = from(contract.closeOrder(orderId, downPrice.toE18(), upPrice.toE18()));
        return this.boolExe(close$, 'Close Failed:');
      })
    );

    return loadingObs(close$);
  }

  public addLiquidity(
    token: TokenErc20,
    indexUnderlying: ShieldUnderlyingType,
    amount: SldDecimal,
    isPrivate: boolean
  ): Observable<boolean> {
    const add$ = shieldOptionTradeContracts.CONTRACTS.liquidityManager.pipe(
      take(1),
      switchMap((manContract: Contract) => {
        const rs$ = from(
          manContract.addLiquidity(token.address, indexUnderlying, isPrivate, amount.toOrigin()) as Promise<any>
        );

        return this.boolExe(rs$, 'Add Liquidity Error:');
      })
    );

    return loadingObs(add$);
  }

  public setMakerPriPool(
    pool: ShieldMakerPrivatePoolInfo,
    isRejectOrder: boolean,
    isExclusive: boolean
  ): Observable<boolean> {
    const set$ = createContractByCurEnv(pool.priPoolAddress, ABI_PRIVATE_POOL).pipe(
      switchMap((pool: Contract) => {
        return this.boolExe(from(pool.setMakerInfo(isRejectOrder, isExclusive)), 'Pool Setting Failed:');
      })
    );

    return loadingObs(set$);
  }

  public addPriOrderMargin(
    pool: ShieldMakerPrivatePoolInfo,
    order: ShieldMakerOrderInfo,
    addAmount: SldDecimal
  ): Observable<boolean> {
    const add$ = createContractByCurEnv(pool.priPoolAddress, ABI_PRIVATE_POOL).pipe(
      switchMap((poolContract: Contract) => {
        const addAmount$ = from(poolContract.addMarginAmount(order.indexInPool, addAmount.toOrigin()));
        return this.boolExe(addAmount$, 'Add Margin Error: ');
      })
    );

    return loadingObs(add$);
  }

  public addPriOrderMarginApprove(pool: ShieldMakerPrivatePoolInfo): Observable<boolean> {
    const approve$ = this.approve(pool.token.address, pool.priPoolAddress);

    return loadingObs(approve$, i18n('trade-approve-failed'), i18n('trade-approving'));
  }

  public movePriPoolLiquidity(priPoolAddress: string, amount: SldDecimal): Observable<boolean> {
    const move$ = createContractByCurEnv(priPoolAddress, ABI_PRIVATE_POOL).pipe(
      switchMap((pool: Contract) => {
        return this.boolExe(from(pool.withdraw(amount.toOrigin())), 'Move Liquidity Error:');
      })
    );

    return loadingObs(move$);
  }

  public movePubPoolLiquidity(pubPoolAddress: string, lpAmount: SldDecimal): Observable<boolean> {
    const move$ = createContractByCurEnv(pubPoolAddress, ABI_PUBLIC_POOL).pipe(
      switchMap((pool: Contract) => {
        return this.boolExe(from(pool.withdraw(lpAmount.toOrigin())), 'Move Liquidity Error');
      })
    );

    return loadingObs(move$);
  }

  public claimRewards(tokens: TokenErc20[]): Observable<boolean> {
    const claim$ = shieldOptionTradeContracts.CONTRACTS.broker.pipe(
      take(1),
      switchMap((brokerContract: Contract) => {
        const tokenAddresses: string[] = tokens.map(one => one.address);
        const functionCall = brokerContract['claimRewards(address[])'];

        const call$ = from(functionCall(tokenAddresses));

        return this.boolExe(call$, 'Claim Error:');
      })
    );

    return loadingObs(claim$);
  }

  public migration(orderIds: BigNumber[]): Observable<boolean> {
    const migrating$ = shieldOptionTradeContracts.CONTRACTS.optionTrade.pipe(
      switchMap((contract: Contract) => {
        return this.boolExe(from(contract.migrationContract(orderIds) as Promise<any>), 'Migration Error: ');
      })
    );

    return loadingObs(migrating$);
  }

  public riskControl(orderIds: BigNumber[]): Observable<boolean> {
    const risk$ = shieldOptionTradeContracts.CONTRACTS.optionTrade.pipe(
      switchMap((contract: Contract) => {
        return this.boolExe(from(contract.riskControl(orderIds)), 'Risk Control Error: ');
      })
    );

    return loadingObs(risk$);
  }

  // -------------------------------------------------------------------------------------------------------------------

  private approve(
    tokenAddress: string,
    targetContractAddress: string,
    specifyAmount?: SldDecimal
  ): Observable<boolean> {
    return createErc20Contract(tokenAddress).pipe(
      switchMap((contract: Contract) => {
        const maxAmount: BigNumber = specifyAmount ? specifyAmount.toOrigin() : MAX_UINT_256;

        return this.boolExe(from(contract.approve(targetContractAddress, maxAmount)), 'Approve Error:');
      })
    );
  }

  private boolExe(obs$: Observable<any>, errorLabel: string): Observable<boolean> {
    return obs$.pipe(
      switchMap((rs: any) => {
        return from(rs.wait());
      }),
      map(res => {
        return true;
      }),
      catchError(err => {
        console.warn(errorLabel, err);
        return of(false);
      })
    );
  }

  private increaseGas(contractGasFun: Function, ...args: any[]): Observable<{ gasLimit: BigNumber }> {
    return from(contractGasFun(...args) as Promise<BigNumber>).pipe(
      map((gas: BigNumber) => {
        return { gasLimit: BigNumber.from(Math.ceil(gas.toNumber() * 1.5)) };
      })
    );
  }
}

export const shieldOptionTradeService = new ShieldOptionTradeService();
