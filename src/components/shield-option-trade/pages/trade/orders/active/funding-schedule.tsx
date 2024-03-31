import { BaseStateComponent } from '../../../../../../state-manager/base-state-component';
import { P } from '../../../../../../state-manager/page/page-state-parser';
import { bindStyleMerger, StyleMerger } from '../../../../../../util/string';
import styles from './funding-schedule.module.less';
import { ShieldOrderInfo } from '../../../../../../state-manager/state-types';
import { CalculatorOutlined } from '@ant-design/icons';
import { SldOverlay } from '../../../../../common/overlay/overlay';
import { ReactNode } from 'react';
import { OverlayCard } from '../../../common/overlay-card';
import { I18n } from '../../../../../i18n/i18n';
import { fontCss } from '../../../../../i18n/font-switch';
import { ItemsBox } from '../../../../../common/content/items-box';
import { HorizonItem } from '../../../../../common/content/horizon-item';
import { S } from '../../../../../../state-manager/contract/contract-state-parser';
import { BigNumber } from 'ethers';
import { ZERO } from '../../../../../../constant';
import { DecimalNumInput } from '../../../../../common/input/num-input-decimal';
import { SldDecimal } from '../../../../../../util/decimal';
import { TokenAmountInline } from '../../../../../common/content/token-amount-inline';
import { combineLatest, Observable } from 'rxjs';
import { computeOrderLaterPhaseFundingFee } from '../../../../utils/compute';
import { map, tap } from 'rxjs/operators';
import { shieldOptionMatrixService } from '../../../../services/shield-option-matrix.service';
import { SLD_ENV_CONF } from '../../../../const/env';

type IState = {
  isMobile: boolean;
  fundingCycle: BigNumber;
  phaseCount: SldDecimal | null;
  phaseCountMax: SldDecimal | undefined;

  keepFundingFee: SldDecimal;
  order: ShieldOrderInfo | undefined;
};

type IProps = {
  order: ShieldOrderInfo;
};

export class OrderFundingSchedule extends BaseStateComponent<IProps, IState> {
  state: IState = {
    isMobile: P.Layout.IsMobile.get(),
    fundingCycle: ZERO,
    phaseCount: null,

    keepFundingFee: SldDecimal.ZERO,
    phaseCountMax: undefined,
    order: undefined,
  };

  componentDidMount() {
    this.registerIsMobile('isMobile');
    this.registerState('fundingCycle', S.Option.Params.Funding.Period);
    this.registerObservable('phaseCountMax', this.mergeMaxPhaseCount());
    this.registerObservable('keepFundingFee', this.mergeFundingFee());

    this.updateState({ order: this.props.order });
  }

  componentWillUnmount() {
    this.destroyState();
  }

  componentDidUpdate(prevProps: Readonly<IProps>, prevState: Readonly<IState>, snapshot?: any) {
    if (this.props.order !== prevProps.order) {
      this.updateState({ order: this.props.order });
    }
  }

  mergeFundingFee(): Observable<SldDecimal> {
    const daysRates$ = shieldOptionMatrixService.getDayRates(0, 364, this.props.order.token.network);
    const phaseCount$ = this.watchStateChange('phaseCount');
    const timesPerDay$ = S.Option.Params.Funding.DailyTimes.get();
    const order$ = this.watchStateChange('order');

    return combineLatest([phaseCount$, daysRates$, timesPerDay$, order$]).pipe(
      map(([phaseCount, daysRates, timesPerDay, order]) => {
        const count = phaseCount?.toOrigin().toNumber() || 0;

        if (!count || !order) {
          return SldDecimal.ZERO;
        }

        const fromPhase = order.phaseInfo?.nextPhase || 0;
        const fromPhaseFee = order.phaseInfo?.laterPhases[0].fundingFee;

        return computeOrderLaterPhaseFundingFee(
          fromPhase,
          count,
          daysRates,
          order.fundingFee.initial,
          timesPerDay.toNumber(),
          fromPhaseFee
        );
      }),
      tap((fee: SldDecimal) => {
        this.updateState({ keepFundingFee: fee });
      })
    );
  }

  mergeMaxPhaseCount(): Observable<SldDecimal> {
    return S.Option.Params.Funding.DailyTimes.watch().pipe(
      map(timesPerDay => {
        return SldDecimal.fromOrigin(BigNumber.from(364 * timesPerDay.toNumber()), 0);
      })
    );
  }

  genOverlay(styleMr: StyleMerger): ReactNode {
    return (
      <OverlayCard thin={true} className={styleMr(styles.overlayContent)}>
        <div className={styleMr(styles.title, fontCss.bold)}>
          <I18n id={'trade-funding-schedule'} />
        </div>

        <ItemsBox gap={20}>
          <ItemsBox gap={8}>
            <HorizonItem
              label={<I18n id={'trade-fund-settlement-cycle'} />}
              align={'justify'}
              labelClass={styles.itemLabel}
              valueClass={styles.itemValue}
              separator={':'}
            >
              <I18n id={'trade-hours'} params={{ num: this.state.fundingCycle.div(3600).toString() }} />
            </HorizonItem>

            <HorizonItem
              label={<I18n id={'trade-fund-next-phase'} />}
              align={'justify'}
              labelClass={styles.itemLabel}
              valueClass={styles.itemValue}
              separator={':'}
            >
              {this.props.order.phaseInfo?.nextPhase}
            </HorizonItem>
          </ItemsBox>

          <div className={styleMr(styles.phaseGroups)}>
            {this.props.order.phaseInfo?.laterPhases.map(one => {
              return (
                <div key={one.phaseIndex} className={styles.phase}>
                  <div className={styles.index}>
                    <I18n id={'trade-fund-phase'} />
                    {one.phaseIndex}
                  </div>
                  <div className={styles.content}>
                    {one.fundingFee.format({
                      removeZero: true,
                      fix: SLD_ENV_CONF.FixDigits.Open[this.props.order.indexUnderlying],
                      precision: SLD_ENV_CONF.FixDigits.Open[this.props.order.indexUnderlying],
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          <ItemsBox gap={12}>
            <div className={styles.subTitle}>
              <I18n id={'trade-funding-calc-keep-title'} />
            </div>

            <div className={styleMr(styles.phaseKeep)}>
              <div className={styleMr(styles.left)}>
                <DecimalNumInput
                  className={styles.numInput}
                  originDecimal={0}
                  mustInt={true}
                  max={this.state.phaseCountMax}
                  value={this.state.phaseCount}
                  onChange={val => this.updateState({ phaseCount: val })}
                />
                <I18n id={'trade-fund-phase'} />
              </div>

              <div className={styleMr(styles.right)}>
                <TokenAmountInline
                  amount={this.state.keepFundingFee}
                  token={this.props.order.token.symbol}
                  symClassName={styleMr(styles.label)}
                  short={true}
                  fix={SLD_ENV_CONF.FixDigits.Open[this.props.order.indexUnderlying]}
                  rmZero={true}
                  precision={SLD_ENV_CONF.FixDigits.Open[this.props.order.indexUnderlying]}
                />
              </div>
            </div>
          </ItemsBox>
        </ItemsBox>
      </OverlayCard>
    );
  }

  render() {
    const mobileCss = this.state.isMobile ? styles.mobile : '';
    const styleMr = bindStyleMerger(mobileCss);

    return (
      <div className={styleMr(styles.schedule)}>
        <SldOverlay trigger={'click'} overlay={this.genOverlay(styleMr)} placement={'right'}>
          <CalculatorOutlined style={{ cursor: 'pointer' }} />
        </SldOverlay>
      </div>
    );
  }
}
