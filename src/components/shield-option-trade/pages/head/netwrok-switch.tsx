import { BaseStateComponent } from '../../../../state-manager/base-state-component';
import { P } from '../../../../state-manager/page/page-state-parser';
import { Network } from '../../../../constant/network';
import { walletState } from '../../../../state-manager/wallet/wallet-state';
import { NetworkIcons, NetworkNames } from '../../../../constant/network-conf';
import { ReactNode } from 'react';
import ModalRender from '../../../modal-render';
import { I18n } from '../../../i18n/i18n';
import styles from './network-switch.module.less';
import { bindStyleMerger, StyleMerger } from '../../../../util/string';
import { ItemsBox } from '../../../common/content/items-box';
import { fontCss } from '../../../i18n/font-switch';
import { SLD_ENV_CONF } from '../../const/env';
import { SldSelect, SldSelectOption } from '../../../common/selects/select';
import { SldOverlay } from '../../../common/overlay/overlay';
import { IconDropdown } from '../../../common/icon/dropdown';

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

  private genLabel(network: Network, styleMr: StyleMerger): ReactNode {
    return (
      <div className={styleMr(styles.nLabel)}>
        <img src={NetworkIcons[network]} alt={''} height={24} />
      </div>
    );
  }

  private genNetworkIcon(styleMr: StyleMerger): ReactNode {
    const networks = Object.keys(SLD_ENV_CONF.Supports) as Network[];
    const isMulti: boolean = Object.keys(SLD_ENV_CONF.Supports).length > 1;

    if (!this.state.curNetwork) {
      return <></>;
    }

    if (isMulti) {
      const overlay = (
        <div className={styleMr(styles.nOverlay)}>
          {networks.map((network: Network) => {
            return (
              <div className={styleMr(styles.nItem)} key={network} onClick={() => this.onSwitch(network)}>
                <img src={NetworkIcons[network]} alt={''} height={24} width={24} />
                <span>{NetworkNames[network]}</span>
              </div>
            );
          })}
        </div>
      );

      return (
        <SldOverlay zIndex={1200} overlay={overlay} placement={'bottom-end'} useArrow={false} offset={2}>
          <div className={styleMr(styles.nTrigger)}>
            {this.genLabel(this.state.curNetwork, styleMr)}
            <IconDropdown width={10} pointTo={'down'} />
          </div>
        </SldOverlay>
      );
    }

    return (
      <div>
        <img
          src={NetworkIcons[this.state.curNetwork]}
          alt={''}
          height={this.state.isMobile ? 20 : 24}
          width={this.state.isMobile ? 20 : 24}
        />
      </div>
    );
  }

  private onSwitch(network: Network | null) {
    if (network) {
      walletState.switchNetwork(network);
    }
  }

  render() {
    const mobileCss = this.state.isMobile ? styles.mobile : '';
    const styleMr = bindStyleMerger(mobileCss);

    const icon: ReactNode = this.genNetworkIcon(styleMr);
    const supportsNet: Network[] = Object.keys(SLD_ENV_CONF.Supports).map(one => one as Network);
    const isWrongNetwork: boolean = this.state.curNetwork ? supportsNet.indexOf(this.state.curNetwork) < 0 : false;

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

              {supportsNet.map((one: Network) => {
                return (
                  <div key={one} className={styleMr(styles.chainBtn)} onClick={() => this.onSwitch(one)}>
                    <img src={NetworkIcons[one]} alt={''} width={24} />
                    <div className={styleMr()}>{NetworkNames[one]}</div>
                  </div>
                );
              })}
            </div>
          </ItemsBox>
        </ModalRender>
      </>
    );
  }
}
