import { BaseStateComponent } from '../../../../../../../state-manager/base-state-component';
import { P } from '../../../../../../../state-manager/page/page-state-parser';
import { bindStyleMerger, cssPick } from '../../../../../../../util/string';
import styles from './token-index-price.module.less';
import { fontCss } from '../../../../../../i18n/font-switch';
import { S } from '../../../../../../../state-manager/contract/contract-state-parser';
import { PendingHolder } from '../../../../../../common/progress/pending-holder';
import { TokenIndex } from '../../../../common/token-index';
import { ShieldUnderlyingPrice, ShieldUnderlyingType } from '../../../../../../../state-manager/state-types';
import { Network } from '../../../../../../../constant/network';
import { walletState } from '../../../../../../../state-manager/wallet/wallet-state';

type IState = {
  isMobile: boolean;
  network: Network | null;
  baseToken: ShieldUnderlyingType;
  basePrice: ShieldUnderlyingPrice | undefined;
  basePriceLast: ShieldUnderlyingPrice | undefined;
};
type IProps = {
  layoutWidth: number;
  className?: string;
};

function comparePrice(
  price1: ShieldUnderlyingPrice | undefined | null,
  price2: ShieldUnderlyingPrice | undefined | null
): boolean {
  return (
    price1 === price2 ||
    (!!price1 &&
      !!price2 &&
      price1.price.eq(price2.price) &&
      price1.underlying === price2.underlying &&
      price1.network === price2.network)
  );
}

export class TokenIndexPrice extends BaseStateComponent<IProps, IState> {
  state: IState = {
    isMobile: P.Layout.IsMobile.get(),
    network: null,
    baseToken: P.Option.Trade.Pair.Base.get(),
    basePrice: undefined,
    basePriceLast: undefined,
  };

  componentDidMount() {
    this.registerIsMobile('isMobile');
    this.registerObservable('network', walletState.NETWORK);
    this.registerState('baseToken', P.Option.Trade.Pair.Base);
    this.registerState('basePrice', S.Option.Oracle.CurBaseToken);

    this.registerStateWithLast('basePrice', 'basePriceLast', S.Option.Oracle.CurBaseToken, comparePrice);

    this.tickInterval(10000, S.Option.Oracle.CurBaseToken);
  }

  componentWillUnmount() {
    this.destroyState();
  }

  render() {
    const mobileCss = this.state.isMobile ? styles.mobile : '';
    const styleMr = bindStyleMerger(mobileCss);

    const isLong: boolean =
      !!this.state.basePrice &&
      !!this.state.basePriceLast &&
      this.state.basePrice.underlying === this.state.basePriceLast.underlying &&
      this.state.basePrice.price.gt(this.state.basePriceLast.price);

    const isShort: boolean =
      !!this.state.basePrice &&
      !!this.state.basePriceLast &&
      this.state.basePrice.underlying === this.state.basePriceLast.underlying &&
      this.state.basePrice.price.lt(this.state.basePriceLast.price);

    return (
      <div className={styleMr(styles.wrapperIndex, this.props.className)}>
        <div className={styleMr(styles.index, fontCss.boldLatin)}>
          <TokenIndex token={this.state.baseToken} />
        </div>

        <div className={styleMr(styles.price, fontCss.boldLatin)}>
          <PendingHolder
            height={this.state.isMobile ? '20px' : '24px'}
            width={100}
            loading={
              !this.state.basePrice ||
              this.state.basePrice.underlying !== this.state.baseToken ||
              this.state.basePrice.network !== this.state.network
            }
          >
            <span className={styleMr(cssPick(isLong, 'longStyle'), cssPick(isShort, 'shortStyle'))}>
              {this.state.basePrice?.price?.format({ fix: 2 })}
            </span>
          </PendingHolder>
        </div>
      </div>
    );
  }
}
