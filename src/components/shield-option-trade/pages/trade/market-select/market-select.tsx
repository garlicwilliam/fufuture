import { BaseStateComponent } from '../../../../../state-manager/base-state-component';
import { P } from '../../../../../state-manager/page/page-state-parser';
import { bindStyleMerger, cssPick } from '../../../../../util/string';
import styles from './market-select.module.less';
import {ShieldUnderlyingType, TokenErc20} from '../../../../../state-manager/state-types';
import { Visible } from '../../../../builtin/hidden';
import { isDocumentClickInArea } from '../../../../../util/dom';
import { map, tap } from 'rxjs/operators';
import { asyncScheduler, combineLatest, Observable } from 'rxjs';
import { ArrowDouble } from '../../../../common/svg/arrow-double';
import { ShieldIndexFundingPair } from './market-summary/index-funding-pair';
import { IndexFundingInfo } from './market-summary/index-funding-info';
import { ExtendTrigger } from './market-summary/extend-trigger';
import { MarketExtendContent } from './market-extend/extend-content';

type IState = {
  isMobile: boolean;
  baseToken: ShieldUnderlyingType;
  quoteToken: TokenErc20 | null;
  isExtend: boolean;
  curTab: ShieldUnderlyingType;
};
type IProps = {
  className?: string;
};

export class MarketSelect extends BaseStateComponent<IProps, IState> {
  state: IState = {
    isMobile: P.Layout.IsMobile.get(),
    baseToken: P.Option.Trade.Pair.Base.get(),
    quoteToken: P.Option.Trade.Pair.Quote.get(),
    isExtend: P.Option.Trade.Select.Extend.get(),
    curTab: P.Option.Trade.Select.IndexUnderlying.get(),
  };

  private readonly containerId = 'market_select_wrapper';

  componentDidMount() {
    this.registerIsMobile('isMobile');

    this.registerState('baseToken', P.Option.Trade.Pair.Base);
    this.registerState('quoteToken', P.Option.Trade.Pair.Quote);
    this.registerState('isExtend', P.Option.Trade.Select.Extend);
    this.registerState('curTab', P.Option.Trade.Select.IndexUnderlying);

    this.sub(this.watchClickEvent());
  }

  componentWillUnmount() {
    this.destroyState();
  }

  watchClickEvent(): Observable<any> {
    const isExt$ = P.Option.Trade.Select.Extend.watch();
    const isInDom$ = isDocumentClickInArea([this.containerId]).pipe(map((event: [Event, boolean]) => event[1]));

    return combineLatest([isExt$, isInDom$]).pipe(
      map(([isExtend, isInDom]) => {
        return isExtend && !isInDom;
      }),
      tap((needClose: boolean) => {
        if (needClose) {
          P.Option.Trade.Select.Extend.set(false);
        }
      })
    );
  }

  onExt() {
    asyncScheduler.schedule(() => {
      P.Option.Trade.Select.Extend.set(!this.state.isExtend);
    });
  }

  render() {
    const mobileCss = this.state.isMobile ? styles.mobile : '';
    const styleMr = bindStyleMerger(mobileCss);

    return (
      <div className={styleMr(styles.place, this.props.className)}>
        <div id={this.containerId} className={styleMr(styles.wrapperSelect, cssPick(this.state.isExtend, styles.ext))}>
          <div className={styleMr(styles.summary)}>
            <ShieldIndexFundingPair className={styleMr(styles.title)} />
            <IndexFundingInfo className={styleMr(styles.info)} isExt={this.state.isExtend} />
            <ExtendTrigger
              className={styleMr(styles.trigger)}
              isExt={this.state.isExtend}
              onClick={this.onExt.bind(this)}
            />
          </div>

          <div className={styleMr(styles.extend, cssPick(this.state.isExtend, styles.ext))}>
            <Visible when={this.state.isExtend}>
              <MarketExtendContent />

              <div className={styleMr(styles.close)} onClick={this.onExt.bind(this)}>
                <ArrowDouble rotate={180} />
              </div>
            </Visible>
          </div>
        </div>
      </div>
    );
  }
}
