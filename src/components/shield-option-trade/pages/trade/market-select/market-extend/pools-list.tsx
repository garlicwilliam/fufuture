import { BaseStateComponent } from '../../../../../../state-manager/base-state-component';
import { P } from '../../../../../../state-manager/page/page-state-parser';
import { bindStyleMerger, pxStr } from '../../../../../../util/string';
import { TokenPool, TokenPoolList } from '../../../../services/shield-pool-liquidity.service';
import styles from './pools-list.module.less';
import { TokenIcon } from '../../../common/token-icon';
import { LiquidityCell } from './liquidity-cell';
import { TokenAmountInline } from '../../../../../common/content/token-amount-inline';
import { fontCss } from '../../../../../i18n/font-switch';
import { I18n } from '../../../../../i18n/i18n';
import { PendingHolder } from '../../../../../common/progress/pending-holder';
import { FixPadding } from '../../../../../common/content/fix-padding';

type IState = {
  isMobile: boolean;
};
type IProps = {
  tokenPools: TokenPoolList | undefined;
  onSelect: (pool: TokenPool) => void;
  maxHeight?: number;
};

export class PoolsList extends BaseStateComponent<IProps, IState> {
  state: IState = {
    isMobile: P.Layout.IsMobile.get(),
  };

  componentDidMount() {
    this.registerIsMobile('isMobile');
  }

  componentWillUnmount() {
    this.destroyState();
  }

  render() {
    const mobileCss = this.state.isMobile ? styles.mobile : '';
    const styleMr = bindStyleMerger(mobileCss);

    return (
      <div className={styleMr(styles.poolList)} style={{ maxHeight: pxStr(this.props.maxHeight) }}>
        {this.props.tokenPools ? (
          this.props.tokenPools.pools && this.props.tokenPools.pools.length > 0 ? (
            this.props.tokenPools.pools.map(pool => {
              return (
                <div
                  className={styleMr(styles.poolItem)}
                  key={pool.token.address}
                  onClick={() => this.props.onSelect(pool)}
                >
                  <div className={styleMr(styles.leftTitle)}>
                    <TokenIcon className={styleMr(styles.poolTokenIcon)} size={24} token={pool.token} />

                    <div className={styleMr(styles.poolTokenSymbol, fontCss.bold)}>{pool.token.symbol}</div>

                    <div className={styleMr(styles.poolTokenVolume)}>
                      <I18n id={'trade-24h-volume'} />
                      :&nbsp;
                      <TokenAmountInline
                        amount={pool.volume}
                        short={true}
                        token={this.props.tokenPools?.underlying || ''}
                      />
                    </div>
                  </div>

                  <div className={styleMr(styles.rightLiquidity)}>
                    <LiquidityCell
                      tokenPool={pool}
                      hideSym={true}
                      numClassName={styleMr(styles.numFont, fontCss.boldLatin)}
                    />
                  </div>
                </div>
              );
            })
          ) : (
            <div className={styleMr(styles.emptyList)}>
              <FixPadding top={30} bottom={0} mobTop={30} mobBottom={0}>
                <I18n id={'com-no-data'} />
              </FixPadding>
            </div>
          )
        ) : (
          <FixPadding top={20} bottom={0} mobTop={20} mobBottom={0}>
            <PendingHolder loading={true} width={'100%'} height={24} />
            <PendingHolder loading={true} width={'100%'} height={24} />
          </FixPadding>
        )}
      </div>
    );
  }
}
