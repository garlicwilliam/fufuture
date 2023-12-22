import { BaseStateComponent } from '../../../../../../state-manager/base-state-component';
import { P } from '../../../../../../state-manager/page/page-state-parser';
import { bindStyleMerger } from '../../../../../../util/string';
import styles from './add-form.module.less';
import { ItemsBox } from '../../../../../common/content/items-box';
import { SearchToken } from '../../../common/search-token';
import { fontCss } from '../../../../../i18n/font-switch';
import { TokenInput } from '../../../common/token-input';
import { SldDecimal } from '../../../../../../util/decimal';
import { SldButton } from '../../../../../common/buttons/sld-button';
import { FixPadding } from '../../../../../common/content/fix-padding';
import { I18n } from '../../../../../i18n/i18n';
import { ShieldUnderlyingType, TokenErc20 } from '../../../../../../state-manager/state-types';
import { shieldOptionTradeService } from '../../../../services/shield-option-trade.service';
import { tokenBalanceService } from '../../../../services/token-balance.service';
import { S } from '../../../../../../state-manager/contract/contract-state-parser';
import { Visible } from '../../../../../builtin/hidden';
import { D } from '../../../../../../state-manager/database/database-state-parser';
import { walletState } from '../../../../../../state-manager/wallet/wallet-state';
import { tap } from 'rxjs/operators';
import { Network } from '../../../../../../constant/network';
import { Observable } from 'rxjs';

type IState = {
  isMobile: boolean;
  curSelectToken: TokenErc20 | undefined;
  inputValue: SldDecimal | null;
  inputError: boolean;
  approved: SldDecimal;
};
type IProps = {};

export class AddPubLiquidityForm extends BaseStateComponent<IProps, IState> {
  state: IState = {
    isMobile: P.Layout.IsMobile.get(),
    curSelectToken: P.Option.Pools.Public.Liquidity.Add.CurrentToken.get(),
    inputValue: null,
    inputError: false,
    approved: SldDecimal.ZERO,
  };

  componentDidMount() {
    this.registerIsMobile('isMobile');
    this.registerState('curSelectToken', P.Option.Pools.Public.Liquidity.Add.CurrentToken);
    this.registerState('approved', S.Option.Pool.Maker.Liquidity.Public.Add.Approved);

    this.sub(this.watchNetSwitch());
  }

  componentWillUnmount() {
    this.destroyState();
  }

  watchNetSwitch(): Observable<any> {
    return walletState.NETWORK.pipe(
      tap((network: Network) => {
        if (!!this.state.curSelectToken && this.state.curSelectToken.network !== network) {
          P.Option.Pools.Public.Liquidity.Add.CurrentToken.setToDefault();
        }
      })
    );
  }

  onChangeToken(token: TokenErc20) {
    P.Option.Pools.Public.Liquidity.Add.CurrentToken.set(token);
  }

  onChangeValue(val: SldDecimal | null) {
    this.updateState({ inputValue: val });
  }

  onApprove() {
    if (!this.state.curSelectToken) {
      return;
    }

    const approve$ = shieldOptionTradeService.approveAddLiquidity(this.state.curSelectToken);

    this.subOnce(approve$, (done: boolean) => {
      if (done) {
        this.tickState(S.Option.Pool.Maker.Liquidity.Public.Add.Approved);
      }
    });
  }

  onAdd() {
    if (
      !this.state.curSelectToken ||
      this.state.inputError ||
      !this.state.inputValue ||
      this.state.inputValue.isZero()
    ) {
      return;
    }

    const add$ = shieldOptionTradeService.addLiquidity(
      this.state.curSelectToken,
      ShieldUnderlyingType.ETH,
      this.state.inputValue,
      false
    );

    this.subOnce(add$, (done: boolean) => {
      if (done) {
        this.tickAndLater(8000, D.Option.Maker.YourShareInPools);
        this.updateState({ inputValue: null });
        tokenBalanceService.refresh();
      }
    });
  }

  render() {
    const mobileCss = this.state.isMobile ? styles.mobile : '';
    const styleMr = bindStyleMerger(mobileCss);

    const needApprove: boolean =
      !!this.state.inputValue && this.state.inputValue.gtZero() && this.state.inputValue.gt(this.state.approved);

    return (
      <div className={styleMr(styles.wrapperForm)}>
        <ItemsBox gap={30}>
          <ItemsBox gap={this.state.isMobile ? 10 : 16}>
            <ItemsBox gap={10}>
              <div className={styleMr(styles.itemName, fontCss.bold)}>
                <I18n id={'trade-select-token'} />
              </div>

              <div className={styleMr(styles.poolSelection)}>
                <SearchToken
                  placeholder={<I18n id={'trade-select-token'} />}
                  curSelected={this.state.curSelectToken}
                  onSelected={this.onChangeToken.bind(this)}
                />
              </div>
            </ItemsBox>

            <div className={styleMr(styles.obviousTip)}>
              <I18n id={'trade-pool-add-liquidity-tip'} />
            </div>
          </ItemsBox>

          <ItemsBox gap={10}>
            <div className={styleMr(styles.itemName, fontCss.bold)}>
              <I18n id={'trade-amount'} />
            </div>

            <TokenInput
              token={this.state.curSelectToken}
              value={this.state.inputValue}
              onChange={this.onChangeValue.bind(this)}
              errorChange={isError => this.updateState({ inputError: isError })}
            />
          </ItemsBox>

          <FixPadding top={20} bottom={0} mobTop={0} mobBottom={0}>
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

            <Visible when={!needApprove}>
              <SldButton
                size={'large'}
                type={'primary'}
                disabled={this.state.inputError}
                onClick={this.onAdd.bind(this)}
                className={styleMr(styles.btn)}
              >
                <I18n id={'trade-liquidity-add'} textUpper={'uppercase'} />
              </SldButton>
            </Visible>
          </FixPadding>
        </ItemsBox>
      </div>
    );
  }
}
