import { BaseStateComponent } from '../../../state-manager/base-state-component';
import { P } from '../../../state-manager/page/page-state-parser';
import { bindStyleMerger, StyleMerger } from '../../../util/string';
import { SldDecimal, SldDecPrice, SldUsdValue } from '../../../util/decimal';
import styles from './token-amount-inline.module.less';
import { FormatOption, numString } from '../../../util/math';
import * as _ from 'lodash';
import { Visible } from '../../builtin/hidden';
import { PendingHolder } from '../progress/pending-holder';

type IState = {
  isMobile: boolean;
};
type IProps = {
  amount: SldDecimal | SldUsdValue | SldDecPrice | number | null | undefined;
  token: symbol | string;
  className?: string;
  numClassName?: string;
  symClassName?: string;
  fix?: number | { min: number; fix: number };
  precision?: number;
  rmZero?: boolean; // default true
  split?: boolean;
  round?: 0 | 1 | -1;
  short?: boolean;
  sign?: boolean;
  maxDisplay?: SldDecimal | SldUsdValue | SldDecPrice | number;
  useMinDisplay?: boolean;
  pending?: boolean | { isPending: boolean; width?: number; height?: number; useIcon?: boolean };
  debug?: boolean;
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
    if (this.props.fix === undefined) {
      return 2;
    } else if (typeof this.props.fix === 'number') {
      return this.props.fix;
    } else if (typeof this.props.fix === 'object') {
      return this.props.fix.fix;
    }

    return 2;
  }

  private amountString(): string {
    const ceil: boolean = this.props.round === 1;
    const floor: boolean = this.props.round === -1;
    const fix: number = this.confirmFix();

    let precision = this.props.precision;
    if (this.props.amount) {
      const strnum: string =
        typeof this.props.amount === 'number' ? numString(this.props.amount) : this.props.amount.toNumeric(true);

      const [intPart] = strnum.split('.');

      // at lease 2 decimal
      if (!!precision && intPart.length + 2 >= precision) {
        precision = intPart.length + Math.min(fix, 2);
      }
    }

    const option: FormatOption = {
      fix,
      split: this.props.split,
      removeZero: this.props.rmZero,
      ceil,
      floor,
      short: this.props.short,
      sign: this.props.sign,
      precision: precision,
      debug: this.props.debug,
    };

    let prefix: string = '';
    let amount: SldDecimal = this.normalizeAmount(this.props.amount || 0);

    const minDisplay: SldDecimal = this.genMinDisplay();
    const maxDisplay: SldDecimal | null = this.props.maxDisplay ? this.normalizeAmount(this.props.maxDisplay) : null;

    if (maxDisplay && amount.gt(maxDisplay)) {
      prefix = '> ';
      amount = maxDisplay;
    } else if (amount.gtZero() && minDisplay.gt(amount) && this.props.useMinDisplay !== false) {
      prefix = '< ';
      amount = minDisplay;
    }

    let numStr: string = amount.format(option);

    if (this.props.rmZero && this.props.fix && this.props.fix?.['min'] > 0) {
      const minFix: number = (this.props.fix as { min: number }).min;
      const [intPart, dec] = numStr.split('.');
      let decPart: string = dec || '';

      if (decPart.length < minFix) {
        decPart = decPart + _.repeat('0', minFix - decPart.length);
      }

      numStr = intPart + '.' + decPart;
    }

    return prefix + numStr;
  }

  genPendingProps(): { isPending: boolean; width?: number; height?: number; useIcon?: boolean } {
    const isPending: boolean =
      this.props.pending === true || (this.props.pending !== false && !!this.props.pending?.isPending);

    const width: number | undefined = typeof this.props.pending === 'object' ? this.props.pending.width : undefined;
    const height: number | undefined = typeof this.props.pending === 'object' ? this.props.pending.height : undefined;
    const useIcon: boolean | undefined =
      typeof this.props.pending === 'object' ? this.props.pending.useIcon : undefined;

    return { isPending, width, height, useIcon };
  }

  render() {
    const mobileCss: string = this.state.isMobile ? styles.mobile : '';
    const styleMr: StyleMerger = bindStyleMerger(mobileCss);

    const tokenSymbol: string =
      typeof this.props.token === 'symbol' ? this.props.token.description || '' : this.props.token;

    const amountStr: string = this.amountString();

    const { isPending, width, height, useIcon } = this.genPendingProps();

    return (
      <div
        className={styleMr(styles.wrapperToken, this.props.className)}
        style={isPending ? { alignItems: 'flex-end' } : undefined}
      >
        <div className={styleMr(this.props.numClassName)} style={{ lineHeight: isPending ? 0 : undefined }}>
          <PendingHolder loading={isPending} width={width} height={height} useIcon={useIcon}>
            {amountStr}
          </PendingHolder>
        </div>

        <Visible when={!!this.props.token}>
          <div className={styleMr(this.props.symClassName)}>{tokenSymbol}</div>
        </Visible>
      </div>
    );
  }
}
