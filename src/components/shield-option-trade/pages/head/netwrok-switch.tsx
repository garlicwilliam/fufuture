import { BaseStateComponent } from '../../../../state-manager/base-state-component';
import { P } from '../../../../state-manager/page/page-state-parser';
import { Network } from '../../../../constant/network';
import { walletState } from '../../../../state-manager/wallet/wallet-state';
import { NetworkIcons, NetworkNames } from '../../../../constant/network-conf';
import { ReactNode } from 'react';
import ModalRender from '../../../modal-render';
import { SUPPORT_NETWORK } from '../../const/default';
import { I18n } from '../../../i18n/i18n';
import styles from './network-switch.module.less';
import { bindStyleMerger } from '../../../../util/string';
import { ItemsBox } from '../../../common/content/items-box';
import { fontCss } from '../../../i18n/font-switch';

type IState = {
  isMobile: boolean;
  curNetwork: Network | null;
};
type IProps = {};

export class ShieldNetworkSwitch extends BaseStateComponent<IProps, IState> {
  state: IState = {
    isMobile: P.Layout.IsMobile.get(),
    curNetwork: null,
  };

  componentDidMount() {
    this.registerIsMobile('isMobile');
    this.registerObservable('curNetwork', walletState.NETWORK);
  }

  componentWillUnmount() {
    this.destroyState();
  }

  genNetworkIcon(): ReactNode {
    return this.state.curNetwork ? (
      <div>
        <img src={NetworkIcons[this.state.curNetwork]} alt={''} height={24} width={24} />
      </div>
    ) : (
      <></>
    );
  }

  onSwitch() {
    walletState.switchNetwork(SUPPORT_NETWORK);
  }

  render() {
    const mobileCss = this.state.isMobile ? styles.mobile : '';
    const styleMr = bindStyleMerger(mobileCss);

    const icon: ReactNode = this.genNetworkIcon();
    const isWrongNetwork = this.state.curNetwork ? this.state.curNetwork !== SUPPORT_NETWORK : false;

    return (
      <>
        {icon}

        <ModalRender
          footer={null}
          visible={isWrongNetwork}
          title={<I18n id={'trade-not-support-network'} />}
          closable={false}
          height={250}
        >
          <ItemsBox gap={30}>
            <div className={styleMr(styles.desc)}>
              <I18n id={'trade-not-support-network-switch'} params={{ chain: this.state.curNetwork }} />
            </div>

            <div className={styleMr(styles.buttons)}>
              <div className={styleMr(styles.switchTitle, fontCss.bold)}>
                <I18n id={'trade-switch-network'} />
              </div>

              <div className={styleMr(styles.chainBtn)} onClick={this.onSwitch.bind(this)}>
                <img src={NetworkIcons[SUPPORT_NETWORK]} alt={''} width={24} />
                <div className={styleMr()}>{NetworkNames[SUPPORT_NETWORK]}</div>
              </div>
            </div>
          </ItemsBox>
        </ModalRender>
      </>
    );
  }
}
