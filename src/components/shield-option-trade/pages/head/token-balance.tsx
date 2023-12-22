import { BaseStateComponent } from '../../../../state-manager/base-state-component';
import { P } from '../../../../state-manager/page/page-state-parser';
import { bindStyleMerger, StyleMerger } from '../../../../util/string';
import styles from './token-balance.module.less';
import { TokenErc20 } from '../../../../state-manager/state-types';
import { TokenAmountInline } from '../../../common/content/token-amount-inline';
import { SldDecimal } from '../../../../util/decimal';
import { S } from '../../../../state-manager/contract/contract-state-parser';
import { walletState } from '../../../../state-manager/wallet/wallet-state';
import { Visible } from '../../../builtin/hidden';
import { TokenIcon } from '../common/token-icon';
import { combineLatest, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { SLD_ENV_CONF } from '../../const/env';

type IState = {
  isMobile: boolean;
  curToken: TokenErc20 | null;
  balance: SldDecimal;
  isConnected: boolean;
};
type IProps = {};

export class TokenBalance extends BaseStateComponent<IProps, IState> {
  state: IState = {
    isMobile: P.Layout.IsMobile.get(),
    curToken: P.Option.Trade.Pair.Quote.get(),
    balance: SldDecimal.ZERO,
    isConnected: false,
  };

  componentDidMount() {
    this.registerIsMobile('isMobile');
    this.registerState('balance', S.Option.User.Deposit.Max);
    this.registerState('curToken', P.Option.Trade.Pair.Quote);
    this.registerObservable('isConnected', walletState.IS_CONNECTED);

    this.sub(this.watchInitToken());
  }

  componentWillUnmount() {
    this.destroyState();
  }

  private watchInitToken(): Observable<any> {
    return combineLatest([walletState.NETWORK, P.Option.Trade.Pair.Quote.watch()]).pipe(
      tap(([network, quoteToken]) => {
        if (quoteToken === null || quoteToken.network !== network) {
          const token: TokenErc20 | undefined = SLD_ENV_CONF.Supports[network]?.DefaultToken;
          if (token) {
            P.Option.Trade.Pair.Quote.set(token);
          }
        }
      })
    );
  }

  onRefresh() {
    this.tickState(S.Option.User.Deposit.Max);
  }

  render() {
    const mobileCss: string = this.state.isMobile ? styles.mobile : '';
    const styleMr: StyleMerger = bindStyleMerger(mobileCss);

    return (
      <div className={styleMr(styles.balance)} onClick={this.onRefresh.bind(this)}>
        <Visible when={this.state.isConnected && !!this.state.curToken}>
          <TokenIcon token={this.state.curToken!} size={20} />

          <TokenAmountInline
            amount={this.state.balance}
            token={this.state.curToken?.symbol || ''}
            symClassName={styleMr(styles.symUnit)}
            numClassName={styleMr(styles.numValue)}
            short={this.state.isMobile}
          />
        </Visible>
      </div>
    );
  }
}
