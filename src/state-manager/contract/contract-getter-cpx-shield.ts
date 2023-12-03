import { Contract, ethers, BigNumber } from 'ethers';
import { concatMap, from, mergeMap, NEVER, Observable, of, switchMap, zip } from 'rxjs';
import {
  ShieldBrokerReward,
  ShieldMakerOrderInfo,
  ShieldMakerPrivatePoolInfo,
  ShieldMakerPublicPoolShare,
  ShieldOptionType,
  ShieldOrderInfo,
  ShieldOrderMigration,
  ShieldOrderOpenResult,
  ShieldOrderState,
  ShieldPoolInfo,
  ShieldTokenPoolAddress,
  ShieldTokenPoolInfo,
  ShieldTokenPoolLiquidity,
  ShieldTokenPoolLiquidityList,
  ShieldTradePair, ShieldUnderlyingType,
  ShieldUserAccountInfo,
  StateNull,
  StateNullType,
  TokenErc20,
} from '../state-types';
import { genContractCallPartial } from './contract-utils';
import { CACHE_10_MIN, CACHE_10_SEC, CACHE_3_SEC, CACHE_FOREVER, cacheService } from '../mem-cache/cache-contract';
import { catchError, map, toArray } from 'rxjs/operators';
import { SldDecimal, SldDecPercent, SldDecPrice, SldUsdValue } from '../../util/decimal';
import { E18, EMPTY_ADDRESS, MAX_UINT_256, ZERO } from '../../constant';
import {
  erc20ApprovedAmountGetter,
  erc20InfoByAddressGetter,
  erc20InfoGetter,
  erc20TotalSupplyGetter,
  erc20UserBalanceGetter,
} from './contract-getter-sim-erc20';
import { createContractByEnv, createContractByProvider } from '../const/contract-creator';
import {
  ABI_OPTION_TRADE_Copy,
  ABI_PRIVATE_POOL,
  ABI_PUBLIC_POOL,
  ABI_PUBLIC_POOL_Copy,
  ABI_UNDERLYING_ASSET,
} from '../../components/shield-option-trade/const/shield-option-abi';
import { curTimestamp } from '../../util/time';
import * as _ from 'lodash';
import { IndexUnderlyingDecimal } from '../../components/shield-option-trade/const/assets';
import { isEmptyAddress, isSameAddress, isValidAddress } from '../../util/address';
import { Network } from '../../constant/network';
import { isSN, snAssert, snRep } from '../interface-util';
import { shortAddress } from '../../util';
import { ERC20 } from '../../wallet/abi';

type Caller<T> = (promise: Promise<T>, method: string) => Observable<T>;
const optionCall: Caller<any> = genContractCallPartial('ShieldOption');
const priPoolCall: Caller<any> = genContractCallPartial('ShieldPriPool');
const pubPoolCall: Caller<any> = genContractCallPartial<any>('ShieldPubPool');
const poolManCall: Caller<any> = genContractCallPartial('ShieldPoolManager');

function genCacheKey(contract: Contract | string, key: string, param?: string): string {
  const contractAddress = typeof contract === 'string' ? contract : contract.address;
  return 'shield_contract_' + contractAddress + '_' + key + '_' + (param ? param : '');
}

export function userAccountInfoGetter(
  contract: Contract,
  takerAddress: string,
  quoteToken: TokenErc20 | null
): Observable<ShieldUserAccountInfo> {
  if (!quoteToken || !takerAddress) {
    return NEVER;
  }

  type Rs = {
    available: BigNumber;
    locked: BigNumber;
    orderAmount: BigNumber;
    orderIDs: BigNumber[];
  };
  const promise$ = contract.getAccountInfo(takerAddress, quoteToken.address) as Promise<Rs>;
  const info$: Observable<ShieldUserAccountInfo> = optionCall(
    promise$,
    `getAccountInfo(${takerAddress}, ${quoteToken.address})`
  ).pipe(
    map((rs: Rs) => {
      return {
        availableBalance: SldDecimal.fromOrigin(rs.available, quoteToken.decimal),
        lockedMargin: SldDecimal.fromOrigin(rs.locked, quoteToken.decimal),
        orderTotalCount: rs.orderAmount.toNumber(),
        activeOrderIDArr: rs.orderIDs.filter(one => !one.eq(MAX_UINT_256)),
      };
    })
  );

  const cacheKey: string = genCacheKey(contract, 'user_account_info', takerAddress + '-' + quoteToken.address);

  return cacheService.tryUseCache(info$, cacheKey, CACHE_10_SEC);
}

export function userOpenMaxAmount(
  optionContract: Contract,
  indexUnderlying: ShieldUnderlyingType,
  token: TokenErc20 | string,
  optionType: ShieldOptionType
): Observable<SldDecimal> {
  const tokenAddress: string = typeof token === 'string' ? token : token.address;
  const isBuy = optionType === ShieldOptionType.Call;
  const promise$: Promise<BigNumber> = optionContract.getMaxAmount(
    tokenAddress,
    indexUnderlying,
    isBuy
  ) as Promise<BigNumber>;

  const amount$ = optionCall(promise$, 'getMaxAmount()').pipe(
    map((amount: BigNumber) => {
      return SldDecimal.fromOrigin(amount, IndexUnderlyingDecimal);
    }),
    map((amount: SldDecimal) => {
      return SldDecimal.fromNumeric(amount.format({ fix: 1, floor: true, split: false }), IndexUnderlyingDecimal);
    }),
    catchError(err => {
      return of(SldDecimal.ZERO);
    })
  );

  return amount$;
}

export function userActiveOrderListGetter(
  contract: Contract,
  takerAddress: string,
  quoteToken: TokenErc20
): Observable<ShieldOrderInfo[]> {
  const orderList$: Observable<ShieldOrderInfo[]> = userAccountInfoGetter(contract, takerAddress, quoteToken).pipe(
    switchMap((accountInfo: ShieldUserAccountInfo) => {
      return orderListInfoGetter(contract, accountInfo.activeOrderIDArr);
    }),
    map(orders => {
      orders.reverse();

      return orders;
    })
  );

  const cacheKey: string = genCacheKey(contract, 'active_order_list', takerAddress);

  return cacheService.tryUseCache<ShieldOrderInfo[]>(orderList$, cacheKey, CACHE_10_SEC);
}

type OrderRs = {
  holder: string;
  token: string;
  isBuy: boolean;
  state: number;
  name: string;
  amount: BigNumber;
  tradingFee: BigNumber;
  liquidationFee: BigNumber;
  fundingFee: BigNumber;
  fundingFeePaid: BigNumber;
  openPrice: BigNumber;
  startTime: BigNumber;
  closePrice: BigNumber;
};

function orderInfoConvert(id: BigNumber, rs: OrderRs, optionContract: Contract): Observable<ShieldOrderInfo> {
  const tokenAddress: string = rs.token;

  return of(createContractByEnv(tokenAddress, ERC20, optionContract)).pipe(
    switchMap((erc20: Contract) => {
      return erc20InfoGetter(erc20);
    }),
    map((token: TokenErc20): ShieldOrderInfo => {
      return {
        id: id,
        takerAddress: rs.holder,
        indexUnderlying: rs.name as ShieldUnderlyingType,
        token,
        optionType: rs.isBuy ? ShieldOptionType.Call : ShieldOptionType.Put,
        orderState: rs.state as ShieldOrderState,
        orderAmount: SldDecimal.fromOrigin(rs.amount, IndexUnderlyingDecimal),
        openPrice: SldDecPrice.fromE18(rs.openPrice),
        closePrice: SldDecPrice.fromE18(rs.closePrice),
        openTime: rs.startTime.toNumber(),
        fundingFee: {
          initial: SldDecimal.fromOrigin(rs.fundingFee, token.decimal),
          paid: SldDecimal.fromOrigin(rs.fundingFeePaid, token.decimal),
        },
        tradingFee: SldDecimal.fromOrigin(rs.tradingFee, token.decimal),
        maintenanceMargin: SldDecimal.fromOrigin(rs.liquidationFee, token.decimal),
      };
    })
  );
}

export function orderListInfoGetter(optionContract: Contract, orderIds: BigNumber[]): Observable<ShieldOrderInfo[]> {
  return from(optionContract.queryOrdersInfo(orderIds) as Promise<OrderRs[]>).pipe(
    switchMap((rs: OrderRs[]) => {
      const orderInfoArr = orderIds.map((id, index) => {
        return { id, order: rs[index] };
      });

      return from(orderInfoArr).pipe(
        concatMap(one => {
          return orderInfoConvert(one.id, one.order, optionContract);
        }),
        toArray(),
        map(orders => {
          return orders.sort((a, b) => {
            return a.id.toNumber() - b.id.toNumber();
          });
        })
      );
    })
  );
}

export function orderInfoGetter(contract: Contract, orderId: BigNumber): Observable<ShieldOrderInfo> {
  const promise$ = contract.orders(orderId) as Promise<OrderRs>;

  const info$: Observable<any> = optionCall(promise$, `orders(${orderId.toString()})`).pipe(
    switchMap((rs: OrderRs): Observable<ShieldOrderInfo> => {
      return orderInfoConvert(orderId, rs, contract);
    })
  );

  const cacheKey = genCacheKey(contract, 'order_info', orderId.toString());

  return cacheService.tryUseCache(info$, cacheKey, CACHE_10_MIN);
}

export function orderListMigrationInfoGetter(
  contract: Contract,
  orderIds: BigNumber[]
): Observable<ShieldOrderMigration[]> {
  return from(orderIds).pipe(
    mergeMap((id: BigNumber) => {
      return orderMigrationInfoGetter(contract, id);
    }),
    toArray(),
    map(orders => {
      return orders.sort((a, b) => {
        return a.id.toNumber() - b.id.toNumber();
      });
    })
  );
}

export function orderMigrationInfoGetter(contract: Contract, orderId: BigNumber): Observable<ShieldOrderMigration> {
  type Rs = {
    migrationTime: BigNumber;
    regulatedTime: BigNumber;
    inPeriodHours: BigNumber;
  };

  const cacheKey: string = genCacheKey(contract, 'order_migration_info', orderId.toString());
  const info$ = optionCall(contract.migrationInfo(orderId) as Promise<Rs>, `migrationInfo(${orderId.toString()})`).pipe(
    map((rs: Rs): ShieldOrderMigration => {
      return {
        id: orderId,
        lastSettlementTime: rs.migrationTime.toNumber(),
        scheduleSettleTime: rs.regulatedTime.toNumber(),
        inPeriodHours: rs.inPeriodHours.toNumber(),
      };
    })
  );

  return cacheService.tryUseCache(info$, cacheKey, CACHE_10_SEC);
}

export function orderFundingFeeGetter(
  tradeContract: Contract,
  token: TokenErc20,
  makerAddress: string,
  baseToken: ShieldUnderlyingType,
  optionType: ShieldOptionType,
  indexAmount: SldDecimal | null
): Observable<ShieldOrderOpenResult> {
  if (!indexAmount || indexAmount.isZero()) {
    return of({
      phase0Fee: SldDecimal.ZERO,
      fundingFee: SldDecimal.ZERO,
      isLackLiquidity: false,
      isLackAvailable: false,
    });
  }

  return of(createContractByEnv(tradeContract.address, ABI_OPTION_TRADE_Copy, tradeContract)).pipe(
    switchMap((contract: Contract) => {
      const isBuy: boolean = optionType === ShieldOptionType.Call;

      return from(
        contract.trade(
          baseToken,
          token.address,
          makerAddress,
          isBuy,
          indexAmount.toOrigin(),
          ZERO,
          MAX_UINT_256,
          curTimestamp() + 3600
        ) as Promise<BigNumber>
      );
    }),
    switchMap((fee: BigNumber) => {
      return paramFundingTimesGetter(tradeContract).pipe(
        map((times: BigNumber) => {
          const fundingFee = SldDecimal.fromOrigin(fee, token.decimal); // TODO confirm funding fee decimal
          const phase0Fee = fundingFee.div(times);

          return {
            phase0Fee,
            fundingFee,
            isLackLiquidity: false,
            isLackAvailable: false,
          };
        })
      );
    }),
    catchError(err => {
      return of({
        phase0Fee: SldDecimal.ZERO,
        fundingFee: SldDecimal.ZERO,
        isLackLiquidity: true,
        isLackAvailable: false,
      });
    })
  );
}

export function calculatorFundingFeeGetter(
  tradeContract: Contract,
  token: TokenErc20,
  makerAddress: string,
  indexUnderlying: ShieldUnderlyingType,
  optionType: ShieldOptionType,
  indexAmount: SldDecimal | null
): Observable<ShieldOrderOpenResult> {
  if (!indexAmount || indexAmount.isZero()) {
    return of({
      phase0Fee: SldDecimal.ZERO,
      fundingFee: SldDecimal.ZERO,
      isLackLiquidity: false,
      isLackAvailable: false,
    });
  }

  const standard = SldDecimal.fromNumeric('0.1', indexAmount.getOriginDecimal());

  let queryAmount = indexAmount;
  while (queryAmount.gt(standard)) {
    queryAmount = queryAmount.div(BigNumber.from(2));
  }

  return userOpenMaxAmount(tradeContract, indexUnderlying, token, optionType).pipe(
    switchMap((maxAmount: SldDecimal) => {
      if (maxAmount.lt(queryAmount)) {
        return of({
          phase0Fee: SldDecimal.ZERO,
          fundingFee: SldDecimal.ZERO,
          isLackLiquidity: false,
          isLackAvailable: true,
        });
      } else {
        return orderFundingFeeGetter(tradeContract, token, makerAddress, indexUnderlying, optionType, queryAmount).pipe(
          map((res: ShieldOrderOpenResult) => {
            if (res.fundingFee.gtZero()) {
              const times: BigNumber = indexAmount.toOrigin().div(queryAmount.toOrigin());

              return Object.assign({}, res, {
                fundingFee: res.fundingFee.mul(times),
                phase0Fee: res.phase0Fee.mul(times),
              });
            } else {
              return res;
            }
          })
        );
      }
    })
  );
}

export function orderTradingFeeGetter(
  underlyingAssetAddress: string,
  openAmount: SldDecimal,
  price: SldDecPrice,
  provider: ethers.providers.Provider | ethers.Signer
): Observable<SldDecimal> {
  if (!openAmount || openAmount.isZero() || !price || !underlyingAssetAddress) {
    return of(SldDecimal.ZERO);
  }

  const tradingFeeRate$ = paramTradingFeeRateGetter(underlyingAssetAddress, provider);
  const totalValue: SldUsdValue = openAmount.toUsdValue(price);

  return tradingFeeRate$.pipe(
    map((rate: SldDecPercent) => {
      return rate.applyTo(totalValue.toDecimal());
    })
  );
}

// --------------------------------------------------

/**
 *
 * @param managerContract - manager contract
 * @param indexUnderlying - base assets
 * @param token - quote token
 */
export function tokenPoolAddressGetter(
  managerContract: Contract,
  indexUnderlying: ShieldUnderlyingType,
  token: TokenErc20
): Observable<ShieldTokenPoolAddress | StateNullType> {
  type Rs = { priPool: string; pubPool: string };

  const promise$ = managerContract.getLiquidityPool(token.address, indexUnderlying) as Promise<Rs>;
  const pools$ = poolManCall(promise$, `getLiquidityPool(${token.address}, ${indexUnderlying})`).pipe(
    map((rs: { priPool: string; pubPool: string }): ShieldTokenPoolAddress => {
      return {
        indexUnderlying: indexUnderlying,
        token,
        priPoolAddress: rs.priPool,
        pubPoolAddress: rs.pubPool,
      };
    }),
    map((address: ShieldTokenPoolAddress) => {
      if (
        isSameAddress(address.priPoolAddress, EMPTY_ADDRESS) &&
        isSameAddress(address.pubPoolAddress, EMPTY_ADDRESS)
      ) {
        return StateNull;
      } else {
        return address;
      }
    })
  );

  const keyParam = token.address + '_' + indexUnderlying;
  const cacheKey: string = genCacheKey(managerContract, 'liquidity_pool_addresses', keyParam);

  return cacheService.tryUseCache(pools$, cacheKey, CACHE_10_SEC, { console: true });
}

// --------------------------------------------------

export function tokenPoolInfoGetter0(
  managerContract: Contract,
  indexUnderlying: ShieldUnderlyingType, // base
  quoteToken: TokenErc20 // quote
): Observable<ShieldTokenPoolInfo | typeof StateNull> {
  return tokenPoolAddressGetter(managerContract, indexUnderlying, quoteToken).pipe(
    switchMap((address: ShieldTokenPoolAddress | StateNullType) => {
      return isSN(address) ? of(StateNull) : tokenPoolInfoGetter(managerContract, snAssert(address));
    })
  );
}

export function tokenPoolInfoGetter(
  managerContract: Contract,
  poolAddress: ShieldTokenPoolAddress
): Observable<ShieldTokenPoolInfo> {
  const pubInfo$ = publicPoolInfoGetter(poolAddress.pubPoolAddress, poolAddress.token, managerContract);
  const priInfo$ = privatePoolInfoGetter(poolAddress.priPoolAddress, poolAddress.token, managerContract);

  return zip(pubInfo$, priInfo$).pipe(
    map(([pubInfo, priInfo]): ShieldTokenPoolInfo => {
      return {
        indexUnderlying: poolAddress.indexUnderlying,
        token: poolAddress.token,
        priInfo: priInfo,
        pubInfo: pubInfo,
      };
    })
  );
}

export function publicPoolInfoGetter(
  pubPoolAddress: string,
  token: TokenErc20,
  managerContract: Contract
): Observable<ShieldPoolInfo> {
  if (isSameAddress(pubPoolAddress, EMPTY_ADDRESS)) {
    return of({
      poolAddress: pubPoolAddress,
      available: SldDecimal.ZERO,
      locked: SldDecimal.ZERO,
      total: SldDecimal.ZERO,
    });
  }

  type Rs = {
    depositedAmount: BigNumber;
    availableAmount: BigNumber;
    lockedAmount: BigNumber;
  };

  const cacheKey: string = genCacheKey(pubPoolAddress, 'pub_pool_info', token.address);

  const contract = createContractByEnv(pubPoolAddress, ABI_PUBLIC_POOL, managerContract);

  const info$: Observable<ShieldPoolInfo> = of(contract).pipe(
    switchMap((poolContract: Contract) => {
      const promise$: Promise<Rs> = poolContract.publicPoolInfo() as Promise<Rs>;
      return pubPoolCall(promise$, 'publicPoolInfo()');
    }),
    map((rs: Rs) => {
      return {
        poolAddress: pubPoolAddress,
        total: SldDecimal.fromOrigin(rs.depositedAmount, token.decimal),
        available: SldDecimal.fromOrigin(rs.availableAmount, token.decimal),
        locked: SldDecimal.fromOrigin(rs.lockedAmount, token.decimal),
      };
    })
  );

  return cacheService.tryUseCache(info$, cacheKey, CACHE_10_SEC);
}

export function privatePoolInfoGetter(
  priPoolAddress: string,
  token: TokenErc20,
  managerContract: Contract
): Observable<ShieldPoolInfo> {
  if (isEmptyAddress(priPoolAddress)) {
    return of({
      poolAddress: priPoolAddress,
      total: SldDecimal.ZERO,
      available: SldDecimal.ZERO,
      locked: SldDecimal.ZERO,
    });
  }

  const erc20 = createContractByEnv(token.address, ERC20, managerContract);
  const priPool = createContractByEnv(priPoolAddress, ABI_PRIVATE_POOL, managerContract);

  return of([erc20, priPool]).pipe(
    switchMap(([erc20Contract, poolContract]) => {
      const promise$ = poolContract.totalLockedLiquidity() as Promise<BigNumber>;
      const locked$: Observable<SldDecimal> = priPoolCall(promise$, 'totalLockedLiquidity()').pipe(
        map((liquidity: BigNumber) => SldDecimal.fromOrigin(liquidity, token.decimal))
      );
      const balance$ = erc20UserBalanceGetter(erc20Contract, poolContract.address, token.decimal);

      return zip(locked$, balance$);
    }),
    map(([locked, balance]): ShieldPoolInfo => {
      return {
        poolAddress: priPoolAddress,
        total: balance,
        available: balance.sub(locked),
        locked,
      };
    })
  );
}

export function privatePoolInfoGetter0(
  privatePoolContract: Contract,
  tokenErc20Contract: Contract
): Observable<ShieldPoolInfo> {
  const locked$ = from(privatePoolContract.totalLockedLiquidity() as Promise<BigNumber>).pipe(
    map(amount => {
      return SldDecimal.fromOrigin(amount, 18);
    })
  );
  const balance$ = erc20UserBalanceGetter(tokenErc20Contract, privatePoolContract.address).pipe(
    catchError(err => {
      return of(SldDecimal.ZERO);
    })
  );

  return zip(locked$, balance$).pipe(
    map(([locked, balance]) => {
      return {
        poolAddress: privatePoolContract.address,
        total: balance,
        available: balance.sub(locked),
        locked,
      };
    })
  );
}

export function publicPoolInfoGetter0(publicPoolContract: Contract, decimal: number): Observable<ShieldPoolInfo> {
  type Rs = {
    depositedAmount: BigNumber;
    availableAmount: BigNumber;
    lockedAmount: BigNumber;
  };

  return from(publicPoolContract.publicPoolInfo() as Promise<Rs>).pipe(
    map((rs: Rs) => {
      return {
        poolAddress: publicPoolContract.address,
        total: SldDecimal.fromOrigin(rs.depositedAmount, decimal),
        available: SldDecimal.fromOrigin(rs.availableAmount, decimal),
        locked: SldDecimal.fromOrigin(rs.lockedAmount, decimal),
      };
    })
  );
}

// --------------------------------------------------

export function tokenPoolLiquidityGetter(
  managerContract: Contract,
  tokenPoolAddress: ShieldTokenPoolAddress
): Observable<ShieldTokenPoolLiquidity> {
  const keyParam: string = tokenPoolAddress.token.address + '-' + tokenPoolAddress.indexUnderlying;
  const cacheKey: string = genCacheKey(managerContract, 'pool_liquidity_getter', keyParam);

  const liquidity$ = tokenPoolAddressGetter(
    managerContract,
    tokenPoolAddress.indexUnderlying,
    tokenPoolAddress.token
  ).pipe(
    switchMap((rs: ShieldTokenPoolAddress | StateNullType) => {
      const res = snRep(rs);

      if (!res) {
        return of([SldDecimal.ZERO, SldDecimal.ZERO]);
      } else {
        const pub$ = isEmptyAddress(res.pubPoolAddress)
          ? of(SldDecimal.ZERO)
          : of(createContractByEnv(res.pubPoolAddress, ABI_PUBLIC_POOL, managerContract)).pipe(
              switchMap((pubPoolContract: Contract) => {
                return publicPoolLiquidityGetter(pubPoolContract, tokenPoolAddress.token);
              })
            );

        const pri$ = isEmptyAddress(res.priPoolAddress)
          ? of(SldDecimal.ZERO)
          : privatePoolLiquidityGetter(managerContract, res.priPoolAddress, tokenPoolAddress.token);

        return zip(pub$, pri$);
      }
    }),
    map(([pubLiquidity, priLiquidity]): ShieldTokenPoolLiquidity => {
      return {
        indexUnderlying: tokenPoolAddress.indexUnderlying,
        token: tokenPoolAddress.token,
        privateLiquidity: priLiquidity,
        publicLiquidity: pubLiquidity,
      };
    })
  );

  return cacheService.tryUseCache(liquidity$, cacheKey, CACHE_10_SEC);
}

export function publicPoolLiquidityGetter(poolContract: Contract, token: TokenErc20): Observable<SldDecimal> {
  type Rs = {
    depositedAmount: BigNumber;
    availableAmount: BigNumber;
    lockedAmount: BigNumber;
  };

  const promise$: Promise<Rs> = poolContract.publicPoolInfo() as Promise<Rs>;
  const methodName = 'publicPoolInfo() for liquidity';

  const liquidity$ = pubPoolCall(promise$, methodName).pipe(
    map((rs: Rs) => {
      return SldDecimal.fromOrigin(rs.depositedAmount, token.decimal);
    })
  );

  const cacheKey: string = genCacheKey(poolContract, 'public_pool_liquidity', token.address);

  return cacheService.tryUseCache(liquidity$, cacheKey, CACHE_10_SEC);
}

export function privatePoolLiquidityGetter(
  managerContract: Contract,
  poolContractAddress: string,
  token: TokenErc20
): Observable<SldDecimal> {
  return of(createContractByEnv(token.address, ERC20, managerContract)).pipe(
    switchMap((erc20Contract: Contract) => {
      return erc20UserBalanceGetter(erc20Contract, poolContractAddress, token.decimal);
    })
  );
}

export function privatePoolUnderlyingGetter(priPoolContract: Contract): Observable<ShieldUnderlyingType> {
  return from(priPoolContract.underlyingName() as Promise<ShieldUnderlyingType>);
}

// ---------------------------------------------------------------------------------------------------------------------

export function poolTokenAddressListGetter(managerContract: Contract): Observable<string[]> {
  const lengthPromise = managerContract.getTokenListLength() as Promise<BigNumber>;
  const length$ = poolManCall(lengthPromise, 'getTokenListLength').pipe(map(count => count.toNumber()));
  const tokenAddresses$ = length$.pipe(
    switchMap((length: BigNumber) => {
      const listPromise = managerContract.getTokenList(0, length) as Promise<string[]>;
      return poolManCall(listPromise, `getTokenList(0, ${length.toString()})`);
    })
  );

  const cacheKey: string = genCacheKey(managerContract, 'token_list_address_getter');

  return cacheService.tryUseCache(tokenAddresses$, cacheKey, CACHE_10_SEC);
}

export function poolTokenErc20ListGetter(managerContract: Contract): Observable<TokenErc20[]> {
  const cacheKey: string = genCacheKey(managerContract, 'token_list_info_getter');
  const tokens$ = poolTokenAddressListGetter(managerContract).pipe(
    switchMap((tokenAddresses: string[]) => {
      return from(tokenAddresses);
    }),
    mergeMap((tokenAddress: string) => {
      return erc20InfoByAddressGetter(tokenAddress);
    }),
    toArray()
  );

  return cacheService.tryUseCache(tokens$, cacheKey, CACHE_10_SEC);
}

export function poolAddressListGetter(
  managerContract: Contract,
  indexUnderlying: ShieldUnderlyingType
): Observable<ShieldTokenPoolAddress[]> {
  const cacheKey: string = genCacheKey(managerContract, 'pool_address_list', indexUnderlying);

  const addresses$ = poolTokenErc20ListGetter(managerContract).pipe(
    switchMap((tokens: TokenErc20[]) => {
      return from(tokens);
    }),
    mergeMap((token: TokenErc20) => {
      return tokenPoolAddressGetter(managerContract, indexUnderlying, token);
    }),
    toArray(),
    map((addresses: (ShieldTokenPoolAddress | StateNullType)[]) => {
      return addresses.filter(one => !isSN(one)) as ShieldTokenPoolAddress[];
    })
  );

  return cacheService.tryUseCache(addresses$, cacheKey, CACHE_10_SEC);
}

export function poolLiquidityListGetter(
  managerContract: Contract,
  indexUnderlying: ShieldUnderlyingType
): Observable<ShieldTokenPoolLiquidityList> {
  const liquidity$ = poolAddressListGetter(managerContract, indexUnderlying).pipe(
    switchMap((addresses: ShieldTokenPoolAddress[]) => {
      return from(addresses);
    }),
    mergeMap((address: ShieldTokenPoolAddress) => {
      return tokenPoolLiquidityGetter(managerContract, address);
    }),
    toArray(),
    map((liquidity: ShieldTokenPoolLiquidity[]) => {
      const liquidityList = liquidity.sort((a, b) => {
        return a.publicLiquidity.add(a.privateLiquidity).gt(b.publicLiquidity.add(b.privateLiquidity)) ? -1 : 1;
      });

      return {
        liquidity: liquidityList,
        indexUnderlying,
      };
    })
  );

  const cacheKey: string = genCacheKey(managerContract, 'pool_liquidity_list', indexUnderlying);

  return cacheService.tryUseCache(liquidity$, cacheKey, CACHE_10_SEC, { console: true });
}

// ---------------------------------------------------------------------------------------------------------------------

export function makerPriPoolInfoListGetter(
  managerContract: Contract,
  makerAddress: string
): Observable<ShieldMakerPrivatePoolInfo[]> {
  const indexUnderlyingArr: ShieldUnderlyingType[] = Object.values(ShieldUnderlyingType);

  return from(indexUnderlyingArr).pipe(
    mergeMap((indexUnderlying: ShieldUnderlyingType) => {
      return makerPriPoolInfoListOfUnderlyingGetter(managerContract, makerAddress, indexUnderlying);
    }),
    toArray(),
    map((info: ShieldMakerPrivatePoolInfo[][]) => {
      return _.flatten(info);
    }),
    map((infoArr: ShieldMakerPrivatePoolInfo[]) => {
      return infoArr.sort((a, b) => (a.amount.gt(b.amount) ? -1 : 1));
    })
  );
}

export function makerPriPoolInfoListOfUnderlyingGetter(
  managerContract: Contract,
  makerAddress: string,
  indexUnderlying: ShieldUnderlyingType
): Observable<ShieldMakerPrivatePoolInfo[]> {
  return poolAddressListGetter(managerContract, indexUnderlying).pipe(
    switchMap((poolAddresses: ShieldTokenPoolAddress[]) => {
      return from(poolAddresses);
    }),
    mergeMap((poolAddress: ShieldTokenPoolAddress) => {
      return makerPriPoolInfoGetter(managerContract, makerAddress, poolAddress);
    }),
    toArray(),
    map((info: (ShieldMakerPrivatePoolInfo | typeof StateNull)[]) => {
      return info.filter(one => !isSN(one)) as ShieldMakerPrivatePoolInfo[];
    })
  );
}

function makerPriPoolInfoGetter(
  managerContract: Contract,
  makerAddress: string,
  poolAddress: ShieldTokenPoolAddress
): Observable<ShieldMakerPrivatePoolInfo | typeof StateNull> {
  type Rs = {
    holder: string;
    amount: BigNumber;
    availableAmount: BigNumber;
    lockedAmount: BigNumber;
    marginFee: BigNumber;
    isRejectOrder: boolean;
    isExclusive: boolean;
  };

  if (!poolAddress.priPoolAddress || isEmptyAddress(poolAddress.priPoolAddress)) {
    return of(StateNull);
  }

  const cacheKey: string = genCacheKey(poolAddress.priPoolAddress, 'maker_private_pool_info', makerAddress);

  const contract = createContractByEnv(poolAddress.priPoolAddress, ABI_PRIVATE_POOL, managerContract);
  const info$ = of(contract).pipe(
    switchMap((privatePoolContract: Contract) => {
      const isExist$: Observable<boolean> = from(privatePoolContract.makerExist(makerAddress) as Promise<boolean>);
      const account$: Observable<ShieldMakerPrivatePoolInfo | StateNullType> = from(
        privatePoolContract.account(makerAddress) as Promise<Rs>
      ).pipe(
        map((rs: Rs): ShieldMakerPrivatePoolInfo => {
          return {
            priPoolAddress: poolAddress.priPoolAddress,
            indexUnderlying: poolAddress.indexUnderlying,
            token: poolAddress.token,
            holder: rs.holder,
            amount: SldDecimal.fromOrigin(rs.amount, poolAddress.token.decimal),
            amountAvailable: SldDecimal.fromOrigin(rs.availableAmount, poolAddress.token.decimal),
            amountLocked: SldDecimal.fromOrigin(rs.lockedAmount, poolAddress.token.decimal),
            marginFee: SldDecimal.fromOrigin(rs.marginFee, poolAddress.token.decimal),
            isReject: rs.isRejectOrder,
            isExclusive: rs.isExclusive,
          };
        }),
        map(info => {
          return info.amount.isZero() && info.amountLocked.isZero() ? StateNull : Object.freeze(info);
        })
      );

      return isExist$.pipe(
        switchMap((isExist: boolean) => {
          return isExist ? account$ : of(StateNull);
        })
      );
    })
  );

  return cacheService.tryUseCache(info$, cacheKey, CACHE_10_SEC);
}

export function makerPriLiquidityGetter(
  makerAddress: string,
  priPoolAddress: string,
  provider: ethers.providers.Provider | ethers.Signer
): Observable<ShieldMakerPrivatePoolInfo | StateNullType> {
  type Rs = {
    holder: string;
    amount: BigNumber;
    availableAmount: BigNumber;
    lockedAmount: BigNumber;
    marginFee: BigNumber;
    isRejectOrder: boolean;
    isExclusive: boolean;
  };

  return createContractByProvider(priPoolAddress, ABI_PRIVATE_POOL, provider).pipe(
    switchMap((poolContract: Contract) => {
      const account$ = from(poolContract.account(makerAddress) as Promise<Rs>);
      const underlying$ = from(poolContract.underlyingName() as Promise<string>);
      const token$ = from(poolContract.tokenAddress() as Promise<string>).pipe(
        switchMap(tokenAddr => erc20InfoByAddressGetter(tokenAddr))
      );

      return zip(token$, underlying$, account$);
    }),
    map(([token, underlying, account]): ShieldMakerPrivatePoolInfo => {
      return {
        priPoolAddress: priPoolAddress,
        indexUnderlying: underlying as ShieldUnderlyingType,
        token: token,
        holder: account.holder,
        amount: SldDecimal.fromOrigin(account.amount, token.decimal),
        amountAvailable: SldDecimal.fromOrigin(account.availableAmount, token.decimal),
        amountLocked: SldDecimal.fromOrigin(account.lockedAmount, token.decimal),
        marginFee: SldDecimal.fromOrigin(account.marginFee, token.decimal),
        isReject: account.isRejectOrder,
        isExclusive: account.isExclusive,
      };
    }),
    map(info => {
      return info.amount.isZero() && info.amountLocked.isZero() ? StateNull : info;
    })
  );
}

export function makerPriPoolInfoByPairGetter(
  poolManagerContract: Contract,
  makerAddress: string,
  pair: ShieldTradePair
): Observable<ShieldMakerPrivatePoolInfo | typeof StateNull> {
  if (!pair.indexUnderlying || !pair.quoteToken) {
    return of(StateNull);
  }

  return tokenPoolAddressGetter(poolManagerContract, pair.indexUnderlying, pair.quoteToken).pipe(
    switchMap((address: ShieldTokenPoolAddress | StateNullType) => {
      return isSN(address)
        ? of(StateNull)
        : makerPriPoolInfoGetter(poolManagerContract, makerAddress, snAssert(address));
    })
  );
}

export function makerAddLiquidityApprovedAmountGetter(
  token: TokenErc20 | ShieldTradePair,
  makerAddress: string,
  poolManager: Contract | string
): Observable<SldDecimal> {
  const erc20Token: TokenErc20 | null = _.has(token, 'quoteToken')
    ? (_.get(token, 'quoteToken')! as TokenErc20)
    : _.has(token, 'address') && _.has(token, 'decimal')
    ? (token as TokenErc20)
    : null;

  if (!erc20Token) {
    return of(SldDecimal.ZERO);
  }

  return erc20ApprovedAmountGetter(makerAddress, erc20Token, poolManager, erc20Token.decimal);
}

export function makerPriPoolApprovedGetter(
  pool: ShieldMakerPrivatePoolInfo | null,
  userAddress: string,
  provider: ethers.providers.Provider | ethers.Signer
): Observable<SldDecimal> {
  if (!pool) {
    return of(SldDecimal.ZERO);
  }

  return createContractByProvider(pool.priPoolAddress, ABI_PRIVATE_POOL, provider).pipe(
    switchMap((contract: Contract) => {
      return erc20ApprovedAmountGetter(userAddress, pool.token, contract);
    })
  );
}

export function makerPriPoolDetailsGetter(
  optionContract: Contract,
  pool: ShieldMakerPrivatePoolInfo | null,
  provider: ethers.providers.Provider | ethers.Signer
): Observable<ShieldMakerOrderInfo[]> {
  type Rs = {
    orderIndex?: number;
    orderID: BigNumber;
    marginAmount: BigNumber;
    marginFee: BigNumber;
    makerAddr: string;
    locked: boolean;
  };

  if (!pool) {
    return of([]);
  }

  return createContractByProvider(pool.priPoolAddress, ABI_PRIVATE_POOL, provider).pipe(
    switchMap((contract: Contract) => {
      const length$ = from(contract.getMakerOrderLength() as Promise<BigNumber>);

      return zip(length$, of(contract));
    }),
    switchMap(([length, contract]) => {
      const startIndex = 0;
      return from(contract.getMakerOrderList(startIndex, length) as Promise<Rs[]>).pipe(
        map((res: Rs[]) => {
          return res.map((one, index) => {
            return Object.assign({}, one, { orderIndex: index + startIndex });
          });
        })
      );
    }),
    map(res => {
      return res.filter(one => one.locked && isSameAddress(one.makerAddr, pool.holder));
    }),
    switchMap((res: Rs[]) => {
      const ids: BigNumber[] = res.map(one => one.orderID);
      const orders$ = orderListInfoGetter(optionContract, ids);
      const migrations$ = orderListMigrationInfoGetter(optionContract, ids);

      return zip(orders$, of(res), migrations$);
    }),
    map(([orders, res, migrations]: [ShieldOrderInfo[], Rs[], ShieldOrderMigration[]]) => {
      const orderArr: ShieldMakerOrderInfo[] = res
        .map((one: Rs): ShieldMakerOrderInfo | null => {
          const order: ShieldOrderInfo | undefined = orders.find(order => order.id.eq(one.orderID));
          const migration: ShieldOrderMigration | undefined = migrations.find(migration =>
            migration.id.eq(one.orderID)
          );

          if (!order || !migration) {
            return null;
          }

          return {
            indexInPool: BigNumber.from(one.orderIndex),
            id: one.orderID,
            taker: order.takerAddress,
            maker: one.makerAddr,
            orderStatus: order.orderState,
            indexUnderlying: order.indexUnderlying,
            token: order.token,
            optionType: order.optionType,
            openPrice: order.openPrice,
            orderAmount: order.orderAmount,
            openTime: order.openTime,
            fundingInfo: {
              init: order.fundingFee.initial,
              paid: order.fundingFee.paid,
              scheduleMigration: migration.scheduleSettleTime,
              lastMigration: migration.lastSettlementTime,
            },
            makerMarginAmount: SldDecimal.fromOrigin(one.marginAmount, order.token.decimal),
            makerMaintenanceLocked: SldDecimal.fromOrigin(one.marginFee, order.token.decimal),
          };
        })
        .filter((one: ShieldMakerOrderInfo | null) => !!one)
        .map(one => one as ShieldMakerOrderInfo);

      return orderArr;
    })
  );
}

export function makerPriPoolOrdersGetter(
  optionContract: Contract,
  pool: ShieldMakerPrivatePoolInfo,
  makerOrderIndexes: BigNumber[]
): Observable<ShieldMakerOrderInfo[]> {
  type Rs = {
    orderIndex?: number;
    orderID: BigNumber;
    marginAmount: BigNumber;
    marginFee: BigNumber;
    makerAddr: string;
    locked: boolean;
  };

  function genOrderInfo(
    rs: Rs,
    orders: ShieldOrderInfo[],
    migrations: ShieldOrderMigration[]
  ): ShieldMakerOrderInfo | null {
    const order = orders.find(order => order.id.eq(rs.orderID));
    const migration = migrations.find(mig => mig.id.eq(rs.orderID));

    if (!order || !migration) {
      return null;
    }

    return {
      indexInPool: BigNumber.from(rs.orderIndex),
      id: rs.orderID,
      taker: order.takerAddress,
      maker: rs.makerAddr,
      orderStatus: order.orderState,
      indexUnderlying: order.indexUnderlying,
      token: order.token,
      optionType: order.optionType,
      openPrice: order.openPrice,
      orderAmount: order.orderAmount,
      openTime: order.openTime,
      fundingInfo: {
        init: order.fundingFee.initial,
        paid: order.fundingFee.paid,
        scheduleMigration: migration.scheduleSettleTime,
        lastMigration: migration.lastSettlementTime,
      },
      makerMarginAmount: SldDecimal.fromOrigin(rs.marginAmount, order.token.decimal),
      makerMaintenanceLocked: SldDecimal.fromOrigin(rs.marginFee, order.token.decimal),
    };
  }

  return of(createContractByEnv(pool.priPoolAddress, ABI_PRIVATE_POOL, optionContract)).pipe(
    switchMap((poolContract: Contract) => {
      return from(poolContract.getMakerLiquidityOrders(makerOrderIndexes) as Promise<Rs[]>);
    }),
    map((orders: Rs[]) => {
      return orders.map((order, index) => {
        return Object.assign({}, order, { orderIndex: makerOrderIndexes[index].toNumber() });
      });
    }),
    switchMap((res: Rs[]) => {
      const ids: BigNumber[] = res.map(one => one.orderID);
      const orders$: Observable<ShieldOrderInfo[]> = orderListInfoGetter(optionContract, ids);
      const migrations$: Observable<ShieldOrderMigration[]> = orderListMigrationInfoGetter(optionContract, ids);

      return zip(of(res), orders$, migrations$);
    }),
    map(([res, orders, migrations]) => {
      return res
        .map((rs: Rs) => genOrderInfo(rs, orders, migrations))
        .filter(one => Boolean(one)) as ShieldMakerOrderInfo[];
    })
  );
}

export function makerPriPoolOrderGetter(
  optionContract: Contract,
  pool: ShieldMakerPrivatePoolInfo,
  makerOrderIndex: BigNumber
): Observable<ShieldMakerOrderInfo> {
  return makerPriPoolOrdersGetter(optionContract, pool, [makerOrderIndex]).pipe(
    map((orders: ShieldMakerOrderInfo[]) => {
      return orders[0];
    })
  );
}

// ------------------------------------------------------

export function makerPubPoolInfoListGetter(
  managerContract: Contract,
  makerAddress: string
): Observable<ShieldMakerPublicPoolShare[]> {
  return makerPubPoolInfoListOfUnderlyingGetter(managerContract, makerAddress, ShieldUnderlyingType.ETH);
}

export function makerPubPoolInfoListOfUnderlyingGetter(
  managerContract: Contract,
  makerAddress: string,
  indexUnderlying: ShieldUnderlyingType
): Observable<ShieldMakerPublicPoolShare[]> {
  return poolAddressListGetter(managerContract, indexUnderlying).pipe(
    switchMap((poolAddresses: ShieldTokenPoolAddress[]) => {
      return from(poolAddresses);
    }),
    mergeMap((poolAddress: ShieldTokenPoolAddress) => {
      return makerPubPoolInfoGetter(managerContract, makerAddress, poolAddress);
    }),
    toArray(),
    map((infoArr: (ShieldMakerPublicPoolShare | StateNullType)[]) => {
      return infoArr.filter(addr => !isSN(addr)) as ShieldMakerPublicPoolShare[];
    }),
    map(pools => {
      return pools.sort((a, b) => {
        return a.lpShare.gt(b.lpShare) ? -1 : 1;
      });
    })
  );
}

export function makerPubPoolInfoGetter(
  managerContract: Contract,
  makerAddress: string,
  pubPoolAddress: ShieldTokenPoolAddress
): Observable<ShieldMakerPublicPoolShare | StateNullType> {
  if (isEmptyAddress(pubPoolAddress.pubPoolAddress)) {
    return of(StateNull);
  }

  const cacheKey: string = genCacheKey(
    pubPoolAddress.pubPoolAddress,
    'maker_public_pool_info',
    makerAddress + '-' + pubPoolAddress.indexUnderlying
  );

  const info$ = makerPubPoolShareGetter(
    makerAddress,
    pubPoolAddress.pubPoolAddress,
    managerContract.provider,
    pubPoolAddress.token
  );

  return cacheService.tryUseCache(info$, cacheKey, CACHE_10_SEC);
}

export function makerPubPoolShareGetter(
  makerAddress: string,
  poolAddress: string,
  provider: ethers.providers.Provider | ethers.Signer,
  token?: TokenErc20
): Observable<ShieldMakerPublicPoolShare | StateNullType> {
  return createContractByProvider(poolAddress, ABI_PUBLIC_POOL, provider).pipe(
    switchMap((pubPoolContract: Contract) => {
      const balance$ = erc20UserBalanceGetter(pubPoolContract, makerAddress);
      const totalSupply$ = erc20TotalSupplyGetter(pubPoolContract);
      const lpToken$ = erc20InfoGetter(pubPoolContract);

      const token$ = token
        ? of(token)
        : from(pubPoolContract.tokenAddress() as Promise<string>).pipe(
            switchMap(tokenAddr => {
              return erc20InfoByAddressGetter(tokenAddr);
            })
          );

      return zip(balance$, totalSupply$, lpToken$, of(pubPoolContract), token$);
    }),
    switchMap(([balance, totalSupply, lpToken, pubPoolContract, token]) => {
      if (balance.isZero()) {
        return of(StateNull);
      }

      const price$ = from(pubPoolContract.getTokenAmountByLPToken(balance.toOrigin()) as Promise<BigNumber>).pipe(
        map((tokenAmount: BigNumber) => {
          return tokenAmount.mul(E18).div(balance.toOrigin());
        })
      );

      return price$.pipe(
        map((lpPrice): ShieldMakerPublicPoolShare => {
          return {
            poolAddress: poolAddress,
            lp: lpToken,
            token: token,
            lpBalance: balance,
            lpTotalSupply: totalSupply,
            lpShare: SldDecPercent.fromArgs(totalSupply, balance),
            lpPrice: SldDecimal.fromOrigin(lpPrice, 18),
          };
        })
      );
    })
  );
}

export function makerPubPoolWithdrawReceiveGetter(
  publicPoolShare: ShieldMakerPublicPoolShare,
  lpAmount: SldDecimal | null,
  provider: ethers.providers.Provider | ethers.Signer
): Observable<SldDecimal> {
  if (!lpAmount || lpAmount.isZero()) {
    return of(SldDecimal.ZERO);
  }

  return createContractByProvider(publicPoolShare.poolAddress, ABI_PUBLIC_POOL_Copy, provider).pipe(
    switchMap((contract: Contract) => {
      return from(contract.withdraw(lpAmount.toOrigin()) as Promise<BigNumber>);
    }),
    map((tokenAmount: BigNumber) => {
      return SldDecimal.fromOrigin(tokenAmount, publicPoolShare.token.decimal);
    })
  );
}

// ---------------------------------------------------------------------------------------------------------------------

export function searchTokenGetter(
  searchAddress: string,
  network: Network,
  provider: ethers.providers.Provider | ethers.Signer
): Observable<TokenErc20 | typeof StateNull> {
  if (!isValidAddress(searchAddress)) {
    return of(StateNull);
  }

  try {
    return createContractByProvider(searchAddress, ERC20, provider).pipe(
      switchMap((contract: Contract) => {
        return erc20InfoGetter(contract);
      }),
      catchError(err => {
        return of(StateNull);
      })
    );
  } catch (err) {
    return of(StateNull);
  }
}

// ---------------------------------------------------------------------------------------------------------------------

export function brokerAllRewardsGetter(
  managerContract: Contract,
  brokerContract: Contract,
  userAddress: string
): Observable<ShieldBrokerReward[]> {
  const cacheKey: string = genCacheKey(brokerContract, 'broker_all_rewards', userAddress);
  const rewards$ = poolTokenErc20ListGetter(managerContract).pipe(
    switchMap((tokens: TokenErc20[]) => {
      return from(tokens);
    }),
    mergeMap((token: TokenErc20) => {
      return brokerRewardsGetter(brokerContract, userAddress, token);
    }),
    toArray(),
    map((rewards: ShieldBrokerReward[]) => {
      return rewards.filter(one => one.amount.gtZero());
    }),
    catchError(err => {
      console.warn(err);
      return of([]);
    })
  );

  return cacheService.tryUseCache(rewards$, cacheKey, CACHE_10_SEC);
}

export function brokerRewardsGetter(
  brokerContract: Contract,
  userAddress: string,
  tokenErc20: TokenErc20
): Observable<ShieldBrokerReward> {
  const cacheParam = shortAddress(userAddress) + '-' + shortAddress(tokenErc20.address);
  const cacheKey: string = genCacheKey(brokerContract, 'broker_rewards', cacheParam);

  const reward$ = from(brokerContract.rewards(userAddress, tokenErc20.address) as Promise<BigNumber>).pipe(
    map((reward: BigNumber) => {
      const amount = SldDecimal.fromOrigin(reward, tokenErc20.decimal);

      return {
        amount,
        token: tokenErc20,
      };
    }),
    catchError(err => {
      return of({ amount: SldDecimal.ZERO, token: tokenErc20 });
    })
  );

  return cacheService.tryUseCache(reward$, cacheKey, CACHE_3_SEC);
}

export function inviterGetter(brokerContract: Contract, userAddress: string): Observable<string> {
  const cacheKey: string = genCacheKey(brokerContract, 'broker_inviter', userAddress);
  const inviter$ = from(brokerContract.inviters(userAddress) as Promise<string>);

  return cacheService.tryUseCache(inviter$, cacheKey, CACHE_FOREVER);
}

// ---------------------------------------------------------------------------------------------------------------------

export function paramFundingTimesGetter(optionContract: Contract): Observable<BigNumber> {
  const cacheKey: string = genCacheKey(optionContract, 'migration_period');
  const period$ = from(optionContract.migrationPeriod() as Promise<BigNumber>);

  return cacheService.tryUseCache(period$, cacheKey, CACHE_FOREVER);
}

export function paramFundingPeriodGetter(optionContract: Contract): Observable<BigNumber> {
  const cacheKey: string = genCacheKey(optionContract, 'funding_period');
  const period$ = paramFundingTimesGetter(optionContract).pipe(
    map(times => {
      return BigNumber.from(Math.ceil((24 * 3600) / times.toNumber()));
    })
  );

  return cacheService.tryUseCache(period$, cacheKey, CACHE_FOREVER);
}

export function paramFundingRateMatrixGetter(optionContract: Contract): Observable<SldDecPercent[]> {
  const cacheKey = genCacheKey(optionContract, 'funding_matrix_arr');

  const matrix$ = from(optionContract.getFundingFeeRateMatrix() as Promise<BigNumber[]>).pipe(
    map((rates: BigNumber[]) => {
      return rates.map(one => SldDecPercent.fromOrigin(one, 18));
    })
  );

  return cacheService.tryUseCache(matrix$, cacheKey, CACHE_FOREVER);
}

export function paramFundingRateGetter(optionContract: Contract, dayIndex: number): Observable<SldDecPercent> {
  const cacheKey = genCacheKey(optionContract, 'funding_rate', dayIndex.toString());
  const promise = optionContract.fundingFeeRateMatrix(dayIndex) as Promise<BigNumber>;
  const rate$ = optionCall(promise, `fundingFeeRateMatrix(${dayIndex})`).pipe(
    map((num: BigNumber) => {
      return SldDecPercent.fromOrigin(num, 18);
    })
  );

  return cacheService.tryUseCache(rate$, cacheKey, CACHE_FOREVER);
}

export function paramTradingFeeRateGetter(
  underlyingAddress: string,
  provider: ethers.providers.Provider | ethers.Signer
) {
  const rate$ = createContractByProvider(underlyingAddress, ABI_UNDERLYING_ASSET, provider).pipe(
    switchMap((underlyingContract: Contract) => {
      return from(underlyingContract.tradingFeeRate() as Promise<BigNumber>);
    }),
    map(rate => {
      return SldDecPercent.fromOrigin(rate, 18);
    })
  );

  const cacheKey: string = genCacheKey(underlyingAddress, 'trading_fee');

  return cacheService.tryUseCache(rate$, cacheKey, CACHE_FOREVER);
}

export function paramMMarginRateGetter(
  underlyingAddress: string,
  provider: ethers.providers.Provider | ethers.Signer
): Observable<SldDecPercent> {
  const rate$ = createContractByProvider(underlyingAddress, ABI_UNDERLYING_ASSET, provider).pipe(
    switchMap((underlyingContract: Contract) => {
      return from(underlyingContract.liquidationFeeRate() as Promise<BigNumber>);
    }),
    map(rate => {
      return SldDecPercent.fromOrigin(rate, 18);
    })
  );

  const cacheKey: string = genCacheKey(underlyingAddress, 'liquidation_fee_rate');

  return cacheService.tryUseCache(rate$, cacheKey, CACHE_FOREVER);
}

export function paramRiskFundAddrGetter(optionContract: Contract): Observable<string> {
  const cacheKey: string = genCacheKey(optionContract, 'risk_fund_addr');
  const address$ = from(optionContract.riskFundAddr() as Promise<string>);

  return cacheService.tryUseCache(address$, cacheKey, CACHE_FOREVER);
}

export function paramBrokerPortionGetter(optionContract: Contract): Observable<SldDecPercent> {
  const cacheKey: string = genCacheKey(optionContract, 'broker_portion');
  const percent$ = from(optionContract.brokerPortion() as Promise<BigNumber>).pipe(
    map((portion: BigNumber) => {
      return SldDecPercent.fromOrigin(portion, 2);
    })
  );

  return cacheService.tryUseCache(percent$, cacheKey, CACHE_FOREVER);
}

//

export function riskFundBalanceGetter(optionContract: Contract, token: TokenErc20 | null): Observable<SldDecimal> {
  if (!token) {
    return of(SldDecimal.ZERO);
  }

  return paramRiskFundAddrGetter(optionContract).pipe(
    switchMap((riskFundAddress: string) => {
      return erc20UserBalanceGetter(token, riskFundAddress, token.decimal);
    })
  );
}
