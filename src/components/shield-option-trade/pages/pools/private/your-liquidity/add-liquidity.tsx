import { BaseStateComponent } from '../../../../../../state-manager/base-state-component';
import { P } from '../../../../../../state-manager/page/page-state-parser';
import { bindStyleMerger } from '../../../../../../util/string';
import styles from './add-liquidity.module.less';
import ModalRender from '../../../../../modal-render';
import { I18n } from '../../../../../i18n/i18n';
import {
  ShieldMakerPrivatePoolInfo,
  ShieldTradePair,
  ShieldUnderlyingType,
  StateNull,
  TokenErc20,
} from '../../../../../../state-manager/state-types';
import { ItemsBox } from '../../../../../common/content/items-box';
import { TokenInput } from '../../../common/token-input';
import { SldButton } from '../../../../../common/buttons/sld-button';
import { SldProgress } from '../../../../../common/progress/progress';
import { HorizonItem } from '../../../../../common/content/horizon-item';
import { SearchToken } from '../../../common/search-token';
import { AssetsSelect } from '../../../common/assets-select';
import { Visible } from '../../../../../builtin/hidden';
import { snRep } from '../../../../../../state-manager/interface-util';
import { SldDecimal, SldDecPercent } from '../../../../../../util/decimal';
import { shieldOptionTradeService } from '../../../../services/shield-option-trade.service';
import { S } from '../../../../../../state-manager/contract/contract-state-parser';
import { D } from '../../../../../../state-manager/database/database-state-parser';

type IState = {
  isMobile: boolean;
  visible: boolean;
  curPair: Partial<ShieldTradePair> | undefined;
  curLiquidity: ShieldMakerPrivatePoolInfo | typeof StateNull;
  inputValue: SldDecimal | null;
  inputError: boolean;
  approvedAmount: SldDecimal;
};
type IProps = {};

export class AddPrivateLiquidity extends BaseStateComponent<IProps, IState> {
  state: IState = {
    isMobile: P.Layout.IsMobile.get(),
    visible: P.Option.Pools.Private.Liquidity.Add.IsVisible.get(),
    curPair: P.Option.Pools.Private.Liquidity.Add.CurrentPair.get(),
    curLiquidity: StateNull,
    inputValue: null,
    inputError: false,
    approvedAmount: SldDecimal.ZERO,
  };

  componentDidMount() {
    this.registerIsMobile('isMobile');
    this.registerState('visible', P.Option.Pools.Private.Liquidity.Add.IsVisible);
    this.registerState('curPair', P.Option.Pools.Private.Liquidity.Add.CurrentPair);
    this.registerState('curLiquidity', S.Option.Pool.Maker.Liquidity.Private.Add.Current);
    this.registerState('approvedAmount', S.Option.Pool.Maker.Liquidity.Private.Add.Approved);
  }

  componentWillUnmount() {
    this.destroyState();
  }

  hide() {
    P.Option.Pools.Private.Liquidity.Add.IsVisible.set(false);
  }

  onAssetsChange(assets: ShieldUnderlyingType) {
    const newState: Partial<ShieldTradePair> = { indexUnderlying: assets, quoteToken: this.state.curPair?.quoteToken };
    this.updatePair(newState);
  }

  onTokenChange(token: TokenErc20) {
    const newState: Partial<ShieldTradePair> = {
      indexUnderlying: this.state.curPair?.indexUnderlying,
      quoteToken: token,
    };
    this.updatePair(newState);
  }

  updatePair(pair: Partial<ShieldTradePair>) {
    P.Option.Pools.Private.Liquidity.Add.CurrentPair.set(pair);
  }

  onApprove() {
    if (this.state.curPair?.quoteToken) {
      this.subOnce(shieldOptionTradeService.approveAddLiquidity(this.state.curPair.quoteToken), (done: boolean) => {
        this.tickState(S.Option.Pool.Maker.Liquidity.Private.Add.Approved);
      });
    }
  }

  onAdd() {
    if (!this.state.inputValue || this.state.inputValue.isZero() || this.state.inputError) {
      return;
    }

    if (!this.state.curPair?.indexUnderlying || !this.state.curPair.quoteToken) {
      return;
    }

    const add$ = shieldOptionTradeService.addLiquidity(
      this.state.curPair.quoteToken,
      this.state.curPair.indexUnderlying,
      this.state.inputValue,
      true
    );

    this.subOnce(add$, (done: boolean) => {
      if (done) {
        this.hide();
        this.tickState(S.Option.Pool.Maker.Liquidity.Private.Add.Current);
        this.tickAndLater(8000, D.Option.Maker.YourLiquidity);
        this.updateState({ inputValue: null });
      }
    });
  }

  render() {
    const mobileCss = this.state.isMobile ? styles.mobile : '';
    const styleMr = bindStyleMerger(mobileCss);

    const needApprove: boolean = !!this.state.inputValue && this.state.inputValue.gt(this.state.approvedAmount);
    const myLiquidity: ShieldMakerPrivatePoolInfo | null = snRep(this.state.curLiquidity);
    const availablePercent = myLiquidity
      ? SldDecPercent.fromArgs(myLiquidity.amount, myLiquidity.amountAvailable)
      : SldDecPercent.ZERO;

    return (
      <ModalRender
        footer={null}
        title={<I18n id={'trade-liquidity-add-for-private'} />}
        visible={this.state.visible}
        onClose={this.hide.bind(this)}
        onCancel={this.hide.bind(this)}
        height={450}
      >
        <ItemsBox gap={30}>
          <ItemsBox gap={16}>
            <ItemsBox gap={8}>
              <div className={styleMr(styles.itemTitle)}>
                <I18n id={'trade-select-pair'} />
              </div>

              <div className={styleMr(styles.tokenSelections)}>
                <AssetsSelect
                  onSelect={this.onAssetsChange.bind(this)}
                  curSelect={this.state.curPair?.indexUnderlying}
                />

                <span>-</span>

                <SearchToken curSelected={this.state.curPair?.quoteToken} onSelected={this.onTokenChange.bind(this)} />
              </div>
            </ItemsBox>

            <div className={styleMr(styles.obviousTip)}>
              <I18n id={'trade-pool-add-liquidity-tip'} />
            </div>
          </ItemsBox>

          <ItemsBox gap={8}>
            <div className={styleMr(styles.itemTitle)}>
              <I18n id={'trade-amount'} />
            </div>

            <TokenInput
              token={this.state.curPair?.quoteToken}
              onChange={val => this.updateState({ inputValue: val })}
              errorChange={isError => this.updateState({ inputError: isError })}
              value={this.state.inputValue}
            />
          </ItemsBox>

          <ItemsBox gap={8}>
            <Visible when={!myLiquidity}>
              <div className={styleMr(styles.itemTitle)}>
                <I18n id={'trade-liquidity-yours'} />
              </div>
              <div className={styleMr(styles.emptyPosition)}>
                <I18n id={'trade-no-position'} />
              </div>
            </Visible>

            <Visible when={!!myLiquidity}>
              <div className={styleMr(styles.itemTitle)}>
                <I18n id={'trade-liquidity-yours'} />
              </div>

              <div className={styleMr(styles.validPosition)}>
                <HorizonItem label={<div>{availablePercent.percentFormat()}%</div>} align={'justify'}>
                  <div>
                    {myLiquidity?.amountAvailable.format({ fix: 4 })}/{myLiquidity?.amount.format({ fix: 4 })}
                  </div>
                </HorizonItem>

                <SldProgress strokeWidth={10} percent={Number(availablePercent.percentFormat())} />
              </div>
            </Visible>
          </ItemsBox>

          <Visible when={!needApprove}>
            <SldButton
              size={'large'}
              type={'primary'}
              className={styleMr(styles.btn)}
              disabled={this.state.inputError || !this.state.inputValue || this.state.inputValue?.isZero()}
              onClick={this.onAdd.bind(this)}
            >
              <I18n id={'trade-liquidity-add'} textUpper={'uppercase'} />
            </SldButton>
          </Visible>

          <Visible when={needApprove}>
            <SldButton
              size={'large'}
              type={'primary'}
              className={styleMr(styles.btn)}
              onClick={this.onApprove.bind(this)}
            >
              <I18n id={'trade-approve'} textUpper={'uppercase'} />
            </SldButton>
          </Visible>
        </ItemsBox>
      </ModalRender>
    );
  }
}
