import { BaseStateComponent } from '../../../../../../state-manager/base-state-component';
import { P } from '../../../../../../state-manager/page/page-state-parser';
import { bindStyleMerger } from '../../../../../../util/string';
import styles from './liquidity.module.less';
import { BlockTitle } from '../../../common/block-title';
import { PoolUseInfo } from './pool-use';
import { ShieldTokenPoolInfo, StateNull, StateNullType, TokenErc20 } from '../../../../../../state-manager/state-types';
import { I18n } from '../../../../../i18n/i18n';
import { S } from '../../../../../../state-manager/contract/contract-state-parser';
import { snRep } from '../../../../../../state-manager/interface-util';
import { Network } from '../../../../../../constant/network';
import { walletState } from '../../../../../../state-manager/wallet/wallet-state';
import { isSameToken } from '../../../../../../util/token';

type IState = {
  isMobile: boolean;
  quoteToken: TokenErc20 | null;
  network: Network | null;
  poolInfo: ShieldTokenPoolInfo | StateNullType;
};
type IProps = {};

export class LiquidityInfo extends BaseStateComponent<IProps, IState> {
  state: IState = {
    isMobile: P.Layout.IsMobile.get(),
    quoteToken: P.Option.Trade.Pair.Quote.get(),
    network: null,
    poolInfo: StateNull,
  };

  componentDidMount() {
    this.registerIsMobile('isMobile');
    this.registerState('quoteToken', P.Option.Trade.Pair.Quote);
    this.registerState('poolInfo', S.Option.Pool.Info);
    this.registerObservable('network', walletState.NETWORK);
  }

  componentWillUnmount() {
    this.destroyState();
  }

  render() {
    const mobileCss = this.state.isMobile ? styles.mobile : '';
    const styleMr = bindStyleMerger(mobileCss);

    const pool = snRep(this.state.poolInfo);
    const privateLoaded: boolean =
      pool?.priInfo?.network === this.state.network && isSameToken(pool.priInfo.token, this.state.quoteToken);
    const publicLoaded: boolean =
      pool?.pubInfo?.network === this.state.network && isSameToken(pool.pubInfo.token, this.state.quoteToken);

    return (
      <div className={styleMr(styles.wrapperLiquidity)}>
        <BlockTitle title={<I18n id={'trade-liquidity-pool'} />} />

        <div className={styleMr(styles.liquidityCard)}>
          <PoolUseInfo
            poolTitle={<I18n id={'trade-pool-private'} />}
            poolInfo={pool?.priInfo || null}
            token={pool?.token || null}
            loading={!privateLoaded}
          />

          <PoolUseInfo
            poolTitle={<I18n id={'trade-pool-public'} />}
            poolInfo={pool?.pubInfo || null}
            token={pool?.token || null}
            loading={!publicLoaded}
          />
        </div>
      </div>
    );
  }
}
