import { BaseStateComponent } from '../../../../../../state-manager/base-state-component';
import { P } from '../../../../../../state-manager/page/page-state-parser';
import { bindStyleMerger } from '../../../../../../util/string';
import styles from './kline.module.less';
import { asyncScheduler } from 'rxjs';

import { ShieldUnderlyingType } from '../../../../../../state-manager/state-types';

type IState = {
  isMobile: boolean;
  duration: number;
};
type IProps = {
  baseToken: ShieldUnderlyingType;
  height: number;
};

const getTimezone = () => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch (e) {
    return 'Asia/Hong_Kong';
  }
};

export class KLineCharts extends BaseStateComponent<IProps, IState> {
  state: IState = {
    isMobile: P.Layout.IsMobile.get(),
    duration: P.Option.Trade.Market.ChartDuration.KLine.get(),
  };

  private readonly containerId = 'tradingview_e8e7c';
  private divBox: HTMLDivElement | null = null;
  private widget: any;

  componentDidMount() {
    this.registerIsMobile('isMobile');
    this.registerState('duration', P.Option.Trade.Market.ChartDuration.KLine);

    this.draw();
  }

  componentWillUnmount() {
    this.destroyState();
  }

  componentDidUpdate(prevProps: Readonly<IProps>, prevState: Readonly<IState>, snapshot?: any) {
    if (this.props.baseToken !== prevProps.baseToken || this.state.duration !== prevState.duration) {
      this.draw();
    }
  }

  private genInterval(seconds: number): string {
    const minutes: number = Math.floor(seconds / 60);
    const days: number = Math.floor(seconds / (24 * 3600));

    if (days > 0) {
      return `${days}D`;
    } else {
      return minutes.toString();
    }
  }

  refCallback(dom: HTMLDivElement | null) {
    if (!dom) {
      return;
    }

    if (!this.divBox || this.divBox !== dom) {
      this.divBox = dom;
    }
  }

  draw() {
    if (!this.widget) {
      this.createWidget();
    } else {
      this.createWidget();
    }
  }

  private createWidget() {
    if (!window['TradingView'] || !this.divBox) {
      return;
    }

    const symbolId: string = `BINANCE:${this.props.baseToken}USD`;

    const TradingView = window['TradingView'];
    const options = {
      autosize: true,
      symbol: symbolId,
      interval: this.genInterval(this.state.duration),
      timezone: getTimezone(),
      theme: 'Light',
      style: '1',
      locale: 'zh',
      toolbar_bg: '#f1f3f6',
      enable_publishing: false,
      allow_symbol_change: true,
      container_id: this.containerId,
      favorites: {
        intervals: ['1D', '3D', '3W', 'W', 'M'],
      },
      disabled_features: ['header_symbol_search', 'header_resolutions', 'header_compare', 'border_around_the_chart'],
      enabled_features: ['move_logo_to_main_pane'],
    };

    asyncScheduler.schedule(() => {
      this.widget = new TradingView.widget(options);
      this.widget.postMessage.on('symbolInfo', arg => {});
    });
  }

  render() {
    const mobileCss = this.state.isMobile ? styles.mobile : '';
    const styleMr = bindStyleMerger(mobileCss);

    return (
      <div className={styleMr(styles.wrapperKline, 'tradingview-widget-container')}>
        <div id={this.containerId} ref={this.refCallback.bind(this)} style={{ height: `${this.props.height}px` }} />
      </div>
    );
  }
}
