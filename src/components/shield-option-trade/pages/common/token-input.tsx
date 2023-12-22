import { BaseStateComponent } from '../../../../state-manager/base-state-component';
import { P } from '../../../../state-manager/page/page-state-parser';
import { bindStyleMerger, StyleMerger } from '../../../../util/string';
import styles from './token-input.module.less';
import { SldDecimal } from '../../../../util/decimal';
import { DecimalNumInput } from '../../../common/input/num-input-decimal';
import { i18n } from '../../../i18n/i18n-fn';
import { I18n } from '../../../i18n/i18n';
import { ReactNode } from 'react';
import { TokenErc20 } from '../../../../state-manager/state-types';
import { tokenBalanceService } from '../../services/token-balance.service';
import * as _ from 'lodash';
import { tokenCacheService } from '../../services/token-cache.service';
import { tap } from 'rxjs/operators';

type IState = {
  isMobile: boolean;
  balance: SldDecimal | undefined;
  tokenIcon?: string;
};

type IProps = {
  max?: SldDecimal;
  maxLimit?: SldDecimal;
  value?: SldDecimal | null;
  token?: TokenErc20;
  onChange?: (val: null | SldDecimal) => void;
  errorChange?: (isError: boolean) => void;
  placeholderName?: string;
  noPrefix?: boolean;
  align?: 'left' | 'right';
};

export class TokenInput extends BaseStateComponent<IProps, IState> {
  state: IState = {
    isMobile: P.Layout.IsMobile.get(),
    balance: undefined,
  };

  componentDidMount() {
    this.registerIsMobile('isMobile');
    this.updateBalance();
    this.updateIcon();
  }

  componentWillUnmount() {
    this.destroyState();
  }

  componentDidUpdate(prevProps: Readonly<IProps>, prevState: Readonly<IState>, snapshot?: any) {
    if (!_.isEqual(this.props.token, prevProps.token)) {
      this.updateBalance();
      this.updateIcon();
    }
  }

  updateIcon() {
    if (this.props.token) {
      const icon$ = tokenCacheService.getTokenIcon(this.props.token).pipe(
        tap((icon: string | null) => {
          this.updateState({ tokenIcon: icon || undefined });
        })
      );

      this.subOnce(icon$);
    } else {
      this.updateState({ tokenIcon: undefined });
    }
  }

  updateBalance() {
    const balance$ = tokenBalanceService.watchTokenBalance(this.props.token);

    this.subWithId(balance$, 'balance', (balance: SldDecimal) => {
      this.updateState({ balance });
    });
  }

  maxSuffix(styleMr: StyleMerger, max: SldDecimal): ReactNode {
    return (
      <div className={styleMr(styles.maxSuffix)} onClick={() => this.onChange(max)}>
        <I18n id={'trade-max'} textUpper={'uppercase'} />
      </div>
    );
  }

  tokenPrefix(styleMr: StyleMerger, tokenSymbol: string): ReactNode {
    return (
      <div className={styleMr(styles.tokenPrefix)}>
        {this.state.tokenIcon ? <img src={this.state.tokenIcon} alt={''} height={20} /> : <></>}
        {tokenSymbol}
      </div>
    );
  }

  onChange(val: null | SldDecimal) {
    if (this.props.onChange) {
      this.props.onChange(val);
    }
  }

  onError(isError: boolean) {
    if (this.props.errorChange) {
      this.props.errorChange(isError);
    }
  }

  render() {
    const tokenSymbol = this.props.token?.symbol;
    const mobileCss = this.state.isMobile ? styles.mobile : '';
    const styleMr = bindStyleMerger(mobileCss);
    const placeholder = this.props.placeholderName ? this.props.placeholderName : i18n('trade-max');

    const max: SldDecimal = this.props.max
      ? this.props.max
      : this.props.maxLimit && this.state.balance
      ? SldDecimal.min(this.state.balance, this.props.maxLimit)
      : this.state.balance || SldDecimal.ZERO;

    return (
      <div className={styleMr(styles.wrapper)}>
        <DecimalNumInput
          className={styleMr(styles.form)}
          inputClassName={styleMr(styles.input)}
          originDecimal={this.props.token?.decimal || 18}
          max={max}
          suffix={this.maxSuffix(styleMr, max)}
          prefix={this.props.noPrefix ? undefined : this.tokenPrefix(styleMr, tokenSymbol || '')}
          placeholder={placeholder + ' ' + max.format({ fix: 4, floor: true, removeZero: true })}
          value={this.props.value}
          onChange={this.onChange.bind(this)}
          onErrorChange={this.onError.bind(this)}
          align={this.props.align || 'right'}
        />
      </div>
    );
  }
}
