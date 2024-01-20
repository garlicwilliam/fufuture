import { BaseStateComponent } from '../../../../../../state-manager/base-state-component';
import { P } from '../../../../../../state-manager/page/page-state-parser';
import { bindStyleMerger, cssPick } from '../../../../../../util/string';
import styles from './index-funding-info.module.less';
import { ShieldUnderlyingPrice, ShieldUnderlyingType, TokenErc20 } from '../../../../../../state-manager/state-types';
import { SldDecPrice } from '../../../../../../util/decimal';
import { S } from '../../../../../../state-manager/contract/contract-state-parser';
import { I18n } from '../../../../../i18n/i18n';

type IState = {
  isMobile: boolean;
  base: ShieldUnderlyingType;
  token: TokenErc20 | null;
  price: ShieldUnderlyingPrice | null;
};
type IProps = {
  className?: string;
  isExt?: boolean;
};

export class IndexFundingInfo extends BaseStateComponent<IProps, IState> {
  state: IState = {
    isMobile: P.Layout.IsMobile.get(),
    base: P.Option.Trade.Pair.Base.get(),
    token: P.Option.Trade.Pair.Quote.get(),
    price: null,
  };

  componentDidMount() {
    this.registerIsMobile('isMobile');
    this.registerState('token', P.Option.Trade.Pair.Quote);
    this.registerState('base', P.Option.Trade.Pair.Base);
    this.registerState('price', S.Option.Oracle.CurBaseToken);
  }

  componentWillUnmount() {
    this.destroyState();
  }

  render() {
    const mobileCss = this.state.isMobile ? styles.mobile : '';
    const styleMr = bindStyleMerger(mobileCss);

    return (
      <div className={styleMr(styles.fundingInfo, cssPick(this.props.isExt, styles.ext), this.props.className)}>
        <span className={styleMr(styles.index)}>
          {this.state.base}{' '}
          <span className={styleMr(styles.unit)}>
            <I18n id={'trade-index'} />
          </span>
        </span>
        <span className={styleMr(styles.separator)}>&nbsp;=&nbsp;</span>
        <span className={styleMr(styles.point)}>
          {this.state.price?.price.format()} <span className={styleMr(styles.unit)}>{this.state.token?.symbol}</span>
        </span>
      </div>
    );
  }
}
