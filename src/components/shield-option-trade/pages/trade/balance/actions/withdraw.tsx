import { BaseStateComponent } from '../../../../../../state-manager/base-state-component';
import { P } from '../../../../../../state-manager/page/page-state-parser';
import { bindStyleMerger } from '../../../../../../util/string';
import styles from './withdraw.module.less';
import { SldButton } from '../../../../../common/buttons/sld-button';
import { I18n } from '../../../../../i18n/i18n';
import ModalRender from '../../../../../modal-render';
import { ItemsBox } from '../../../../../common/content/items-box';
import { TokenInput } from '../../../common/token-input';
import { ShieldUserAccountInfo, TokenErc20 } from '../../../../../../state-manager/state-types';
import { SldDecimal } from '../../../../../../util/decimal';
import { i18n } from '../../../../../i18n/i18n-fn';
import { TradeFormFooter } from '../../../common/form-footer';
import { S } from '../../../../../../state-manager/contract/contract-state-parser';
import { shieldOptionTradeService } from '../../../../services/shield-option-trade.service';

type IState = {
  isMobile: boolean;
  visible: boolean;
  quoteToken: TokenErc20 | null;
  userAccount: ShieldUserAccountInfo | null;
  inputValue: SldDecimal | null;
};
type IProps = {};

export class WithdrawFund extends BaseStateComponent<IProps, IState> {
  state: IState = {
    isMobile: P.Layout.IsMobile.get(),
    visible: false,
    quoteToken: null,
    userAccount: null,
    inputValue: null,
  };

  componentDidMount() {
    this.registerIsMobile('isMobile');
    this.registerState('quoteToken', P.Option.Trade.Pair.Quote);
    this.registerState('userAccount', S.Option.User.Account.Info);
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

  onWithdraw() {
    if (!this.state.quoteToken || !this.state.inputValue || this.state.inputValue.isZero()) {
      return;
    }

    const withdraw$ = shieldOptionTradeService.withdraw(this.state.quoteToken.address, this.state.inputValue);

    this.subOnce(withdraw$, (done: boolean) => {
      if (done) {
        this.updateState({ inputValue: null });
        this.tickState(S.Option.User.Account.Info, S.Option.Order.Open.Max);
        this.hide();
      }
    });
  }

  render() {
    const mobileCss = this.state.isMobile ? styles.mobile : '';
    const styleMr = bindStyleMerger(mobileCss);

    if (!this.state.quoteToken || !this.state.userAccount) {
      return <></>;
    }

    const max = this.state.userAccount.availableBalance;

    return (
      <div className={styleMr(styles.wrapperWithdraw)}>
        <SldButton
          size={'small'}
          type={'default'}
          className={styleMr(styles.btnDefault)}
          onClick={this.show.bind(this)}
        >
          <I18n id={'trade-withdraw'} textUpper={'uppercase'} />
        </SldButton>

        <ModalRender
          footer={null}
          title={<I18n id={'trade-fund-withdraw'} />}
          visible={this.state.visible}
          onCancel={this.hide.bind(this)}
          onClose={this.hide.bind(this)}
          height={300}
        >
          <ItemsBox gap={32}>
            <TokenInput
              token={this.state.quoteToken}
              max={max}
              value={this.state.inputValue}
              onChange={val => this.updateState({ inputValue: val })}
              placeholderName={i18n('trade-available')}
            />

            <TradeFormFooter
              doneName={<I18n id={'trade-withdraw'} textUpper={'uppercase'} />}
              onDone={this.onWithdraw.bind(this)}
              onCancel={this.hide.bind(this)}
            />
          </ItemsBox>
        </ModalRender>
      </div>
    );
  }
}
