import { BaseStateComponent } from '../../../../../../state-manager/base-state-component';
import { P } from '../../../../../../state-manager/page/page-state-parser';
import { bindStyleMerger } from '../../../../../../util/string';
import styles from './pool-share.module.less';
import { fontCss } from '../../../../../i18n/font-switch';
import { PoolItem } from './pool-item';
import { ShieldMakerPublicPoolShare, ShieldMakerPublicPoolShareRs } from '../../../../../../state-manager/state-types';
import { WithdrawPublic } from './withdraw-public';
import { I18n } from '../../../../../i18n/i18n';
import { Visible } from '../../../../../builtin/hidden';
import { ShieldLoading } from '../../../common/loading';
import { FixPadding } from '../../../../../common/content/fix-padding';
import { D } from '../../../../../../state-manager/database/database-state-parser';
import { SldEmpty } from '../../../../../common/content/empty';
import { Network } from '../../../../../../constant/network';
import { walletState } from '../../../../../../state-manager/wallet/wallet-state';
import { isSameAddress } from '../../../../../../util/address';

type IState = {
  isMobile: boolean;
  network: Network | null;
  maker: string | null;
  shareRs: ShieldMakerPublicPoolShareRs | undefined;
};
type IProps = {};

export class PoolShare extends BaseStateComponent<IProps, IState> {
  state: IState = {
    isMobile: P.Layout.IsMobile.get(),
    network: null,
    maker: null,
    shareRs: undefined,
  };

  componentDidMount() {
    this.registerIsMobile('isMobile');
    this.registerState('shareRs', D.Option.Maker.YourShareInPools);
    this.registerObservable('network', walletState.NETWORK);
    this.registerObservable('maker', walletState.USER_ADDR);
  }

  componentWillUnmount() {
    this.destroyState();
  }

  getShareList(): ShieldMakerPublicPoolShare[] | undefined {
    const isLoading: boolean =
      !this.state.shareRs ||
      this.state.shareRs.network !== this.state.network ||
      !this.state.maker ||
      !isSameAddress(this.state.maker, this.state.shareRs.maker);

    return isLoading ? undefined : this.state.shareRs?.pools;
  }

  render() {
    const mobileCss = this.state.isMobile ? styles.mobile : '';
    const styleMr = bindStyleMerger(mobileCss);

    const shares = this.getShareList();

    return (
      <div className={styleMr(styles.wrapperShare)}>
        <div className={styleMr(styles.cardTitle, fontCss.bolder)}>
          <I18n id={'trade-liquidity-share'} />
        </div>

        <div className={styleMr(styles.poolList)}>
          <Visible when={!shares}>
            <FixPadding top={40} bottom={0} mobTop={30} mobBottom={0}>
              <ShieldLoading size={40} />
            </FixPadding>
          </Visible>

          <Visible when={!!shares && shares.length > 0}>
            {shares?.map((one: ShieldMakerPublicPoolShare, index: number) => {
              return <PoolItem key={index} pubShare={one} />;
            })}
          </Visible>

          <Visible when={!!shares && shares.length === 0}>
            <FixPadding top={40} bottom={0} mobTop={30} mobBottom={0}>
              <SldEmpty />
            </FixPadding>
          </Visible>
        </div>

        <WithdrawPublic />
      </div>
    );
  }
}
