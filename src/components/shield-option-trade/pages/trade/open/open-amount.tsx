import { BaseStateComponent } from '../../../../../state-manager/base-state-component';
import { P } from '../../../../../state-manager/page/page-state-parser';
import { bindStyleMerger, StyleMerger } from '../../../../../util/string';
import styles from './open-amount.module.less';
import { DecimalNumInput } from '../../../../common/input/num-input-decimal';
import { ReactNode } from 'react';
import { I18n } from '../../../../i18n/i18n';
import { SldDecimal } from '../../../../../util/decimal';
import { i18n } from '../../../../i18n/i18n-fn';
import { TokenErc20 } from '../../../../../state-manager/state-types';
import { IndexUnderlyingDecimal, IndexUnderlyingType } from '../../../const/assets';
import { S } from '../../../../../state-manager/contract/contract-state-parser';

type IState = {
  isMobile: boolean;
  inputAmount: SldDecimal | null;
  maxOpen: SldDecimal;
  quoteToken: TokenErc20 | null;
  baseToken: IndexUnderlyingType;
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

  genMaxSuffix(styleMr: StyleMerger): ReactNode {
    return (
      <div className={styleMr(styles.suffix)} onClick={this.onMax.bind(this)}>
        <I18n id={'trade-max'} textUpper={'uppercase'} />
      </div>
    );
  }

  render() {
    const mobileCss = this.state.isMobile ? styles.mobile : '';
    const styleMr = bindStyleMerger(mobileCss);

    return (
      // TODO ETH decimal is 18, what is about btc ?
      <div className={styleMr(styles.wrapperOpen)}>
        <div className={styleMr(styles.title)}>
          <I18n id={'trade-amount'} /> ( {this.state.baseToken} )
        </div>

        <DecimalNumInput
          originDecimal={IndexUnderlyingDecimal}
          noBorder={true}
          className={styleMr(styles.form)}
          inputClassName={styleMr(styles.input)}
          suffix={this.genMaxSuffix(styleMr)}
          max={this.state.maxOpen}
          fix={1}
          placeholder={i18n('trade-max') + ' ' + this.state.maxOpen.format({ fix: 1 })}
          value={this.state.inputAmount}
          onChange={this.onChange.bind(this)}
          onErrorChange={this.props.errorChange}
        />
      </div>
    );
  }
}
