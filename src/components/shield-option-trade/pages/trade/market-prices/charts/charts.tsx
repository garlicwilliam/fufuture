import { BaseStateComponent } from '../../../../../../state-manager/base-state-component';
import { P } from '../../../../../../state-manager/page/page-state-parser';
import { bindStyleMerger } from '../../../../../../util/string';
import styles from './charts.module.less';
import { ECharts, EChartsOption } from 'echarts';
import * as echarts from 'echarts';
import { PriceDuration, TokenPriceHistory } from '../../../../../../state-manager/state-types';
import { D } from '../../../../../../state-manager/database/database-state-parser';
import { Resize } from '../../../../../common/utils/resize';

type IState = {
  isMobile: boolean;
  historyData: TokenPriceHistory | null;
  duration: PriceDuration;
  width: number;
};
type IProps = {
  height: number;
};

export class PriceCharts extends BaseStateComponent<IProps, IState> {
  state: IState = {
    isMobile: P.Layout.IsMobile.get(),
    historyData: null,
    duration: P.Option.Trade.Market.ChartDuration.Price.get(),
    width: 0,
  };

  private div: HTMLDivElement | null = null;
  private chartInstance: ECharts | null = null;

  componentDidMount() {
    this.registerIsMobile('isMobile');
    this.registerState('historyData', D.Option.PriceUnderlying);
    this.registerState('duration', P.Option.Trade.Market.ChartDuration.Price);

    this.draw(false);
  }

  componentWillUnmount() {
    this.destroyState();
    this.destroyChart();
  }

  componentDidUpdate(prevProps: Readonly<IProps>, prevState: Readonly<IState>, snapshot?: any) {
    if (this.state.historyData !== prevState.historyData) {
      const needClear: boolean =
        this.state.historyData?.underlying !== prevState.historyData?.underlying ||
        this.state.historyData?.network !== prevState.historyData?.network ||
        this.state.historyData?.duration !== prevState.historyData?.duration;

      this.draw(needClear);
    }
  }

  onUpdateWidth(width: number) {
    this.updateState({ width });
    this.resize();
  }

  private initChartInstance() {
    if (this.div && this.chartInstance === null) {
      this.chartInstance = echarts.init(this.div);
    }
  }

  private destroyChart() {
    if (this.chartInstance) {
      this.chartInstance.dispose();
      this.chartInstance = null;
      this.div = null;
    }
  }

  private refCallback(dom: HTMLDivElement) {
    if (dom && this.div !== dom) {
      this.destroyChart();

      this.div = dom;
      this.initChartInstance();
    }
  }

  private draw(clear: boolean) {
    if (!this.chartInstance) {
      return;
    }

    if (clear) {
      this.chartInstance.clear();
    }

    const data: [number, number][] = this.state.historyData?.history || [];
    const mini: number = this.state.historyData?.minPrice || 0;

    const option = this.genOption(data, mini, this.state.duration);
    this.chartInstance.setOption(option, true);
  }

  private resize() {
    if (this.chartInstance) {
      this.chartInstance.resize();
    }
  }

  private genOption(data: [number, number][], min: number, duration: PriceDuration): EChartsOption {
    const Rule: { [k in PriceDuration]: string } = {
      DAY: '{HH}:{mm}',
      WEEK: '{MM}-{dd}',
      MONTH: '{MM}/{dd}',
    };
    // const Intervals = {
    //   DAY: 1 * 3600 * 1000,
    //   WEEK: 2 * 24 * 3600 * 1000,
    //   MONTH: 7 * 24 * 3600 * 1000,
    // };
    const timeFormat = Rule[duration];

    return {
      grid: {
        left: 0,
        right: 0,
        bottom: 50,
        top: 0,
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          animation: false,
          type: 'cross',
          lineStyle: {
            color: '#003FE6',
          },
          triggerTooltip: true,
        },
        showContent: true,
        formatter: params => {
          const price = (params[0].value[1] as number).toFixed(2);
          return `$${price}`;
        },
      },
      xAxis: {
        type: 'time',
        axisLabel: {
          formatter: timeFormat,
          fontSize: 14,
          hideOverlap: true,
          lineHeight: 70,
        },
        boundaryGap: false,
        axisLine: {
          show: false,
        },
        axisTick: {
          show: false,
        },
      },
      yAxis: {
        type: 'value',
        show: false,
        boundaryGap: [0, 0],
        min: min,
      },
      series: [
        {
          type: 'line',
          smooth: true,
          sampling: 'average',
          showSymbol: false,
          itemStyle: {
            color: '#1346FF',
            borderColor: '#1346FF',
          },
          lineStyle: {
            width: 1,
            opacity: 0.8,
            color: '#1346ff',
          },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                {
                  offset: 0,
                  color: 'rgba(19,70,255,0.15)', // 0% 处的颜色
                },
                {
                  offset: 1,
                  color: 'rgba(19,70,255, 0)', // 100% 处的颜色
                },
              ],
            },
          },
          data,
        },
      ],
    };
  }

  render() {
    const mobileCss = this.state.isMobile ? styles.mobile : '';
    const styleMr = bindStyleMerger(mobileCss);

    return (
      <div className={styleMr(styles.wrapperCharts)}>
        <Resize onResize={this.onUpdateWidth.bind(this)} />
        <div
          id={'market_price_chart'}
          ref={this.refCallback.bind(this)}
          style={{ height: `${this.props.height}px`, width: '100%' }}
        />
      </div>
    );
  }
}
