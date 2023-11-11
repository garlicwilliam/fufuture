import { BaseStateComponent } from '../../../../state-manager/base-state-component';
import { P } from '../../../../state-manager/page/page-state-parser';
import { bindStyleMerger } from '../../../../util/string';
import styles from './mobile-foot.module.less';
import { ShieldNetworkSwitch } from './netwrok-switch';
import { WalletAddress } from '../../../header-wallet/sub-components/wallet-address';
import { LangSwitch } from './lang-switch';

type IState = {
  isMobile: boolean;
};
type IProps = {};

export class MobileFoot extends BaseStateComponent<IProps, IState> {
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
      <div className={styleMr(styles.foot)}>
        <WalletAddress />

        <div className={styleMr(styles.right)}>
          <ShieldNetworkSwitch />

          <LangSwitch />
        </div>
      </div>
    );
  }
}
