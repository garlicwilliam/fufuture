import { BaseStateComponent } from '../../../../../../state-manager/base-state-component';
import { P } from '../../../../../../state-manager/page/page-state-parser';
import { bindStyleMerger } from '../../../../../../util/string';
import styles from './withdraw-liquidity.module.less';
import ModalRender from '../../../../../modal-render';
import { I18n } from '../../../../../i18n/i18n';
import { ItemsBox } from '../../../../../common/content/items-box';
import { ShieldMakerPrivatePoolInfo, ShieldTradePair } from '../../../../../../state-manager/state-types';
import { PairLabel } from '../../../common/pair-label';
import { FixPadding } from '../../../../../common/content/fix-padding';
import { TokenInput } from '../../../common/token-input';
import { SldDecimal } from '../../../../../../util/decimal';
import { TradeFormFooter } from '../../../common/form-footer';
import { fontCss } from '../../../../../i18n/font-switch';
import { shieldOptionTradeService } from '../../../../services/shield-option-trade.service';

type IState = {
  isMobile: boolean;
  visible: boolean;
  pool: ShieldMakerPrivatePoolInfo | null;
  inputValue: SldDecimal | null;
};
type IProps = {
  onDone: (pool: ShieldMakerPrivatePoolInfo) => void;
};

export class WithdrawPrivateLiquidity extends BaseStateComponent<IProps, IState> {
  state: IState = {
    isMobile: P.Layout.IsMobile.get(),
    visible: false,
    pool: null,
    inputValue: null,
  };

  componentDidMount() {
    this.registerIsMobile('isMobile');
    this.registerState('visible', P.Option.Pools.Private.Liquidity.Withdraw.IsVisible);
    this.registerState('pool', P.Option.Pools.Private.Liquidity.Withdraw.Current);
  }

  componentWillUnmount() {
    this.destroyState();
  }

  hide() {
    P.Option.Pools.Private.Liquidity.Withdraw.IsVisible.set(false);
  }

  onWithdraw() {
    if (!this.state.pool || !this.state.inputValue || this.state.inputValue.isZero()) {
      return;
    }

    const move$ = shieldOptionTradeService.movePriPoolLiquidity(this.state.pool.priPoolAddress, this.state.inputValue);
    const curPool: ShieldMakerPrivatePoolInfo = this.state.pool;

    this.subOnce(move$, (done: boolean) => {
      if (done) {
        this.updateState({ inputValue: null });
        this.hide();

        this.props.onDone(curPool);
      }
    });
  }

  render() {
    const mobileCss = this.state.isMobile ? styles.mobile : '';
    const styleMr = bindStyleMerger(mobileCss);

    if (!this.state.pool) {
      return <></>;
    }

    const pair: ShieldTradePair = {
      indexUnderlying: this.state.pool.indexUnderlying,
      quoteToken: this.state.pool.token,
    };

    return (
      <ModalRender
        footer={null}
        title={<I18n id={'trade-liquidity-move-for-private'} />}
        visible={this.state.visible}
        onCancel={this.hide.bind(this)}
        onClose={this.hide.bind(this)}
        height={400}
      >
        <ItemsBox gap={30}>
          <FixPadding top={0} bottom={16} mobTop={0} mobBottom={10}>
            <PairLabel pair={pair} size={this.state.isMobile ? 'small' : 'large'} />
          </FixPadding>

          <ItemsBox gap={8}>
            <div className={styleMr(styles.itemName, fontCss.bold)}>
              <I18n id={'trade-liquidity-move-amount'} />
            </div>
            <TokenInput
              token={this.state.pool.token}
              max={this.state.pool.amountAvailable}
              onChange={val => this.updateState({ inputValue: val })}
              value={this.state.inputValue}
            />
          </ItemsBox>

          <TradeFormFooter
            doneName={<I18n id={'trade-liquidity-move'} textUpper={'uppercase'} />}
            onDone={this.onWithdraw.bind(this)}
            onCancel={this.hide.bind(this)}
            disabled={!this.state.inputValue || this.state.inputValue.isZero()}
          />
        </ItemsBox>
      </ModalRender>
    );
  }
}
