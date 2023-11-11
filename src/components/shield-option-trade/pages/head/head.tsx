import { BaseStateComponent } from '../../../../state-manager/base-state-component';
import { P } from '../../../../state-manager/page/page-state-parser';
import { bindStyleMerger, cssPick } from '../../../../util/string';
import styles from './head.module.less';
import { ShieldLogo } from '../../../shield-option-common/head/logo/shield-logo';
import { OptionMenuList } from '../../../shield-option-common/head/menu/option-menu-list';
import { Visible } from '../../../builtin/hidden';
import { WalletAddress } from '../../../header-wallet/sub-components/wallet-address';
import { walletState } from '../../../../state-manager/wallet/wallet-state';
import { ShieldNetworkSwitch } from './netwrok-switch';
import { LangSwitch } from './lang-switch';

type IState = {
  isMobile: boolean;
  isConnected: boolean;
};
type IProps = {};

export class AppHead extends BaseStateComponent<IProps, IState> {
  state: IState = {
    isMobile: P.Layout.IsMobile.get(),
    isConnected: false,
  };

  componentDidMount() {
    this.registerIsMobile('isMobile');
    this.registerObservable('isConnected', walletState.IS_CONNECTED);
  }

  componentWillUnmount() {
    this.destroyState();
  }

  render() {
    const mobileCss = this.state.isMobile ? styles.mobile : '';
    const styleMr = bindStyleMerger(mobileCss);

    return (
      <div className={styleMr(styles.wrapperHead)}>
        <ShieldLogo />

        <OptionMenuList />

        <Visible when={!this.state.isMobile}>
          <div className={styleMr(styles.walletInfo, cssPick(this.state.isConnected, styles.connected))}>
            <WalletAddress />

            <ShieldNetworkSwitch />

            <LangSwitch />
          </div>
        </Visible>
      </div>
    );
  }
}
