import { BaseStateComponent } from '../../../../../../state-manager/base-state-component';
import { P } from '../../../../../../state-manager/page/page-state-parser';
import { bindStyleMerger } from '../../../../../../util/string';
import styles from './deposit.module.less';
import { SldButton } from '../../../../../common/buttons/sld-button';
import { I18n } from '../../../../../i18n/i18n';
import ModalRender from '../../../../../modal-render';
import { ItemsBox } from '../../../../../common/content/items-box';
import { TokenInput } from '../../../common/token-input';
import { SldDecimal } from '../../../../../../util/decimal';
import { TokenErc20 } from '../../../../../../state-manager/state-types';
import { TradeFormFooter } from '../../../common/form-footer';
import { S } from '../../../../../../state-manager/contract/contract-state-parser';
import { shieldOptionTradeService } from '../../../../services/shield-option-trade.service';
import { C } from '../../../../../../state-manager/cache/cache-state-parser';
import { switchMap } from 'rxjs';

type IState = {
  isMobile: boolean;
  visible: boolean;
  quote: TokenErc20 | null;
  inputValue: SldDecimal | null;
  approvedAmount: SldDecimal;
};
type IProps = {};

export class DepositFund extends BaseStateComponent<IProps, IState> {
  state: IState = {
    isMobile: P.Layout.IsMobile.get(),
    visible: false,
    quote: null,
    inputValue: null,
    approvedAmount: SldDecimal.ZERO,
  };

  componentDidMount() {
    this.registerIsMobile('isMobile');
    this.registerState('quote', P.Option.Trade.Pair.Quote);
    this.registerState('approvedAmount', S.Option.User.Deposit.Approved);
  }

  componentWillUnmount() {
    this.destroyState();
  }

  show() {
    this.updateState({ visible: true });
  }

  hide() {
    this.updateState({ visible: false });
  }

  onDeposit() {
    if (!this.state.quote || !this.state.inputValue || this.state.inputValue.isZero()) {
      return;
    }

    const ref$ = C.Option.Broker.Address.get();

    const deposit$ = ref$.pipe(
      switchMap((broker: string | null) => {
        return shieldOptionTradeService.deposit(this.state.quote!.address, this.state.inputValue!, broker || undefined);
      })
    );

    this.subOnce(deposit$, (done: boolean) => {
      if (done) {
        this.updateState({ inputValue: null });
        this.tickState(S.Option.User.Account.Info, S.Option.Order.Open.Max);
        this.hide();
      }
    });
  }

  onApprove() {
    if (!this.state.quote) {
      return;
    }
    const approve$ = shieldOptionTradeService.depositApprove(this.state.quote.address);

    this.subOnce(approve$, (done: boolean) => {
      if (done) {
        this.tickState(S.Option.User.Deposit.Approved);
      }
    });
  }

  render() {
    const mobileCss = this.state.isMobile ? styles.mobile : '';
    const styleMr = bindStyleMerger(mobileCss);

    const needApprove = !!this.state.inputValue && this.state.inputValue.gt(this.state.approvedAmount);

    return (
      <div className={styleMr(styles.wrapperDeposit)}>
        <SldButton size={'small'} type={'primary'} onClick={this.show.bind(this)} className={styleMr(styles.btn)}>
          <I18n id={'trade-deposit'} textUpper={'uppercase'} />
        </SldButton>

        <ModalRender
          footer={null}
          title={<I18n id={'trade-fund-deposit'} />}
          visible={this.state.visible}
          onClose={this.hide.bind(this)}
          onCancel={this.hide.bind(this)}
          height={300}
        >
          <ItemsBox gap={32}>
            <TokenInput
              token={this.state.quote!}
              value={this.state.inputValue}
              onChange={(val: SldDecimal | null) => {
                this.updateState({ inputValue: val });
              }}
            />

            <TradeFormFooter
              onDone={needApprove ? this.onApprove.bind(this) : this.onDeposit.bind(this)}
              onCancel={this.hide.bind(this)}
              doneName={
                needApprove ? (
                  <I18n id={'trade-approve'} textUpper={'uppercase'} />
                ) : (
                  <I18n id={'trade-deposit'} textUpper={'uppercase'} />
                )
              }
            />
          </ItemsBox>
        </ModalRender>
      </div>
    );
  }
}
