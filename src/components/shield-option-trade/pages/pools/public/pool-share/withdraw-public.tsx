import { BaseStateComponent } from '../../../../../../state-manager/base-state-component';
import { P } from '../../../../../../state-manager/page/page-state-parser';
import { bindStyleMerger } from '../../../../../../util/string';
import styles from './withdraw-public.module.less';
import ModalRender from '../../../../../modal-render';
import { I18n } from '../../../../../i18n/i18n';
import { ItemsBox } from '../../../../../common/content/items-box';
import { ShieldMakerPublicPoolShare } from '../../../../../../state-manager/state-types';
import { TokenInput } from '../../../common/token-input';
import { Visible } from '../../../../../builtin/hidden';
import { SldDecimal } from '../../../../../../util/decimal';
import { fontCss } from '../../../../../i18n/font-switch';
import { TradeFormFooter } from '../../../common/form-footer';
import { TokenLabel } from '../../../common/token-label';
import { shieldOptionTradeService } from '../../../../services/shield-option-trade.service';
import { S } from '../../../../../../state-manager/contract/contract-state-parser';
import { tokenBalanceService } from '../../../../services/token-balance.service';
import { HorizonItem } from '../../../../../common/content/horizon-item';
import { TokenAmountInline } from '../../../../../common/content/token-amount-inline';
import { D } from '../../../../../../state-manager/database/database-state-parser';

type IState = {
  isMobile: boolean;
  visible: boolean;
  current: ShieldMakerPublicPoolShare | null;
  inputValue: SldDecimal | null;
  inputError?: boolean;
  receiveToken: SldDecimal;
};
type IProps = {};

export class WithdrawPublic extends BaseStateComponent<IProps, IState> {
  state: IState = {
    isMobile: P.Layout.IsMobile.get(),
    visible: P.Option.Pools.Public.Liquidity.Withdraw.IsVisible.get(),
    current: P.Option.Pools.Public.Liquidity.Withdraw.Current.get(),
    inputValue: P.Option.Pools.Public.Liquidity.Withdraw.Amount.get(),
    inputError: false,
    receiveToken: SldDecimal.ZERO,
  };

  componentDidMount() {
    this.registerIsMobile('isMobile');
    this.registerState('visible', P.Option.Pools.Public.Liquidity.Withdraw.IsVisible);
    this.registerState('current', P.Option.Pools.Public.Liquidity.Withdraw.Current);
    this.registerState('inputValue', P.Option.Pools.Public.Liquidity.Withdraw.Amount);
    this.registerState('receiveToken', S.Option.Pool.Maker.Liquidity.Public.Withdraw.Receive);
  }

  componentWillUnmount() {
    this.destroyState();
  }

  hide() {
    P.Option.Pools.Public.Liquidity.Withdraw.IsVisible.set(false);
  }

  onChangeValue(val: SldDecimal | null) {
    P.Option.Pools.Public.Liquidity.Withdraw.Amount.set(val);
  }

  onChangeError(isError: boolean) {
    this.updateState({ inputError: isError });
  }

  onWithdraw() {
    if (!this.state.current || this.state.inputError || !this.state.inputValue || this.state.inputValue.isZero()) {
      return;
    }

    const move$ = shieldOptionTradeService.movePubPoolLiquidity(this.state.current.poolAddress, this.state.inputValue);

    this.subOnce(move$, (done: boolean) => {
      if (done) {
        this.updateState({ inputValue: null });
        this.tickState(S.Option.Pool.Maker.Liquidity.Public.List, D.Option.Maker.YourShareInPools);
        tokenBalanceService.refresh();
        this.hide();
      }
    });
  }

  render() {
    const mobileCss = this.state.isMobile ? styles.mobile : '';
    const styleMr = bindStyleMerger(mobileCss);

    if (!this.state.current) {
      return <></>;
    }

    return (
      <ModalRender
        footer={null}
        title={<I18n id={'trade-liquidity-move-for-public'} />}
        visible={this.state.visible}
        onCancel={this.hide.bind(this)}
        onClose={this.hide.bind(this)}
      >
        <ItemsBox gap={30}>
          <Visible when={!!this.state.current}>
            <TokenLabel
              token={this.state.current?.token}
              align={'center'}
              size={this.state.isMobile ? 'small' : 'large'}
            />
          </Visible>

          <ItemsBox gap={8}>
            <div className={styleMr(styles.itemName, fontCss.bold)}>
              <I18n id={'trade-liquidity-move-amount'} />
            </div>

            <TokenInput
              token={this.state.current.lp}
              value={this.state.inputValue}
              onChange={this.onChangeValue.bind(this)}
              errorChange={this.onChangeError.bind(this)}
            />

            <HorizonItem
              label={<I18n id={'trade-you-will-receive'} />}
              align={'justify'}
              labelClass={styleMr(styles.label)}
            >
              <TokenAmountInline
                amount={this.state.receiveToken}
                token={this.state.current.token.symbol}
                symClassName={styleMr(styles.label)}
              />
            </HorizonItem>
          </ItemsBox>

          <TradeFormFooter
            doneName={<I18n id={'trade-liquidity-move'} textUpper={'uppercase'} />}
            onDone={this.onWithdraw.bind(this)}
            onCancel={this.hide.bind(this)}
            disabled={this.state.inputError}
          />
        </ItemsBox>
      </ModalRender>
    );
  }
}
