import { BaseStateComponent } from '../../../../../../state-manager/base-state-component';
import { P } from '../../../../../../state-manager/page/page-state-parser';
import { bindStyleMerger } from '../../../../../../util/string';
import styles from './index-funding-pair.module.less';
import { ShieldUnderlyingType, TokenErc20 } from '../../../../../../state-manager/state-types';
import { tokenCacheService } from '../../../../services/token-cache.service';
import { combineLatest, Observable, of, switchMap } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { fontCss } from '../../../../../i18n/font-switch';
import { I18n } from '../../../../../i18n/i18n';
import { TokenIcon } from '../../../common/token-icon';
import { IndexUnderlyingIcon } from '../../../common/index-underlying-icon';
import { walletState } from '../../../../../../state-manager/wallet/wallet-state';
import { SLD_ENV_CONF } from '../../../../const/env';

type IState = {
  isMobile: boolean;
  indexUnderlying: ShieldUnderlyingType;
  token: TokenErc20 | null;
  tokenIcon: string | undefined;
};
type IProps = {
  className?: string;
};

export class ShieldIndexFundingPair extends BaseStateComponent<IProps, IState> {
  state: IState = {
    isMobile: P.Layout.IsMobile.get(),
    indexUnderlying: P.Option.Trade.Pair.Base.get(),
    token: P.Option.Trade.Pair.Quote.get(),
    tokenIcon: '',
  };

  componentDidMount() {
    this.registerIsMobile('isMobile');
    this.registerObservable('tokenIcon', this.mergeIcon());
    this.registerState('indexUnderlying', P.Option.Trade.Pair.Base);
    this.registerState('token', P.Option.Trade.Pair.Quote);
  }

  componentWillUnmount() {
    this.destroyState();
  }

  mergeIcon(): Observable<string | undefined> {
    return P.Option.Trade.Pair.Quote.watch().pipe(
      switchMap((token: TokenErc20 | null) => {
        return token ? tokenCacheService.getTokenIcon(token) : of(null);
      }),
      map((icon: string | null) => {
        return icon || undefined;
      })
    );
  }

  render() {
    const mobileCss = this.state.isMobile ? styles.mobile : '';
    const styleMr = bindStyleMerger(mobileCss);

    return (
      <div className={styleMr(styles.indexTitle, this.props.className)}>
        <div className={styleMr(styles.icons)}>
          <IndexUnderlyingIcon indexUnderlying={this.state.indexUnderlying} size={this.state.isMobile ? 32 : 48} />

          <div className={styleMr(styles.tokenText)}>
            {this.state.token ? <TokenIcon size={this.state.isMobile ? 16 : 24} token={this.state.token} /> : <></>}
          </div>
        </div>

        <div className={styleMr(styles.titleGroup)}>
          <span className={styleMr(styles.title)}>{this.state.indexUnderlying}</span>
          <span className={styleMr(styles.desc, fontCss.medium)}>
            <I18n id={'trade-index'} />
          </span>
        </div>

        <span className={styleMr(styles.separator)}>/</span>

        <div className={styleMr(styles.titleGroup)}>
          <span className={styleMr(styles.title)}>{this.state.token?.symbol}</span>
          <span className={styleMr(styles.desc, fontCss.medium)}>
            <I18n id={'trade-fees-funding'} />
          </span>
        </div>
      </div>
    );
  }
}
