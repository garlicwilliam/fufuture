import { BaseStateComponent } from '../../../../../state-manager/base-state-component';
import { P } from '../../../../../state-manager/page/page-state-parser';
import { bindStyleMerger } from '../../../../../util/string';
import styles from './market-prices.module.less';
import { PriceParam } from './param/param';
import { PriceCharts } from './charts/charts';
import { TradeChartType } from '../../../../../state-manager/state-types';
import { KLineCharts } from './charts/kline';
import { IndexUnderlyingType } from '../../../const/assets';

type IState = {
  isMobile: boolean;
  chartType: TradeChartType;
  indexUnderlying: IndexUnderlyingType;
};
type IProps = {
  className?: string;
};

export class MarketPrices extends BaseStateComponent<IProps, IState> {
  state: IState = {
    isMobile: P.Layout.IsMobile.get(),
    chartType: P.Option.Trade.Market.ChartType.get(),
    indexUnderlying: P.Option.Trade.Pair.Base.get(),
  };

  componentDidMount() {
    this.registerIsMobile('isMobile');
    this.registerState('chartType', P.Option.Trade.Market.ChartType);
    this.registerState('indexUnderlying', P.Option.Trade.Pair.Base);
  }

  componentWillUnmount() {
    this.destroyState();
  }

  render() {
    const mobileCss = this.state.isMobile ? styles.mobile : '';
    const styleMr = bindStyleMerger(mobileCss);

    return (
      <div className={styleMr(styles.wrapperPrices, this.props.className)}>
        <PriceParam />

        <div className={styleMr(styles.divider)} />

        {this.state.chartType === 'PRICE' ? (
          <PriceCharts height={this.state.isMobile ? 300 : 500} />
        ) : (
          <KLineCharts height={this.state.isMobile ? 300 : 500} baseToken={this.state.indexUnderlying} />
        )}
      </div>
    );
  }
}
