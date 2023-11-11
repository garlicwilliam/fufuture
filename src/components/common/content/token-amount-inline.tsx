import { BaseStateComponent } from '../../../state-manager/base-state-component';
import { P } from '../../../state-manager/page/page-state-parser';
import { bindStyleMerger } from '../../../util/string';
import { SldDecimal, SldDecPrice, SldUsdValue } from '../../../util/decimal';
import styles from './token-amount-inline.module.less';
import { numString } from '../../../util/math';
import * as _ from 'lodash';
import { Visible } from '../../builtin/hidden';

type IState = {
  isMobile: boolean;
};
type IProps = {
  amount: SldDecimal | SldUsdValue | SldDecPrice | number | null | undefined;
  token: symbol | string;
  className?: string;
  numClassName?: string;
  symClassName?: string;
  fix?: number;
  rmZero?: boolean; // default true
  split?: boolean;
  round?: 0 | 1 | -1;
  short?: boolean;
  maxDisplay?: SldDecimal | SldUsdValue | SldDecPrice | number;
};

export class TokenAmountInline extends BaseStateComponent<IProps, IState> {
  state: IState = {
    isMobile: P.Layout.IsMobile.get(),
  };

  componentDidMount() {
    this.registerIsMobile('isMobile');
  }

  componentWillUnmount() {
    this.destroyState();
  }

  private normalizeAmount(amount: SldDecimal | SldDecPrice | SldUsdValue | number): SldDecimal {
    if (typeof amount === 'number') {
      return SldDecimal.fromNumeric(numString(amount), 18);
    } else {
      return amount.toDecimal();
    }
  }

  private genMinDisplay(): SldDecimal {
    const fix = this.confirmFix();
    const minDisplay: string = fix > 0 ? '0.' + _.repeat('0', fix - 1) + '1' : '1';

    return SldDecimal.fromNumeric(minDisplay, 18);
  }

  private confirmFix(): number {
    return this.props.fix || 2;
  }

  private amountString(): string {
    const ceil = this.props.round === 1;
    const floor = this.props.round === -1;
    const fix = this.confirmFix();

    const option = {
      fix,
      split: this.props.split,
      removeZero: this.props.rmZero,
      ceil,
      floor,
      short: this.props.short,
    };

    let prefix = '';
    let amount: SldDecimal = this.normalizeAmount(this.props.amount || 0);

    const minDisplay: SldDecimal = this.genMinDisplay();
    const maxDisplay: SldDecimal | null = this.props.maxDisplay ? this.normalizeAmount(this.props.maxDisplay) : null;

    if (maxDisplay && amount.gt(maxDisplay)) {
      prefix = '> ';
      amount = maxDisplay;
    } else if (amount.gtZero() && minDisplay.gt(amount)) {
      prefix = '< ';
      amount = minDisplay;
    }

    const numStr = amount.format(option);

    return prefix + numStr;
  }

  render() {
    const mobileCss = this.state.isMobile ? styles.mobile : '';
    const styleMr = bindStyleMerger(mobileCss);

    const tokenSymbol: string =
      typeof this.props.token === 'symbol' ? this.props.token.description || '' : this.props.token;

    const amountStr: string = this.amountString();

    return (
      <div className={styleMr(styles.wrapperToken, this.props.className)}>
        <div className={styleMr(this.props.numClassName)}>{amountStr}</div>

        <Visible when={!!this.props.token}>
          <div className={styleMr(this.props.symClassName)}>{tokenSymbol}</div>
        </Visible>
      </div>
    );
  }
}
