import { from, mergeMap, Observable, of, switchMap, zip } from 'rxjs';
import {
  ShieldOrderInfoRs,
  ShieldMakerOrderInfo,
  ShieldMakerPrivatePoolInfo,
  ShieldOrderFundPhaseInfo,
  ShieldOrderInfo,
  ShieldOrderMigration,
  ShieldUnderlyingType,
} from '../../../state-manager/state-types';
import { S } from '../../../state-manager/contract/contract-state-parser';
import {
  computeOrderNextPhaseFundingInfo,
  computeOrderPhaseDayIndex,
  OrderNextPhaseFundingMetaInfo,
  PhaseFundingFeeMeta,
} from '../utils/compute';
import {
  makerPriPoolOrderGetter,
  orderInfoGetter,
  orderListMigrationInfoGetter,
} from '../../../state-manager/contract/contract-getter-cpx-shield';
import { shieldOptionTradeContracts } from '../contract/shield-option-trade-contract';
import { filter, map, take, tap, toArray } from 'rxjs/operators';
import { shieldOptionMatrixService } from './shield-option-matrix.service';
import { SldDecimal, SldDecPercent, SldDecPrice } from '../../../util/decimal';
import { arrayInteger } from '../../../util/array';
import { Contract, BigNumber } from 'ethers';
import { getHttpProvider } from '../../../wallet/http-provider';
import { contractNetwork, createChainContract } from '../../../state-manager/const/contract-creator';
import { ABI_CHAIN_LINK, ABI_OPTION_TRADE } from '../const/shield-option-abi';
import { linkAnswerGetter } from '../../../state-manager/contract/contract-getter-sim-link';
import { SLD_ENV_CONF } from '../const/env';
import { Network } from '../../../constant/network';
import * as net from 'net';

export class ShieldOrderService {
  public fillOrdersFundPhaseInfo(ordersRs: ShieldOrderInfoRs): Observable<ShieldOrderInfoRs> {
    const orders = ordersRs.orders;

    return this.getOrderListFundPhaseInfo(ordersRs.network, orders).pipe(
      map((phaseInfos: ShieldOrderFundPhaseInfo[]) => {
        orders.forEach(order => {
          const phaseInfo = phaseInfos.find(one => one.id.eq(order.id)) as ShieldOrderFundPhaseInfo;
          order.phaseInfo = phaseInfo;
        });

        return orders;
      }),
      map((orders: ShieldOrderInfo[]) => {
        return orders.sort((a, b) => {
          return b.openTime - a.openTime;
        });
      }),
      map(orders => {
        ordersRs.orders = orders;

        return ordersRs;
      })
    );
  }

  public getOrderListFundPhaseInfo(
    network: Network,
    orders: ShieldOrderInfo[]
  ): Observable<ShieldOrderFundPhaseInfo[]> {
    return shieldOptionTradeContracts.CONTRACTS.optionTrade.pipe(
      filter(contract => contractNetwork(contract) === network),
      take(1),
      switchMap(contract => {
        const dailyTimes$ = S.Option.Params.Funding.DailyTimes.get();
        const orderIds: BigNumber[] = orders.map(order => order.id);
        const migrations$ = orderListMigrationInfoGetter(contract, orderIds);

        return zip(dailyTimes$, migrations$, of(orders));
      }),
      switchMap(([dailyTimes, migrations, orders]) => {
        return from(orders).pipe(
          mergeMap((order: ShieldOrderInfo) => {
            const migration = migrations.find(one => one.id.eq(order.id)) as ShieldOrderMigration;
            const metaInfo = computeOrderNextPhaseFundingInfo(order, migration, dailyTimes.toNumber());
            return this.metaToShieldOrderFundPhaseInfo(network, order, metaInfo);
          }),
          toArray()
        );
      })
    );
  }

  public getMakerPriPoolOrder(
    pool: ShieldMakerPrivatePoolInfo,
    orderMakerIndex: BigNumber
  ): Observable<ShieldMakerOrderInfo> {
    return shieldOptionTradeContracts.CONTRACTS.optionTrade.pipe(
      take(1),
      switchMap((optionContract: Contract) => {
        return makerPriPoolOrderGetter(optionContract, pool, orderMakerIndex);
      })
    );
  }

  public getOrderByHttpRpc(orderId: number, network: Network): Observable<ShieldOrderInfo | null> {
    const provider = getHttpProvider(network);

    if (!provider) {
      return of(null);
    }

    const optionAddress: string | undefined = SLD_ENV_CONF.Supports[network]?.Addresses.trade.optionTrade;

    if (!optionAddress) {
      return of(null);
    }

    return of(optionAddress).pipe(
      map(contractAddress => {
        return createChainContract(contractAddress, ABI_OPTION_TRADE, provider, network);
      }),
      switchMap((contract: Contract) => {
        return orderInfoGetter(contract, BigNumber.from(orderId));
      })
    );
  }

  public getOrderAssetsPrice(indexUnderlying: ShieldUnderlyingType, network: Network): Observable<SldDecPrice | null> {
    const contractAddress: string = (
      indexUnderlying === ShieldUnderlyingType.ETH
        ? SLD_ENV_CONF.Supports[network]?.Oracles.ETH?.address
        : SLD_ENV_CONF.Supports[network]?.Oracles.BTC?.address
    )!;

    const provider = getHttpProvider(network);
    if (!provider) {
      return of(null);
    }

    return of(contractAddress).pipe(
      map(oracleAddress => {
        return createChainContract(oracleAddress, ABI_CHAIN_LINK, provider, network);
      }),
      switchMap((contract: Contract) => {
        return linkAnswerGetter(contract);
      })
    );
  }

  // -------------------------------------------------------------------------------------------------------------------

  private metaToShieldOrderFundPhaseInfo(
    network: Network,
    order: ShieldOrderInfo,
    info: OrderNextPhaseFundingMetaInfo
  ): Observable<ShieldOrderFundPhaseInfo> {
    //
    const laterMeta: PhaseFundingFeeMeta[] = arrayInteger(6, info.nextPhase.phaseIndex).map(phaseIndex => {
      return this.genLaterFundingFeeMeta(phaseIndex, info.phaseDuration, info.overFundingFee || []);
    });

    const laterFees$ = from(laterMeta).pipe(
      mergeMap(meta => {
        return this.getPhaseFundingFee(network, meta, info.day0Fee);
      }),
      toArray()
    );

    const owed$ = this.getOwedFundingFee(network, info.owedFundingFee || [], info.day0Fee);

    return zip(owed$, laterFees$, of(info)).pipe(
      map(([owed, laterFees, info]) => {
        if (owed.gtZero()) {
          const next = laterFees.find(one => one.phaseIndex === info.nextPhase.phaseIndex);
          if (next) {
            next.fundingFee = next.fundingFee.add(owed);
          }
        }

        return {
          id: order.id,
          nextPhase: info.nextPhase.phaseIndex,
          laterPhases: laterFees.sort((a, b) => a.phaseIndex - b.phaseIndex),
        };
      })
    );
  }

  private genLaterFundingFeeMeta(
    phaseIndex: number,
    phaseDuration: number,
    overFundingFee: PhaseFundingFeeMeta[]
  ): PhaseFundingFeeMeta {
    const over = overFundingFee.length > 0 ? overFundingFee.find(one => one.phaseIndex === phaseIndex) : undefined;

    return {
      phaseIndex,
      dayIndex: computeOrderPhaseDayIndex(phaseIndex, phaseDuration),
      duration: over ? phaseDuration - over.duration : phaseDuration,
    };
  }

  private getPhaseFundingFee(
    network: Network,
    metaInfo: PhaseFundingFeeMeta,
    day0Fee: SldDecimal
  ): Observable<{ phaseIndex: number; fundingFee: SldDecimal }> {
    return shieldOptionMatrixService.getRate(metaInfo.dayIndex, network).pipe(
      map((rate: SldDecPercent) => {
        const dayDuration = BigNumber.from(24 * 3600);
        return rate.applyTo(day0Fee).mul(BigNumber.from(metaInfo.duration)).div(dayDuration);
      }),
      map((fundingFee: SldDecimal) => {
        return { phaseIndex: metaInfo.phaseIndex, fundingFee };
      })
    );
  }

  private getOwedFundingFee(
    network: Network,
    owedInfo: PhaseFundingFeeMeta[],
    day0Fee: SldDecimal
  ): Observable<SldDecimal> {
    if (owedInfo.length === 0) {
      return of(SldDecimal.ZERO);
    }

    return from(owedInfo).pipe(
      mergeMap((meta: PhaseFundingFeeMeta) => {
        return this.getPhaseFundingFee(network, meta, day0Fee);
      }),
      toArray(),
      map((fees: { fundingFee: SldDecimal }[]) => {
        return fees
          .map(one => one.fundingFee)
          .reduce((acc, cur) => {
            return acc.add(cur);
          }, SldDecimal.ZERO);
      })
    );
  }
}

export const shieldOrderService = new ShieldOrderService();
