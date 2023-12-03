import { BaseStateComponent } from '../../../../../../state-manager/base-state-component';
import { P } from '../../../../../../state-manager/page/page-state-parser';
import { bindStyleMerger } from '../../../../../../util/string';
import { poolLiquidityService, TokenPool } from '../../../../services/shield-pool-liquidity.service';
import styles from './liquidity-cell.module.less';
import { SldDecimal } from '../../../../../../util/decimal';
import { of, combineLatest } from 'rxjs';
import { tap } from 'rxjs/operators';
import { TokenAmountInline } from '../../../../../common/content/token-amount-inline';
import { PendingHolder } from '../../../../../common/progress/pending-holder';

type IState = {
  isMobile: boolean;

  liquidity: SldDecimal;
  liquidityPending: boolean;
};
type IProps = {
  tokenPool: TokenPool;
  numClassName?: string;
  hideSym?: boolean;
};

export class LiquidityCell extends BaseStateComponent<IProps, IState> {
  state: IState = {
    isMobile: P.Layout.IsMobile.get(),

    liquidity: SldDecimal.ZERO,
    liquidityPending: false,
  };

  componentDidMount() {
    this.registerIsMobile('isMobile');

    this.mergeLiquidity();
  }

  componentWillUnmount() {
    this.destroyState();
  }

  componentDidUpdate(prevProps: Readonly<IProps>, prevState: Readonly<IState>, snapshot?: any) {
    if (
      prevProps.tokenPool.private !== this.props.tokenPool.private ||
      prevProps.tokenPool.public !== this.props.tokenPool.public
    ) {
      this.mergeLiquidity();
    }
  }

  mergeLiquidity() {
    const publicLiq$ = this.props.tokenPool.public
      ? poolLiquidityService.watchLiquidity(this.props.tokenPool.public)
      : of(SldDecimal.ZERO);
    const privateLiq$ = this.props.tokenPool.private
      ? poolLiquidityService.watchLiquidity(this.props.tokenPool.private)
      : of(SldDecimal.ZERO);

    const liq$ = combineLatest([publicLiq$, privateLiq$]).pipe(
      tap(([publicLiq, privateLiq]) => {
        const liquidity: SldDecimal = (publicLiq || SldDecimal.ZERO).add(privateLiq || SldDecimal.ZERO);
        const liquidityPending: boolean = publicLiq === undefined || privateLiq === undefined;

        this.updateState({ liquidity, liquidityPending });
      })
    );

    this.subWithId(liq$, 'liquidity');
  }

  render() {
    const mobileCss = this.state.isMobile ? styles.mobile : '';
    const styleMr = bindStyleMerger(mobileCss);

    return (
      <PendingHolder loading={this.state.liquidityPending} useIcon={true}>
        <TokenAmountInline
          amount={this.state.liquidity}
          token={this.props.hideSym ? '' : this.props.tokenPool.token.symbol}
          short={true}
          symClassName={styles.label}
          numClassName={this.props.numClassName}
        />
      </PendingHolder>
    );
  }
}
