import { BaseStateComponent } from '../../../../../state-manager/base-state-component';
import { P } from '../../../../../state-manager/page/page-state-parser';
import { bindStyleMerger, cssPick, StyleMerger } from '../../../../../util/string';
import styles from './open-amount.module.less';
import { DecimalNumInput } from '../../../../common/input/num-input-decimal';
import { ReactNode } from 'react';
import { I18n } from '../../../../i18n/i18n';
import { SldDecimal, SldDecPercent } from '../../../../../util/decimal';
import { i18n } from '../../../../i18n/i18n-fn';
import { ShieldUnderlyingType, TokenErc20 } from '../../../../../state-manager/state-types';
import { IndexUnderlyingDecimal } from '../../../const/assets';
import { S } from '../../../../../state-manager/contract/contract-state-parser';
import { SldPercentSlider } from '../../common/percent-slider';
import { SLD_ENV_CONF } from '../../../const/env';
import { baseBigNumber } from '../../../../../util/ethers';

type IState = {
  isMobile: boolean;
  inputAmount: SldDecimal | null;
  maxOpen: SldDecimal;
  quoteToken: TokenErc20 | null;
  baseToken: ShieldUnderlyingType;

  percentVal: SldDecPercent;
  percentError: boolean;
  blurVal: any;
};

type IProps = {
  errorChange?: (isError: boolean) => void;
};

export class OpenAmount extends BaseStateComponent<IProps, IState> {
  state: IState = {
    isMobile: P.Layout.IsMobile.get(),
    inputAmount: P.Option.Trade.Open.Amount.get(),
    maxOpen: SldDecimal.ZERO,
    quoteToken: P.Option.Trade.Pair.Quote.get(),
    baseToken: P.Option.Trade.Pair.Base.get(),
    percentVal: SldDecPercent.ZERO,
    percentError: false,
    blurVal: undefined,
  };

  componentDidMount() {
    this.registerIsMobile('isMobile');
    this.registerState('maxOpen', S.Option.Order.Open.Max);
    this.registerState('quoteToken', P.Option.Trade.Pair.Quote);
    this.registerState('baseToken', P.Option.Trade.Pair.Base);
    this.registerState('inputAmount', P.Option.Trade.Open.Amount);
  }

  componentWillUnmount() {
    this.destroyState();
  }

  onMax() {
    this.onChange(this.state.maxOpen);
  }

  onChange(val: SldDecimal | null) {
    P.Option.Trade.Open.Amount.set(val);
    P.Option.Trade.Calculator.OpenAmount.set(val);
  }

  onPercentChange(percent: SldDecPercent) {
    if (percent.gtZero()) {
      const curInput: SldDecimal = percent
        .applyTo(this.state.maxOpen)
        .fix(SLD_ENV_CONF.FixDigits.Open[this.state.baseToken]);

      this.onChange(curInput);

      const fixDigit: number = SLD_ENV_CONF.FixDigits.Open[this.state.baseToken];
      const minVal: SldDecimal = SldDecimal.fromOrigin(
        baseBigNumber(IndexUnderlyingDecimal - fixDigit),
        IndexUnderlyingDecimal
      );
      const isPercentValSmall: boolean = curInput.lt(minVal);

      this.updateState({ percentError: isPercentValSmall });
    } else {
      this.updateState({ percentError: false });
      this.onChange(null);
    }

    this.updateState({ percentVal: percent, blurVal: new Date() });
  }

  onFocusInput(isFocus: boolean) {
    if (isFocus) {
      this.updateState({ percentVal: SldDecPercent.ZERO, percentError: false });
    }
  }

  genMaxSuffix(styleMr: StyleMerger): ReactNode {
    return (
      <div className={styleMr(styles.suffix)} onClick={this.onMax.bind(this)}>
        <I18n id={'trade-max'} textUpper={'uppercase'} />
      </div>
    );
  }

  genPercentSuffix(styleMr: StyleMerger): ReactNode {
    return <div className={styleMr(styles.suffixPercent)}>{this.state.percentVal.percentFormat({ fix: 0 })}%</div>;
  }

  render() {
    const mobileCss = this.state.isMobile ? styles.mobile : '';
    const styleMr: StyleMerger = bindStyleMerger(mobileCss);

    const fix: number = SLD_ENV_CONF.FixDigits.Open[this.state.baseToken];

    return (
      <div className={styleMr(styles.wrapperOpen)}>
        <div className={styleMr(styles.title)}>
          <I18n id={'trade-amount'} /> ( {this.state.baseToken} )
        </div>

        <DecimalNumInput
          originDecimal={IndexUnderlyingDecimal}
          noBorder={true}
          className={styleMr(styles.form)}
          inputClassName={styleMr(styles.input, cssPick(this.state.percentVal.gtZero(), styles.inPercent))}
          suffix={this.state.percentVal.isZero() ? this.genMaxSuffix(styleMr) : this.genPercentSuffix(styleMr)}
          max={this.state.maxOpen}
          fix={fix}
          placeholder={i18n('trade-max') + ' ' + this.state.maxOpen.format({ fix, floor: true, removeZero: true })}
          value={this.state.inputAmount}
          onChange={this.onChange.bind(this)}
          onErrorChange={this.props.errorChange}
          forceError={this.state.percentError}
          onFocus={this.onFocusInput.bind(this)}
          blur={this.state.blurVal}
        />

        <SldPercentSlider percent={this.state.percentVal} onChange={this.onPercentChange.bind(this)} />
      </div>
    );
  }
}
