import { from, mergeMap, Observable, of, switchMap, zip } from 'rxjs';
import {
  ShieldMakerOrderInfo,
  ShieldMakerPrivatePoolInfo,
  ShieldOrderFundPhaseInfo,
  ShieldOrderInfo,
  ShieldOrderMigration, ShieldUnderlyingType,
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
import { map, take, toArray } from 'rxjs/operators';
import { shieldOptionMatrixService } from './shield-option-matrix.service';
import { SldDecimal, SldDecPercent, SldDecPrice } from '../../../util/decimal';
import { arrayInteger } from '../../../util/array';
import { Contract, BigNumber } from 'ethers';
import { getHttpProvider } from '../../../wallet/http-provider';
import { createChainContract } from '../../../state-manager/const/contract-creator';
import { ABI_CHAIN_LINK, ABI_OPTION_TRADE } from '../const/shield-option-abi';
import { linkAnswerGetter } from '../../../state-manager/contract/contract-getter-sim-link';
import { SLD_ENV_CONF } from '../const/env';

export class ShieldOrderService {
  public fillOrdersFundPhaseInfo(orders: ShieldOrderInfo[]): Observable<ShieldOrderInfo[]> {
    return this.getOrderListFundPhaseInfo(orders).pipe(
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
      })
    );
  }

  public getOrderListFundPhaseInfo(orders: ShieldOrderInfo[]): Observable<ShieldOrderFundPhaseInfo[]> {
    return shieldOptionTradeContracts.CONTRACTS.optionTrade.pipe(
      take(1),
      switchMap(contract => {
        const dailyTimes$ = S.Option.Params.Funding.DailyTimes.get();
        const orderIds: BigNumber[] = orders.map(order => order.id);
        const migrations$ = orderListMigrationInfoGetter(contract, orderIds);

        return zip(dailyTimes$, migrations$, of(orders));
      }),
      switchMap(([dailyTimes, migrations, orders]) => {
        return from(orders).pipe(
          switchMap(order => {
            const migration = migrations.find(one => one.id.eq(order.id)) as ShieldOrderMigration;
            const metaInfo = computeOrderNextPhaseFundingInfo(order, migration, dailyTimes.toNumber());

            return this.metaToShieldOrderFundPhaseInfo(order, metaInfo);
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

  public getOrderByHttpRpc(orderId: number): Observable<ShieldOrderInfo | null> {
    const provider = getHttpProvider(SLD_ENV_CONF.CurNetwork);

    if (!provider) {
      return of(null);
    }

    const optionAddress: string = SLD_ENV_CONF.Addresses.optionTrade;

    return of(optionAddress).pipe(
      map(contractAddress => {
        return createChainContract(contractAddress, ABI_OPTION_TRADE, provider, SLD_ENV_CONF.CurNetwork);
      }),
      switchMap((contract: Contract) => {
        return orderInfoGetter(contract, BigNumber.from(orderId));
      })
    );
  }

  public getOrderAssetsPrice(indexUnderlying: ShieldUnderlyingType): Observable<SldDecPrice | null> {
    const contractAddress: string = (
      indexUnderlying === ShieldUnderlyingType.ETH ? SLD_ENV_CONF.Addresses.ethOracle : SLD_ENV_CONF.Addresses.btcOracle
    )!;

    const provider = getHttpProvider(SLD_ENV_CONF.CurNetwork);
    if (!provider) {
      return of(null);
    }

    return of(contractAddress).pipe(
      map(oracleAddress => {
        return createChainContract(oracleAddress, ABI_CHAIN_LINK, provider, SLD_ENV_CONF.CurNetwork);
      }),
      switchMap((contract: Contract) => {
        return linkAnswerGetter(contract);
      })
    );
  }

  // -------------------------------------------------------------------------------------------------------------------

  private metaToShieldOrderFundPhaseInfo(
    order: ShieldOrderInfo,
    info: OrderNextPhaseFundingMetaInfo
  ): Observable<ShieldOrderFundPhaseInfo> {
    //
    const laterMeta: PhaseFundingFeeMeta[] = arrayInteger(6, info.nextPhase.phaseIndex).map(phaseIndex => {
      return this.genLaterFundingFeeMeta(phaseIndex, info.phaseDuration, info.overFundingFee || []);
    });

    const laterFees$ = from(laterMeta).pipe(
      mergeMap(meta => {
        return this.getPhaseFundingFee(meta, info.day0Fee);
      }),
      toArray()
    );

    const owed$ = this.getOwedFundingFee(info.owedFundingFee || [], info.day0Fee);

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
    metaInfo: PhaseFundingFeeMeta,
    day0Fee: SldDecimal
  ): Observable<{ phaseIndex: number; fundingFee: SldDecimal }> {
    return shieldOptionMatrixService.getRate(metaInfo.dayIndex).pipe(
      map((rate: SldDecPercent) => {
        const dayDuration = BigNumber.from(24 * 3600);
        return rate.applyTo(day0Fee).mul(BigNumber.from(metaInfo.duration)).div(dayDuration);
      }),
      map((fundingFee: SldDecimal) => {
        return { phaseIndex: metaInfo.phaseIndex, fundingFee };
      })
    );
  }

  private getOwedFundingFee(owedInfo: PhaseFundingFeeMeta[], day0Fee: SldDecimal): Observable<SldDecimal> {
    if (owedInfo.length === 0) {
      return of(SldDecimal.ZERO);
    }

    return from(owedInfo).pipe(
      mergeMap((meta: PhaseFundingFeeMeta) => {
        return this.getPhaseFundingFee(meta, day0Fee);
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
