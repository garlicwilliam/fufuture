import { BaseStateComponent } from '../../../../../../state-manager/base-state-component';
import { P } from '../../../../../../state-manager/page/page-state-parser';
import { bindStyleMerger, cssPick } from '../../../../../../util/string';
import ModalRender from '../../../../../modal-render';
import styles from './open-confirm.module.less';
import {
  ShieldOptionType,
  ShieldOrderOpenResult,
  ShieldTradePair,
  ShieldUnderlyingPrice,
  TokenErc20,
} from '../../../../../../state-manager/state-types';
import { SldButton } from '../../../../../common/buttons/sld-button';
import { I18n } from '../../../../../i18n/i18n';
import { PairLabel } from '../../../common/pair-label';
import { combineLatest, EMPTY, Observable, switchMap, zip } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { SldDecimal, SldDecPrice } from '../../../../../../util/decimal';
import { S } from '../../../../../../state-manager/contract/contract-state-parser';
import { ItemsBox } from '../../../../../common/content/items-box';
import { HorizonItem } from '../../../../../common/content/horizon-item';
import { TokenAmountInline } from '../../../../../common/content/token-amount-inline';
import { FixPadding } from '../../../../../common/content/fix-padding';
import { TradeFormFooter } from '../../../common/form-footer';
import { C } from '../../../../../../state-manager/cache/cache-state-parser';
import { DEFAULT_DEADLINE, DEFAULT_SLIPPAGE } from '../../../../const/default';
import { curTimestamp } from '../../../../../../util/time';
import { shieldOptionTradeService } from '../../../../services/shield-option-trade.service';
import { EMPTY_ADDRESS } from '../../../../../../constant';
import { fontCss } from '../../../../../i18n/font-switch';
import { SLD_ENV_CONF } from '../../../../const/env';

type IState = {
  isMobile: boolean;
  isVisible: boolean;
  optionType: ShieldOptionType;
  curPair: ShieldTradePair | null;
  openAmount: SldDecimal | null;
  openPrice: ShieldUnderlyingPrice | null;
  firstFundingFee: ShieldOrderOpenResult | null;
  tradingFee: SldDecimal;
};
type IProps = {
  disabled?: boolean;
  isLack?: boolean;
};

export class OpenConfirm extends BaseStateComponent<IProps, IState> {
  state: IState = {
    isMobile: P.Layout.IsMobile.get(),
    isVisible: false,
    optionType: P.Option.Trade.Open.OptionType.get(),
    curPair: null,
    openAmount: P.Option.Trade.Open.Amount.get(),
    openPrice: null,
    firstFundingFee: null,
    tradingFee: SldDecimal.ZERO,
  };

  componentDidMount() {
    this.registerIsMobile('isMobile');
    this.registerState('optionType', P.Option.Trade.Open.OptionType);
    this.registerObservable('curPair', this.mergeCurPair());
    this.registerState('openAmount', P.Option.Trade.Open.Amount);
    this.registerState('openPrice', S.Option.Oracle.CurBaseToken);
    this.registerState('firstFundingFee', S.Option.Order.Open.FundingFee);
    this.registerState('tradingFee', S.Option.Order.Open.TradingFee);
  }

  componentWillUnmount() {
    this.destroyState();
  }

  mergeCurPair(): Observable<ShieldTradePair> {
    return combineLatest([P.Option.Trade.Pair.Base.watch(), P.Option.Trade.Pair.Quote.watch()]).pipe(
      filter(([base, quote]) => {
        return Boolean(base) && Boolean(quote);
      }),
      map(([base, quote]): ShieldTradePair => {
        return {
          indexUnderlying: base,
          quoteToken: quote as TokenErc20,
        };
      })
    );
  }

  onConfirm() {
    if (!this.state.openAmount || this.state.openAmount.isZero() || this.props.disabled) {
      return;
    }

    this.updateState({ isVisible: true });
  }

  hide() {
    this.updateState({ isVisible: false });
  }

  doOpen() {
    if (
      !this.state.openPrice ||
      !this.state.curPair ||
      this.props.disabled ||
      !this.state.openAmount ||
      this.state.openAmount.isZero()
    ) {
      return;
    }

    const open$ = zip(C.Option.Trade.Setting.Slippage.get(), C.Option.Trade.Setting.Deadline.get()).pipe(
      switchMap(([slippage, deadline]) => {
        const useSlippage = slippage || DEFAULT_SLIPPAGE;
        const useDeadline = deadline || DEFAULT_DEADLINE;

        if (
          !this.state.openPrice ||
          !this.state.curPair ||
          this.props.disabled ||
          !this.state.openAmount ||
          this.state.openAmount.isZero()
        ) {
          return EMPTY;
        }

        const up = this.state.openPrice.price.increase(useSlippage);
        const down = this.state.openPrice.price.decrease(useSlippage);
        const deadTime = curTimestamp() + useDeadline.toOrigin().toNumber() * 60;

        return shieldOptionTradeService.openOrder(
          this.state.curPair.quoteToken,
          this.state.curPair.indexUnderlying,
          EMPTY_ADDRESS,
          this.state.optionType,
          this.state.openAmount,
          down,
          up,
          deadTime
        );
      })
    );

    this.subOnce(open$, (done: boolean) => {
      if (done) {
        this.tickState(
          S.Option.User.Account.Info,
          S.Option.Order.ActiveList,
          S.Option.Order.Open.Max,
          S.Option.Pool.Info
        );
        P.Option.Trade.Open.Amount.setToDefault();
        this.hide();
      }
    });
  }

  render() {
    const mobileCss = this.state.isMobile ? styles.mobile : '';
    const styleMr = bindStyleMerger(mobileCss);

    const fixDigit: number = this.state.curPair ? SLD_ENV_CONF.FixDigits.Open[this.state.curPair.indexUnderlying] : 2;

    return (
      <>
        <SldButton
          size={'large'}
          type={'none'}
          className={styleMr(
            cssPick(this.state.optionType === ShieldOptionType.Call, styles.openBtnLong),
            cssPick(this.state.optionType === ShieldOptionType.Put, styles.openBtnShort)
          )}
          disabled={this.props.disabled}
          onClick={this.onConfirm.bind(this)}
        >
          {this.props.isLack ? (
            <I18n id={'trade-lack-liquidity'} textUpper={'uppercase'} />
          ) : (
            <I18n id={'trade-open'} textUpper={'uppercase'} />
          )}
        </SldButton>

        <ModalRender
          footer={null}
          onCancel={this.hide.bind(this)}
          onClose={this.hide.bind(this)}
          visible={this.state.isVisible}
          title={<I18n id={'trade-open-order-confirm'} />}
        >
          <FixPadding top={0} bottom={30} mobTop={0} mobBottom={20}>
            {this.state.curPair ? <PairLabel pair={this.state.curPair} size={'small'} /> : <></>}
          </FixPadding>

          <div className={styleMr(styles.paramInfo)}>
            <ItemsBox gap={20}>
              <HorizonItem
                label={<I18n id={'trade-option-type'} />}
                align={'justify'}
                labelClass={styleMr(styles.paramLabel, fontCss.bold)}
              >
                {this.state.optionType === ShieldOptionType.Call ? (
                  <span className={styleMr(styles.long, styles.line1)}>
                    <I18n id={'trade-option-type-call'} textUpper={'uppercase'} />
                  </span>
                ) : (
                  <span className={styleMr(styles.short, styles.line1)}>
                    <I18n id={'trade-option-type-put'} textUpper={'uppercase'} />
                  </span>
                )}
              </HorizonItem>

              <HorizonItem
                label={<I18n id={'trade-open-amount'} />}
                align={'justify'}
                labelClass={styleMr(styles.paramLabel, fontCss.bold)}
              >
                <TokenAmountInline
                  amount={this.state.openAmount}
                  token={this.state.curPair?.indexUnderlying || ''}
                  symClassName={styleMr(styles.label)}
                  fix={fixDigit}
                  rmZero={true}
                />
              </HorizonItem>

              <HorizonItem
                label={<I18n id={'trade-index-open-price'} />}
                align={'justify'}
                labelClass={styleMr(styles.paramLabel, fontCss.bold)}
              >
                <TokenAmountInline amount={this.state.openPrice?.price} token={''} />
              </HorizonItem>

              <HorizonItem
                label={<I18n id={'trade-funding-fee-init'} />}
                align={'justify'}
                labelClass={styleMr(styles.paramLabel, fontCss.bold)}
              >
                <TokenAmountInline
                  amount={this.state.firstFundingFee?.phase0Fee}
                  token={this.state.curPair?.quoteToken.symbol || ''}
                  short={true}
                  symClassName={styleMr(styles.label)}
                  rmZero={true}
                  fix={fixDigit}
                  precision={fixDigit}
                />
              </HorizonItem>

              <HorizonItem
                label={<I18n id={'trade-fees-trading'} />}
                align={'justify'}
                labelClass={styleMr(styles.paramLabel, fontCss.bold)}
              >
                <TokenAmountInline
                  amount={this.state.tradingFee}
                  token={this.state.curPair?.quoteToken.symbol || ''}
                  short={true}
                  symClassName={styleMr(styles.label)}
                  rmZero={true}
                  fix={fixDigit}
                  precision={fixDigit}
                />
              </HorizonItem>
            </ItemsBox>
          </div>

          <FixPadding top={30} bottom={0} mobTop={20} mobBottom={0}>
            <TradeFormFooter
              doneName={<I18n id={'trade-confirm'} textUpper={'uppercase'} />}
              onDone={this.doOpen.bind(this)}
              onCancel={this.hide.bind(this)}
            />
          </FixPadding>
        </ModalRender>
      </>
    );
  }
}
