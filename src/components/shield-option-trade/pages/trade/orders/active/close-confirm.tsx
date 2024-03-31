import { BaseStateComponent } from '../../../../../../state-manager/base-state-component';
import { P } from '../../../../../../state-manager/page/page-state-parser';
import { bindStyleMerger, cssPick } from '../../../../../../util/string';
import styles from './close-confirm.module.less';
import ModalRender from '../../../../../modal-render';
import { I18n } from '../../../../../i18n/i18n';
import { ShieldOrderInfo, ShieldTradePair, ShieldUnderlyingPrice } from '../../../../../../state-manager/state-types';
import { FixPadding } from '../../../../../common/content/fix-padding';
import { PairLabel } from '../../../common/pair-label';
import { ItemsBox } from '../../../../../common/content/items-box';
import { HorizonItem } from '../../../../../common/content/horizon-item';
import { OrderOptionType } from '../../../common/order-option-type';
import { TokenAmountInline } from '../../../../../common/content/token-amount-inline';
import { SldDecimal, SldDecPercent, SldDecPrice } from '../../../../../../util/decimal';
import { Observable, of, switchMap } from 'rxjs';
import { S } from '../../../../../../state-manager/contract/contract-state-parser';
import { ContractState } from '../../../../../../state-manager/interface';
import { filter, map } from 'rxjs/operators';
import { computeOrderPnl } from '../../../../utils/compute';
import { fontCss } from '../../../../../i18n/font-switch';
import { TradeFormFooter } from '../../../common/form-footer';
import { shieldOptionTradeService } from '../../../../services/shield-option-trade.service';
import { C } from '../../../../../../state-manager/cache/cache-state-parser';
import { DEFAULT_SLIPPAGE } from '../../../../const/default';
import { SortAsc } from '../../../../../common/svg/sort-asc';
import { SortDesc } from '../../../../../common/svg/sort-desc';
import { SLD_ENV_CONF } from '../../../../const/env';

type IState = {
  isMobile: boolean;
  isVisible: boolean;
  order: ShieldOrderInfo | null;
  curPrice: ShieldUnderlyingPrice | null;
};
type IProps = {};

export class CloseOrderConfirm extends BaseStateComponent<IProps, IState> {
  state: IState = {
    isMobile: P.Layout.IsMobile.get(),
    isVisible: P.Option.Trade.OrderList.Close.Visible.get(),
    order: P.Option.Trade.OrderList.Close.Order.get(),
    curPrice: null,
  };

  componentDidMount() {
    this.registerIsMobile('isMobile');
    this.registerState('isVisible', P.Option.Trade.OrderList.Close.Visible);
    this.registerState('order', P.Option.Trade.OrderList.Close.Order);
    this.registerState('curPrice', this.mergeCurPrice());
  }

  componentWillUnmount() {
    this.destroyState();
  }

  mergeCurPrice(): Observable<ContractState<ShieldUnderlyingPrice>> {
    return this.watchStateChange('order').pipe(
      filter(Boolean),
      map((order: ShieldOrderInfo) => {
        return S.Option.Oracle[order.indexUnderlying];
      })
    );
  }

  hide() {
    P.Option.Trade.OrderList.Close.Visible.set(false);
  }

  onClose() {
    if (!this.state.order) {
      return;
    }

    const close$ = C.Option.Trade.Setting.Slippage.get().pipe(
      switchMap((slippage: SldDecPercent | null) => {
        if (!this.state.order) {
          return of(false);
        }

        slippage = slippage === null ? DEFAULT_SLIPPAGE : slippage;
        const downPrice: SldDecPrice = this.state.curPrice
          ? this.state.curPrice.price.decrease(slippage)
          : SldDecPrice.ZERO;
        const upPrice: SldDecPrice = this.state.curPrice
          ? this.state.curPrice.price.increase(slippage)
          : SldDecPrice.ZERO;

        return shieldOptionTradeService.closeOrder(this.state.order.id, downPrice, upPrice);
      })
    );

    this.subOnce(close$, (done: boolean) => {
      if (done) {
        this.hide();
        this.tickState(
          S.Option.Order.ActiveList,
          S.Option.User.Account.Info,
          S.Option.Pool.Info,
          S.Option.Order.Open.Max
        );
      }
    });
  }

  render() {
    const mobileCss = this.state.isMobile ? styles.mobile : '';
    const styleMr = bindStyleMerger(mobileCss);

    if (!this.state.order || !this.state.curPrice) {
      return <></>;
    }

    const pair: ShieldTradePair = {
      indexUnderlying: this.state.order.indexUnderlying,
      quoteToken: this.state.order.token,
    };

    const { pnl } = computeOrderPnl(this.state.order);
    const isIncrease = this.state.curPrice.price.gt(this.state.order.openPrice);
    const isDecrease = this.state.curPrice.price.lt(this.state.order.openPrice);
    const percent = isIncrease
      ? SldDecPercent.fromArgs(
          this.state.order.openPrice.toDecimal(),
          this.state.curPrice.price.sub(this.state.order.openPrice).toDecimal()
        )
      : SldDecPercent.fromArgs(
          this.state.order.openPrice.toDecimal(),
          this.state.order.openPrice.sub(this.state.curPrice.price).toDecimal()
        );

    return (
      <ModalRender
        footer={null}
        title={<I18n id={'trade-close-order-confirm'} />}
        visible={this.state.isVisible}
        onCancel={this.hide.bind(this)}
        onClose={this.hide.bind(this)}
        height={480}
      >
        <FixPadding top={0} bottom={30} mobTop={0} mobBottom={20}>
          <PairLabel pair={pair} size={'small'} />
        </FixPadding>

        <div className={styleMr(styles.paramInfo)}>
          <ItemsBox gap={20}>
            <HorizonItem
              label={<I18n id={'trade-order-id'} />}
              align={'justify'}
              labelClass={styleMr(styles.paramLabel, fontCss.bold)}
            >
              <span className={styleMr(styles.value)}>#{this.state.order.id.toString()}</span>
            </HorizonItem>
            <HorizonItem
              label={<I18n id={'trade-option-type'} />}
              align={'justify'}
              labelClass={styleMr(styles.paramLabel, fontCss.bold)}
            >
              <OrderOptionType optionType={this.state.order.optionType} />
            </HorizonItem>

            <HorizonItem
              label={<I18n id={'trade-position-amount'} />}
              align={'justify'}
              labelClass={styleMr(styles.paramLabel, fontCss.bold)}
            >
              <TokenAmountInline
                amount={this.state.order.orderAmount}
                token={this.state.order.indexUnderlying}
                symClassName={styles.label}
                fix={SLD_ENV_CONF.FixDigits.Open[this.state.order.indexUnderlying]}
                rmZero={true}
              />
            </HorizonItem>
            <HorizonItem
              label={<I18n id={'trade-index-open-price'} />}
              align={'justify'}
              labelClass={styleMr(styles.paramLabel, fontCss.bold)}
            >
              <TokenAmountInline amount={this.state.order.openPrice} token={''} />
            </HorizonItem>
            <HorizonItem
              label={<I18n id={'trade-index-close-price'} />}
              align={'justify'}
              labelClass={styleMr(styles.paramLabel, fontCss.bold)}
            >
              <div className={styleMr(styles.priceIncrease)}>
                <div
                  className={styleMr(
                    styles.font14,
                    styles.line0,
                    cssPick(isIncrease, styles.long),
                    cssPick(isDecrease, styles.short)
                  )}
                >
                  <div className={styleMr(styles.pricePercent, styles.line1)}>
                    ({percent.percentFormat()}%{' '}
                    {isIncrease ? (
                      <SortAsc height={12} width={10} />
                    ) : isDecrease ? (
                      <SortDesc width={10} height={12} />
                    ) : (
                      ''
                    )}
                    )
                  </div>
                </div>

                <TokenAmountInline
                  amount={this.state.curPrice.price}
                  token={''}
                  numClassName={styleMr(cssPick(isIncrease, styles.long), cssPick(isDecrease, styles.short))}
                />
              </div>
            </HorizonItem>
            <HorizonItem
              label={<I18n id={'trade-pnl'} />}
              align={'justify'}
              labelClass={styleMr(styles.paramLabel, fontCss.bold)}
            >
              <TokenAmountInline
                amount={pnl}
                token={this.state.order.token.symbol}
                symClassName={styles.label}
                numClassName={styleMr(
                  cssPick(pnl.gtZero(), styles.long),
                  cssPick(pnl.lt(SldDecimal.ZERO), styles.short)
                )}
                rmZero={true}
                fix={SLD_ENV_CONF.FixDigits.Open[this.state.order.indexUnderlying]}
                precision={SLD_ENV_CONF.FixDigits.Open[this.state.order.indexUnderlying]}
              />
            </HorizonItem>
          </ItemsBox>
        </div>

        <FixPadding top={30} bottom={0} mobTop={20} mobBottom={0}>
          <TradeFormFooter
            doneName={<I18n id={'trade-confirm'} textUpper={'uppercase'} />}
            onDone={this.onClose.bind(this)}
            onCancel={this.hide.bind(this)}
          />
        </FixPadding>
      </ModalRender>
    );
  }
}
