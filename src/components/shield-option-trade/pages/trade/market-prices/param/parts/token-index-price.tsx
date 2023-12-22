import { BaseStateComponent } from '../../../../../../../state-manager/base-state-component';
import { P } from '../../../../../../../state-manager/page/page-state-parser';
import { bindStyleMerger, cssPick } from '../../../../../../../util/string';
import styles from './token-index-price.module.less';
import { fontCss } from '../../../../../../i18n/font-switch';
import { SldDecPrice } from '../../../../../../../util/decimal';
import { S } from '../../../../../../../state-manager/contract/contract-state-parser';
import { PendingHolder } from '../../../../../../common/progress/pending-holder';
import { TokenIndex } from '../../../../common/token-index';
import { interval } from 'rxjs';
import { startWith, tap } from 'rxjs/operators';
import { ShieldUnderlyingType } from '../../../../../../../state-manager/state-types';

type IState = {
  isMobile: boolean;
  baseToken: ShieldUnderlyingType;
  basePrice: SldDecPrice | undefined;
  basePriceLast: SldDecPrice | undefined;
};
type IProps = {
  layoutWidth: number;
  className?: string;
};

export class TokenIndexPrice extends BaseStateComponent<IProps, IState> {
  state: IState = {
    isMobile: P.Layout.IsMobile.get(),
    baseToken: P.Option.Trade.Pair.Base.get(),
    basePrice: undefined,
    basePriceLast: undefined,
  };

  componentDidMount() {
    this.registerIsMobile('isMobile');
    this.registerState('baseToken', P.Option.Trade.Pair.Base);
    this.registerState('basePrice', S.Option.Oracle.CurBaseToken);

    this.registerStateWithLast(
      'basePrice',
      'basePriceLast',
      S.Option.Oracle.CurBaseToken,
      (a, b) => a === b || (!!a && !!b && a.eq(b))
    );

    this.tickInterval(10000, S.Option.Oracle.CurBaseToken);
  }

  componentWillUnmount() {
    this.destroyState();
  }

  render() {
    const mobileCss = this.state.isMobile ? styles.mobile : '';
    const styleMr = bindStyleMerger(mobileCss);

    const isLong: boolean =
      !!this.state.basePrice && !!this.state.basePriceLast && this.state.basePrice.gt(this.state.basePriceLast);

    const isShort: boolean =
      !!this.state.basePrice && !!this.state.basePriceLast && this.state.basePrice.lt(this.state.basePriceLast);

    return (
      <div className={styleMr(styles.wrapperIndex, this.props.className)}>
        <div className={styleMr(styles.index, fontCss.boldLatin)}>
          <TokenIndex token={this.state.baseToken} />
        </div>

        <div className={styleMr(styles.price, fontCss.boldLatin)}>
          <PendingHolder height={'24px'} width={80} loading={!this.state.basePrice}>
            <span className={styleMr(cssPick(isLong, 'longStyle'), cssPick(isShort, 'shortStyle'))}>
              {this.state.basePrice?.format({ fix: 2 })}
            </span>
          </PendingHolder>
        </div>
      </div>
    );
  }
}
