import { BaseStateComponent } from '../../../../../../state-manager/base-state-component';
import { P } from '../../../../../../state-manager/page/page-state-parser';
import { bindStyleMerger, cssPick } from '../../../../../../util/string';
import styles from './add-margin.module.less';
import ModalRender from '../../../../../modal-render';
import { I18n } from '../../../../../i18n/i18n';
import {
  ShieldMakerOrderInfo,
  ShieldMakerPrivatePoolInfo,
  ShieldOptionType,
} from '../../../../../../state-manager/state-types';
import { ItemsBox } from '../../../../../common/content/items-box';
import { HorizonItem } from '../../../../../common/content/horizon-item';
import { formatTime } from '../../../../../../util/time';
import { TokenAmountInline } from '../../../../../common/content/token-amount-inline';
import { TokenInput } from '../../../common/token-input';
import { fontCss } from '../../../../../i18n/font-switch';
import { SldDecimal } from '../../../../../../util/decimal';
import { TradeFormFooter } from '../../../common/form-footer';
import { FixPadding } from '../../../../../common/content/fix-padding';
import { S } from '../../../../../../state-manager/contract/contract-state-parser';
import { shieldOptionTradeService } from '../../../../services/shield-option-trade.service';
import { tap } from 'rxjs/operators';

type IState = {
  isMobile: boolean;
  isVisible: boolean;
  curOrder: ShieldMakerOrderInfo | null;
  curPool: ShieldMakerPrivatePoolInfo | null;

  inputValue: SldDecimal | null;
  approved: SldDecimal;
};
type IProps = {
  onDone?: (order: ShieldMakerOrderInfo) => void;
};

export class MakerAddMargin extends BaseStateComponent<IProps, IState> {
  state: IState = {
    isMobile: P.Layout.IsMobile.get(),
    isVisible: false,
    curOrder: null,
    curPool: P.Option.Pools.Private.LockedDetails.CurPool.get(),

    inputValue: null,
    approved: SldDecimal.ZERO,
  };

  componentDidMount() {
    this.registerIsMobile('isMobile');
    this.registerState('isVisible', P.Option.Pools.Private.LockedDetails.AddMargin.IsVisible);
    this.registerState('curOrder', P.Option.Pools.Private.LockedDetails.AddMargin.CurOrder);
    this.registerState('approved', S.Option.Pool.Maker.AddMarginApproved);
    this.registerState('curPool', P.Option.Pools.Private.LockedDetails.CurPool);

    this.sub(
      this.watchStateChange('curOrder').pipe(
        tap(() => {
          this.updateState({ inputValue: null });
        })
      )
    );
  }

  componentWillUnmount() {
    this.destroyState();
  }

  hide() {
    P.Option.Pools.Private.LockedDetails.AddMargin.IsVisible.set(false);
  }

  onAdd() {
    if (!this.state.curOrder || !this.state.curPool || !this.state.inputValue || this.state.inputValue.isZero()) {
      return;
    }

    const add$ = shieldOptionTradeService.addPriOrderMargin(
      this.state.curPool,
      this.state.curOrder,
      this.state.inputValue
    );

    this.subOnce(add$, (done: boolean) => {
      if (done) {
        this.updateState({ inputValue: null });
        this.hide();

        if (this.props.onDone && this.state.curOrder) {
          this.props.onDone(this.state.curOrder);
        }
      }
    });
  }

  onApprove() {
    if (!this.state.curPool) {
      return;
    }

    const approve$ = shieldOptionTradeService.addPriOrderMarginApprove(this.state.curPool);

    this.subOnce(approve$, (done: boolean) => {
      if (done) {
        this.tickState(S.Option.Pool.Maker.AddMarginApproved);
      }
    });
  }

  render() {
    const mobileCss = this.state.isMobile ? styles.mobile : '';
    const styleMr = bindStyleMerger(mobileCss);

    if (!this.state.curOrder) {
      return <></>;
    }

    const needApprove: boolean = !!this.state.inputValue && this.state.approved.lt(this.state.inputValue);
    const lackLiquidity: boolean = !!this.state.curPool?.amountAvailable && this.state.curPool.amountAvailable.isZero();

    return (
      <ModalRender
        footer={null}
        title={<I18n id={'trade-add-margin'} />}
        visible={this.state.isVisible}
        onCancel={this.hide.bind(this)}
        onClose={this.hide.bind(this)}
        height={450}
      >
        <div className={styleMr(styles.params)}>
          <ItemsBox gap={16}>
            <HorizonItem
              label={<I18n id={'trade-order-id'} />}
              align={'justify'}
              labelClass={styleMr(styles.label)}
              valueClass={styleMr(styles.value)}
            >
              #{this.state.curOrder.id.toString()}
            </HorizonItem>

            <HorizonItem
              label={<I18n id={'trade-open-time'} />}
              align={'justify'}
              labelClass={styleMr(styles.label)}
              valueClass={styleMr(styles.value)}
            >
              {formatTime(this.state.curOrder.openTime)}
            </HorizonItem>

            <HorizonItem
              label={<I18n id={'trade-position-amount'} />}
              align={'justify'}
              labelClass={styleMr(styles.label)}
              valueClass={styleMr(styles.value)}
            >
              <TokenAmountInline
                amount={this.state.curOrder.orderAmount}
                token={this.state.curOrder.underlying}
                symClassName={styleMr(styles.label)}
              />
            </HorizonItem>

            <HorizonItem
              label={<I18n id={'trade-option-type'} />}
              align={'justify'}
              labelClass={styleMr(styles.label)}
              valueClass={styleMr(styles.value)}
            >
              {this.state.curOrder.optionType === ShieldOptionType.Call ? (
                <span className={'longStyle'}>
                  <I18n id={'trade-option-type-sell-call'} textUpper={'uppercase'} />
                </span>
              ) : (
                <span className={'shortStyle'}>
                  <I18n id={'trade-option-type-sell-put'} textUpper={'uppercase'} />
                </span>
              )}
            </HorizonItem>

            <HorizonItem
              label={<I18n id={'trade-maker-margin-locked'} />}
              align={'justify'}
              labelClass={styleMr(styles.label)}
              valueClass={styleMr(styles.value)}
            >
              <TokenAmountInline
                amount={this.state.curOrder.makerMarginAmount}
                token={this.state.curOrder.token.symbol}
                symClassName={styleMr(styles.label)}
              />
            </HorizonItem>

            <HorizonItem
              label={<I18n id={'trade-pnl'} />}
              align={'justify'}
              labelClass={styleMr(styles.label)}
              valueClass={styleMr(styles.value)}
            >
              <TokenAmountInline
                amount={this.state.curOrder.pnl?.pnl}
                token={this.state.curOrder.token.symbol}
                symClassName={styleMr(styles.label)}
                numClassName={styleMr(
                  cssPick(this.state.curOrder.pnl?.pnl.gtZero(), 'longStyle'),
                  cssPick(this.state.curOrder.pnl?.pnl.ltZero(), 'shortStyle')
                )}
              />
            </HorizonItem>
          </ItemsBox>
        </div>

        <ItemsBox gap={30}>
          <FixPadding top={20} bottom={0} mobTop={20} mobBottom={0}>
            <ItemsBox gap={10}>
              <div className={styleMr(styles.amountTitle, fontCss.bold)}>
                <I18n id={'trade-add-margin-amount'} />
              </div>

              <TokenInput
                token={this.state.curOrder.token}
                value={this.state.inputValue}
                onChange={val => this.updateState({ inputValue: val })}
                max={this.state.curPool?.amountAvailable}
              />
            </ItemsBox>
          </FixPadding>

          <TradeFormFooter
            doneName={
              needApprove ? (
                <I18n id={'trade-approve'} textUpper={'uppercase'} />
              ) : lackLiquidity ? (
                <I18n id={'trade-lack-liquidity'} textUpper={'uppercase'} />
              ) : (
                <I18n id={'trade-add-margin'} textUpper={'uppercase'} />
              )
            }
            cancelName={<I18n id={'trade-cancel'} textUpper={'uppercase'} />}
            onDone={needApprove ? this.onApprove.bind(this) : this.onAdd.bind(this)}
            onCancel={this.hide.bind(this)}
            disabled={lackLiquidity}
          />
        </ItemsBox>
      </ModalRender>
    );
  }
}
