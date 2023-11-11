import { BaseStateComponent } from '../../../../../../../state-manager/base-state-component';
import { P } from '../../../../../../../state-manager/page/page-state-parser';
import { bindStyleMerger, cssPick } from '../../../../../../../util/string';
import styles from './duration-select.module.less';
import { ChartPrice } from '../../../../../../common/svg/chart-price';
import { ChartKline } from '../../../../../../common/svg/chart-kline';
import { PriceDuration, TradeChartType } from '../../../../../../../state-manager/state-types';
import { Visible } from '../../../../../../builtin/hidden';
import { I18n } from '../../../../../../i18n/i18n';

type IState = {
  isMobile: boolean;
  chartType: TradeChartType;
  priceDuration: PriceDuration;
  klineDuration: number;
};
type IProps = {
  layoutWidth: number;
  className?: string;
  useMobile?: boolean;
};

export class DurationSelect extends BaseStateComponent<IProps, IState> {
  state: IState = {
    isMobile: P.Layout.IsMobile.get(),
    chartType: P.Option.Trade.Market.ChartType.get(),
    priceDuration: P.Option.Trade.Market.ChartDuration.Price.get(),
    klineDuration: P.Option.Trade.Market.ChartDuration.KLine.get(),
  };

  componentDidMount() {
    this.registerIsMobile('isMobile');
    this.registerState('chartType', P.Option.Trade.Market.ChartType);
    this.registerState('priceDuration', P.Option.Trade.Market.ChartDuration.Price);
    this.registerState('klineDuration', P.Option.Trade.Market.ChartDuration.KLine);
  }

  componentWillUnmount() {
    this.destroyState();
  }

  onSetPriceDuration(duration: PriceDuration) {
    P.Option.Trade.Market.ChartDuration.Price.set(duration);
  }

  onSetKlineDuration(duration: number) {
    P.Option.Trade.Market.ChartDuration.KLine.set(duration);
  }

  render() {
    const mobileCss = this.props.useMobile || this.state.isMobile ? styles.mobile : '';

    const styleMr = bindStyleMerger(mobileCss);

    return (
      <div
        className={styleMr(
          styles.wrapperDuration,
          cssPick(this.state.chartType === 'PRICE', styles.price),
          cssPick(this.state.chartType === 'KLINE', styles.kline),
          this.props.className
        )}
      >
        <Visible when={this.state.chartType === 'PRICE'}>
          <div
            className={styleMr(styles.day, cssPick(this.state.priceDuration === 'DAY', styles.active))}
            onClick={() => this.onSetPriceDuration('DAY')}
          >
            <I18n id={'trade-duration-24h'} />
          </div>

          <div
            className={styleMr(styles.week, cssPick(this.state.priceDuration === 'WEEK', styles.active))}
            onClick={() => this.onSetPriceDuration('WEEK')}
          >
            <I18n id={'trade-duration-1w'} />
          </div>

          <div
            className={styleMr(styles.month, cssPick(this.state.priceDuration === 'MONTH', styles.active))}
            onClick={() => this.onSetPriceDuration('MONTH')}
          >
            <I18n id={'trade-duration-1m'} />
          </div>
        </Visible>

        <Visible when={this.state.chartType === 'KLINE'}>
          <div
            className={styleMr(styles.minutes, cssPick(this.state.klineDuration === 60 * 15, styles.active))}
            onClick={() => this.onSetKlineDuration(60 * 15)}
          >
            <I18n id={'trade-duration-15m'} />
          </div>

          <div
            className={styleMr(styles.hour, cssPick(this.state.klineDuration === 3600, styles.active))}
            onClick={() => this.onSetKlineDuration(3600)}
          >
            <I18n id={'trade-duration-1h'} />
          </div>

          <div
            className={styleMr(styles.hour4, cssPick(this.state.klineDuration === 3600 * 4, styles.active))}
            onClick={() => this.onSetKlineDuration(3600 * 4)}
          >
            <I18n id={'trade-duration-4h'} />
          </div>

          <div
            className={styleMr(styles.day, cssPick(this.state.klineDuration === 24 * 3600, styles.active))}
            onClick={() => this.onSetKlineDuration(24 * 3600)}
          >
            <I18n id={'trade-duration-1d'} />
          </div>

          <div
            className={styleMr(styles.week, cssPick(this.state.klineDuration === 24 * 3600 * 7, styles.active))}
            onClick={() => this.onSetKlineDuration(24 * 3600 * 7)}
          >
            <I18n id={'trade-duration-1w'} />
          </div>

          <div
            className={styleMr(styles.month, cssPick(this.state.klineDuration === 24 * 3600 * 30, styles.active))}
            onClick={() => this.onSetKlineDuration(24 * 3600 * 30)}
          >
            <I18n id={'trade-duration-1m'} />
          </div>
        </Visible>

        <div
          className={styleMr(styles.chart, cssPick(this.state.chartType === 'PRICE', styles.active))}
          onClick={() => P.Option.Trade.Market.ChartType.set('PRICE')}
        >
          <ChartPrice />
        </div>

        <div
          className={styleMr(styles.kline, cssPick(this.state.chartType === 'KLINE', styles.active))}
          onClick={() => P.Option.Trade.Market.ChartType.set('KLINE')}
        >
          <ChartKline />
        </div>
      </div>
    );
  }
}
