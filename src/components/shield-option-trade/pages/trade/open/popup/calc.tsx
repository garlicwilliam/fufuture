import { BaseStateComponent } from '../../../../../../state-manager/base-state-component';
import { P } from '../../../../../../state-manager/page/page-state-parser';
import { bindStyleMerger, StyleMerger } from '../../../../../../util/string';
import styles from './calc.module.less';
import { CalculatorOutlined } from '@ant-design/icons';
import { SldOverlay, TriggerEvent } from '../../../../../common/overlay/overlay';
import { OverlayCard } from '../../../common/overlay-card';
import { ReactNode } from 'react';
import { fontCss } from '../../../../../i18n/font-switch';
import { minDecimal, SldDecimal, SldDecPercent } from '../../../../../../util/decimal';
import { DecimalNumInput } from '../../../../../common/input/num-input-decimal';
import { I18n } from '../../../../../i18n/i18n';
import { TokenAmountInline } from '../../../../../common/content/token-amount-inline';
import { ShieldOrderOpenResult, ShieldUnderlyingType, TokenErc20 } from '../../../../../../state-manager/state-types';
import { ItemsBox } from '../../../../../common/content/items-box';
import { OverlayClose } from '../../../../../common/icon/overlay-close';
import { HorizonItem } from '../../../../../common/content/horizon-item';
import { S } from '../../../../../../state-manager/contract/contract-state-parser';
import { BigNumber } from 'ethers';
import { ZERO } from '../../../../../../constant';
import { DeltaTime, displayDuration } from '../../../../../../util/time';
import { TokenLabel } from '../../../common/token-label';
import { IndexUnderlyingDecimal } from '../../../../const/assets';
import { FixPadding } from '../../../../../common/content/fix-padding';
import { shieldOptionMatrixService } from '../../../../services/shield-option-matrix.service';
import { combineLatest, Observable, of, switchMap, zip } from 'rxjs';
import { filter, finalize, map, startWith, take } from 'rxjs/operators';
import { PendingHolder } from '../../../../../common/progress/pending-holder';
import { computeOrderLaterPhaseFundingFee } from '../../../../utils/compute';
import { walletState } from '../../../../../../state-manager/wallet/wallet-state';
import { SLD_ENV_CONF } from '../../../../const/env';

type PState = { isMobile: boolean };
type PProps = {
  index: number;
  fee: SldDecimal;
  loading?: boolean;
  precision: number;
};

class Phase extends BaseStateComponent<PProps, PState> {
  state: PState = {
    isMobile: P.Layout.IsMobile.get(),
  };

  componentDidMount() {
    this.registerIsMobile('isMobile');
  }

  componentWillUnmount() {
    this.destroyState();
  }

  render() {
    const mobileCss = this.state.isMobile ? styles.mobile : '';
    const styleMr = bindStyleMerger(mobileCss);

    return (
      <div className={styleMr(styles.wrapperPhase)}>
        <div className={styleMr(styles.index)}>
          <I18n id={'trade-fund-phase'} /> {this.props.index}
        </div>

        <div className={styleMr(styles.valueFee)}>
          <PendingHolder loading={!!this.props.loading} useIcon={true}>
            <TokenAmountInline
              amount={this.props.fee}
              token={''}
              fix={this.props.precision}
              precision={this.props.precision}
              rmZero={true}
              short={true}
            />
          </PendingHolder>
        </div>
      </div>
    );
  }
}

type IState = {
  isMobile: boolean;
  quoteToken: TokenErc20 | null;
  indexUnderlying: ShieldUnderlyingType;
  forceClose: TriggerEvent | undefined;
  fundingPeriod: BigNumber;

  userMaxOpen: SldDecimal;
  userOpenAmount: SldDecimal | null;

  userMaxHoldPhase: SldDecimal;
  userHoldPhase: SldDecimal | null;

  firstFundingFee: ShieldOrderOpenResult | null;
  firstFundingFeePending: boolean;

  defaultPhaseFunding: SldDecimal[];
  defaultPhaseFundingPending: boolean;

  phaseHoldFundingFee: SldDecimal | null;
  phaseHoldFundingFeePending: boolean;
};
type IProps = {};

export class Calc extends BaseStateComponent<IProps, IState> {
  state: IState = {
    isMobile: P.Layout.IsMobile.get(),
    quoteToken: P.Option.Trade.Pair.Quote.get(),
    indexUnderlying: P.Option.Trade.Pair.Base.get(),
    forceClose: undefined,
    fundingPeriod: ZERO,
    userMaxOpen: SldDecimal.ZERO,
    userOpenAmount: P.Option.Trade.Calculator.OpenAmount.get(),

    userMaxHoldPhase: SldDecimal.fromNumeric('364', 0),
    userHoldPhase: P.Option.Trade.Calculator.PhaseHold.get(),

    firstFundingFee: null,
    firstFundingFeePending: false,

    defaultPhaseFunding: [],
    defaultPhaseFundingPending: false,

    phaseHoldFundingFee: null,
    phaseHoldFundingFeePending: false,
  };

  private maxAmount = SldDecimal.fromNumeric('999999', IndexUnderlyingDecimal);
  private defaultPhases = [0, 1, 2, 3, 4, 5];

  componentDidMount() {
    this.registerIsMobile('isMobile');
    this.registerState('quoteToken', P.Option.Trade.Pair.Quote);
    this.registerState('fundingPeriod', S.Option.Params.Funding.Period);
    this.registerState('indexUnderlying', P.Option.Trade.Pair.Base);
    this.registerState('userMaxOpen', S.Option.Order.Open.Max);
    this.registerState('userOpenAmount', P.Option.Trade.Calculator.OpenAmount);
    this.registerState('firstFundingFee', S.Option.Order.Calc.FundingFee);
    this.registerStatePending('firstFundingFeePending', S.Option.Order.Calc.FundingFee);
    this.registerObservable('defaultPhaseFunding', this.mergeDefaultPhaseFundingFee());
    this.registerObservable('userMaxHoldPhase', this.mergeMaxPhase());
    this.registerState('userHoldPhase', P.Option.Trade.Calculator.PhaseHold);
    this.registerObservable('phaseHoldFundingFee', this.mergePhaseHoldFundingFee());
  }

  componentWillUnmount() {
    this.destroyState();
  }

  onClose() {
    this.updateState({ forceClose: { date: new Date(), action: 'hide' } });
  }

  /**
   * Compute one phase funding fee
   * @param phase0Fee - first phase funding fee
   * @param phase - phase index
   * @param dailyTimes - migration times one day
   * @param dayRates - funding fee rates array by day index
   *
   * @private
   */
  private computePhaseFee(
    phase0Fee: SldDecimal,
    phase: number,
    dailyTimes: number,
    dayRates: SldDecPercent[]
  ): SldDecimal {
    const dayIndex: number = Math.floor(phase / dailyTimes);
    const useRate: SldDecPercent = dayRates[dayIndex];
    return useRate.applyTo(phase0Fee);
  }

  /**
   * Compute funding fee form phase0 to phaseCount - 1
   * @param phase0Fee - first phase funding fee
   * @param phaseCount - phase count from phase 0
   * @param dailyTimes - migration times one day
   * @param dayRates - funding fee rates array by day index
   * @private
   */
  // private computePhaseFeeTotal(
  //   phase0Fee: SldDecimal,
  //   phaseCount: number,
  //   dailyTimes: number,
  //   dayRates: SldDecPercent[]
  // ): SldDecimal {
  //   const phaseIndexes = arrayInteger(phaseCount, 0);
  //
  //   return phaseIndexes
  //     .map(phase => {
  //       return this.computePhaseFee(phase0Fee, phase, dailyTimes, dayRates);
  //     })
  //     .reduce((acc, cur) => {
  //       return acc.add(cur);
  //     }, SldDecimal.ZERO);
  // }

  /**
   * Compute phase funding fee array from phase index array
   * @param phase0Fee - first phase funding fee
   * @param phaseIndex - phase index
   * @param dailyTimes - migration times one day
   * @param dayRates - funding fee rates array by day index
   * @private
   */
  private computePhaseFeeArray(
    phase0Fee: SldDecimal,
    phaseIndex: number[],
    dailyTimes: number,
    dayRates: SldDecPercent[]
  ): SldDecimal[] {
    return phaseIndex.sort().map(phase => {
      return this.computePhaseFee(phase0Fee, phase, dailyTimes, dayRates);
    });
  }

  private mergeDefaultPhaseFundingFee(): Observable<SldDecimal[]> {
    const first$ = this.watchStateChange('firstFundingFee');
    const rates$ = walletState.NETWORK.pipe(
      switchMap(network => {
        return shieldOptionMatrixService.getDayRates(0, this.defaultPhases.length, network);
      })
    );
    const times$ = S.Option.Params.Funding.DailyTimes.get().pipe(map(times => times.toNumber()));

    return combineLatest([first$, rates$, times$]).pipe(
      filter(([first, dayRates, dailyTimes]) => !!first),
      map(
        ([first, dayRates, dailyTimes]) =>
          [first, dayRates, dailyTimes] as [ShieldOrderOpenResult, SldDecPercent[], number]
      ),
      map(([first, dayRates, dailyTimes]) => {
        return this.computePhaseFeeArray(first.phase0Fee, this.defaultPhases, dailyTimes, dayRates);
      })
    );
  }

  private mergeMaxPhase(): Observable<SldDecimal> {
    return S.Option.Params.Funding.DailyTimes.watch().pipe(
      map(dailyTimes => {
        return SldDecimal.fromOrigin(BigNumber.from(dailyTimes.toNumber() * 364), 0);
      })
    );
  }

  private mergePhaseHoldFundingFee(): Observable<SldDecimal> {
    const phaseCount$: Observable<number> = P.Option.Trade.Calculator.PhaseHold.watch().pipe(
      map(count => {
        return count ? Number(count.toNumeric()) : 0;
      })
    );
    const firstFund$ = this.watchStateChange('firstFundingFee');
    const network$ = walletState.NETWORK;
    return combineLatest([firstFund$, phaseCount$, network$]).pipe(
      switchMap(([firstFund, phaseCount, network]) => {
        if (!phaseCount || !firstFund || firstFund.fundingFee.isZero()) {
          return of(SldDecimal.ZERO);
        }

        const dayRates$: Observable<SldDecPercent[]> = shieldOptionMatrixService.getDayRates(0, phaseCount, network);
        const dayTimes$ = S.Option.Params.Funding.DailyTimes.get().pipe(map(times => times.toNumber()));

        return zip(dayTimes$, dayRates$).pipe(
          startWith(false),
          filter(val => {
            this.updateState({ phaseHoldFundingFeePending: true });
            return Boolean(val);
          }),
          take(1),
          map(val => val as [number, SldDecPercent[]]),
          map(([dailyTimes, dayRates]) => {
            return computeOrderLaterPhaseFundingFee(0, phaseCount, dayRates, firstFund.phase0Fee, dailyTimes);
          }),
          finalize(() => {
            this.updateState({ phaseHoldFundingFeePending: false });
          })
        );
      })
    );
  }

  genOverlay(styleMr: StyleMerger, ops: { fixDigit: number }): ReactNode {
    const period: DeltaTime = displayDuration(this.state.fundingPeriod.toNumber());

    return (
      <OverlayCard>
        <div className={styleMr(styles.overlay)}>
          <OverlayClose padding={4} onClose={this.onClose.bind(this)} />

          <div className={styleMr(styles.title, fontCss.bold)}>
            <I18n id={'trade-funding-schedule'} />
          </div>

          <FixPadding top={20} bottom={24} mobTop={20} mobBottom={24}>
            <ItemsBox gap={20}>
              <div className={styleMr(styles.phaseInfo)}>
                <HorizonItem
                  label={<I18n id={'trade-fund-settlement-cycle'} />}
                  align={'justify'}
                  labelClass={styleMr(styles.label)}
                  valueClass={styleMr(styles.value)}
                  className={styleMr(styles.phaseHour)}
                >
                  <I18n id={'trade-hours'} params={{ num: period.totalHours }} />
                </HorizonItem>

                <HorizonItem
                  label={<I18n id={'trade-fees-funding'} />}
                  align={'justify'}
                  labelClass={styleMr(styles.label)}
                  valueClass={styleMr(styles.value)}
                  className={styleMr(styles.fundToken)}
                >
                  {this.state.quoteToken ? <TokenLabel token={this.state.quoteToken} size={'tiny'} /> : <></>}
                </HorizonItem>

                <HorizonItem
                  label={<I18n id={'trade-open-amount'} />}
                  align={'justify'}
                  labelClass={styleMr(styles.label)}
                  className={styleMr(styles.openAmount)}
                >
                  <DecimalNumInput
                    originDecimal={IndexUnderlyingDecimal}
                    parentClassName={styleMr(styles.decNumInput)}
                    className={styleMr(styles.openAmountForm)}
                    inputClassName={styleMr(styles.openAmountInput)}
                    banDefaultStyle={true}
                    suffix={<span className={styleMr(styles.label)}>{this.state.indexUnderlying}</span>}
                    min={SldDecimal.ZERO}
                    max={this.maxAmount}
                    disabled={this.state.userMaxOpen.lt(minDecimal(ops.fixDigit, IndexUnderlyingDecimal))}
                    value={this.state.userOpenAmount}
                    fix={ops.fixDigit}
                    onChange={val => P.Option.Trade.Calculator.OpenAmount.set(val)}
                  />
                </HorizonItem>
              </div>

              <div className={styleMr(styles.phaseList)}>
                <Phase
                  precision={ops.fixDigit}
                  index={0}
                  loading={this.state.firstFundingFeePending}
                  fee={this.state.firstFundingFee?.phase0Fee || SldDecimal.ZERO}
                />
                <Phase index={1} precision={ops.fixDigit} fee={this.state.defaultPhaseFunding[1] || SldDecimal.ZERO} />
                <Phase index={2} precision={ops.fixDigit} fee={this.state.defaultPhaseFunding[2] || SldDecimal.ZERO} />
                <Phase index={3} precision={ops.fixDigit} fee={this.state.defaultPhaseFunding[3] || SldDecimal.ZERO} />
                <Phase index={4} precision={ops.fixDigit} fee={this.state.defaultPhaseFunding[4] || SldDecimal.ZERO} />
                <Phase index={5} precision={ops.fixDigit} fee={this.state.defaultPhaseFunding[5] || SldDecimal.ZERO} />
              </div>
            </ItemsBox>
          </FixPadding>

          <ItemsBox gap={12}>
            <div className={styleMr(styles.tips)}>
              <I18n id={'trade-funding-calc-title'} />
            </div>

            <div className={styleMr(styles.calcRes)}>
              <div className={styleMr(styles.calcInput)}>
                <DecimalNumInput
                  min={SldDecimal.ZERO}
                  max={this.state.userMaxHoldPhase}
                  originDecimal={0}
                  fix={0}
                  parentClassName={styleMr(styles.decNumInput)}
                  className={styleMr(styles.inputForm)}
                  banDefaultStyle={true}
                  mustInt={true}
                  value={this.state.userHoldPhase}
                  onChange={val => P.Option.Trade.Calculator.PhaseHold.set(val)}
                />

                <div className={styleMr(styles.phase)}>
                  <I18n id={'trade-fund-phase'} />
                </div>
              </div>

              <div className={styleMr(styles.calcOutput)}>
                <PendingHolder loading={this.state.phaseHoldFundingFeePending} useIcon={true}>
                  <TokenAmountInline
                    amount={this.state.phaseHoldFundingFee}
                    token={this.state.quoteToken?.symbol || ''}
                    symClassName={styleMr(styles.label)}
                    short={true}
                    rmZero={true}
                    fix={ops.fixDigit}
                    precision={ops.fixDigit}
                  />
                </PendingHolder>
              </div>
            </div>
          </ItemsBox>
        </div>
      </OverlayCard>
    );
  }

  render() {
    const mobileCss = this.state.isMobile ? styles.mobile : '';
    const styleMr = bindStyleMerger(mobileCss);

    const fixDigit = SLD_ENV_CONF.FixDigits.Open[this.state.indexUnderlying];

    return (
      <div className={styleMr(styles.wrapperCalc)}>
        <SldOverlay
          shiftPadding={16}
          offset={4}
          useArrow={false}
          trigger={'click'}
          overlay={this.genOverlay(styleMr, { fixDigit })}
          placement={'top-start'}
          forceTriggerEvent={this.state.forceClose}
        >
          <div className={styleMr(styles.innerCalc)}>
            <I18n id={'trade-fees-funding'} />{' '}
            <span className={styleMr(styles.icon)}>
              <CalculatorOutlined />
            </span>
          </div>
        </SldOverlay>
      </div>
    );
  }
}
