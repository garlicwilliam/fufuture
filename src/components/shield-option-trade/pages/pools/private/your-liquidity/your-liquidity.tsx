import { BaseStateComponent } from '../../../../../../state-manager/base-state-component';
import { P } from '../../../../../../state-manager/page/page-state-parser';
import { bindStyleMerger } from '../../../../../../util/string';
import styles from './your-liquidity.module.less';
import { fontCss } from '../../../../../i18n/font-switch';
import { LiquidityCard } from './liquidity-card';
import { LiquiditySetting } from './liquidity-setting';
import { SldButton } from '../../../../../common/buttons/sld-button';
import { I18n } from '../../../../../i18n/i18n';
import { AddPrivateLiquidity } from './add-liquidity';
import { WithdrawPrivateLiquidity } from './withdraw-liquidity';
import { FixPadding } from '../../../../../common/content/fix-padding';
import {
  ShieldMakerPrivatePoolInfo,
  ShieldMakerPrivatePoolInfoRs,
  StateNullType,
} from '../../../../../../state-manager/state-types';
import { Visible } from '../../../../../builtin/hidden';
import { ShieldLoading } from '../../../common/loading';
import { D } from '../../../../../../state-manager/database/database-state-parser';
import { SldEmpty } from '../../../../../common/content/empty';
import { Network } from '../../../../../../constant/network';
import { walletState } from '../../../../../../state-manager/wallet/wallet-state';
import { isSameAddress } from '../../../../../../util/address';
import { makerPriLiquidityGetter } from '../../../../../../state-manager/contract/contract-getter-cpx-shield';
import { EMPTY_ADDRESS } from '../../../../../../constant';
import { switchMap } from 'rxjs';
import { ethers } from 'ethers';
import { filter, map, take, tap } from 'rxjs/operators';
import { isSN, snRep } from '../../../../../../state-manager/interface-util';

type IState = {
  isMobile: boolean;
  liquidityRs: ShieldMakerPrivatePoolInfoRs | undefined;
  network: Network | null;
  userAddr: string | null;
};
type IProps = {};

export class YourLiquidity extends BaseStateComponent<IProps, IState> {
  state: IState = {
    isMobile: P.Layout.IsMobile.get(),
    liquidityRs: undefined,
    network: null,
    userAddr: null,
  };

  componentDidMount() {
    this.registerIsMobile('isMobile');
    this.registerState('liquidityRs', D.Option.Maker.YourLiquidity);
    this.registerObservable('network', walletState.NETWORK);
    this.registerObservable('userAddr', walletState.USER_ADDR);
  }

  componentWillUnmount() {
    this.destroyState();
  }

  onAdd() {
    P.Option.Pools.Private.Liquidity.Add.IsVisible.set(true);
  }

  private refreshOne(pool: ShieldMakerPrivatePoolInfo) {
    if (
      this.state.liquidityRs?.pools &&
      pool.network === walletState.getCurNetwork() &&
      isSameAddress(pool.holder, walletState.getCurAccount() || EMPTY_ADDRESS)
    ) {
      const fresh$ = walletState.watchWeb3Provider().pipe(
        take(1),
        switchMap((provider: ethers.providers.Provider) => {
          return makerPriLiquidityGetter(pool.holder, pool.priPoolAddress, provider);
        }),
        map((newPool: ShieldMakerPrivatePoolInfo | StateNullType) => {
          return snRep(newPool);
        }),
        filter(Boolean),
        tap((newPool: ShieldMakerPrivatePoolInfo) => {
          if (
            this.state.liquidityRs?.pools &&
            isSameAddress(this.state.liquidityRs.maker, newPool.holder) &&
            this.state.liquidityRs.network === newPool.network
          ) {
            const offset: number = this.state.liquidityRs.pools.findIndex(one =>
              isSameAddress(one.priPoolAddress, newPool.priPoolAddress)
            );

            if (offset >= 0) {
              const pools = this.state.liquidityRs.pools;
              pools.splice(offset, 1, newPool);

              this.updateState({ liquidityRs: Object.assign({}, this.state.liquidityRs, { pools: [...pools] }) });
            }
          }
        })
      );

      this.subOnce(fresh$);
    }
  }

  render() {
    const mobileCss = this.state.isMobile ? styles.mobile : '';
    const styleMr = bindStyleMerger(mobileCss);

    const isLoading =
      !this.state.liquidityRs ||
      this.state.liquidityRs.network !== this.state.network ||
      !this.state.userAddr ||
      !isSameAddress(this.state.liquidityRs.maker, this.state.userAddr);

    const listLength: number = this.state.liquidityRs?.pools.length || 0;

    return (
      <>
        <div className={styleMr(styles.wrapperYour)}>
          <div className={styleMr(styles.cardTitle, fontCss.bolder)}>
            <I18n id={'trade-liquidity-yours'} />
          </div>

          <div className={styleMr(styles.cardList)}>
            <Visible when={isLoading}>
              <FixPadding top={40} bottom={0} mobTop={30} mobBottom={0}>
                <ShieldLoading size={40} />
              </FixPadding>
            </Visible>

            <Visible when={!isLoading && listLength === 0}>
              <FixPadding top={40} bottom={0} mobTop={30} mobBottom={0}>
                <SldEmpty />
              </FixPadding>
            </Visible>

            {/* liquidity items list */}
            <Visible when={!isLoading && listLength > 0}>
              {this.state.liquidityRs?.pools?.map((one, i) => {
                return <LiquidityCard key={i} poolInfo={one} />;
              })}
            </Visible>
          </div>

          <div className={styleMr(styles.actions)}>
            <FixPadding top={30} bottom={0} mobTop={16} mobBottom={0}>
              <SldButton
                size={'large'}
                type={'primary'}
                className={styleMr(styles.btn)}
                onClick={this.onAdd.bind(this)}
              >
                <I18n id={'trade-liquidity-add'} textUpper={'uppercase'} />
              </SldButton>
            </FixPadding>
          </div>
        </div>

        <LiquiditySetting onDone={(pool: ShieldMakerPrivatePoolInfo) => this.refreshOne(pool)} />
        <AddPrivateLiquidity />
        <WithdrawPrivateLiquidity onDone={(pool: ShieldMakerPrivatePoolInfo) => this.refreshOne(pool)} />
      </>
    );
  }
}
