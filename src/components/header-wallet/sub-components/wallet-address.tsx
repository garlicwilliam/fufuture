import { BaseStateComponent } from '../../../state-manager/base-state-component';
import styles from './wallet-address.module.less';
import { walletState } from '../../../state-manager/wallet/wallet-state';
import { shortAddress } from '../../../util';
import { P } from '../../../state-manager/page/page-state-parser';
import { bindStyleMerger, styleMerge, StyleMerger } from '../../../util/string';
import { EthereumProviderName, Wallet } from '../../../constant';
import { ReactNode } from 'react';
import { WALLET_ICONS_MAP, walletconnect } from '../../connect-wallet/wallet-icons';
import { metamaskProviderManager } from '../../../wallet/metamask-like-manager';
import { map } from 'rxjs/operators';
import { ConnectWallet } from './connect-wallet';
import { Visible } from '../../builtin/hidden';

type IProps = {
  className?: string;
  btnSize?: 'small' | 'tiny';
};

type IState = {
  isMobile: boolean;
  address: string | null;
  walletType: Wallet | null;
  walletConnected: boolean;
  metamaskWalletProvider: EthereumProviderName | null;
};

export class WalletAddress extends BaseStateComponent<IProps, IState> {
  state: IState = {
    isMobile: P.Layout.IsMobile.get(),
    address: null,
    metamaskWalletProvider: null,
    walletType: null,
    walletConnected: false,
  };

  componentDidMount() {
    this.registerIsMobile('isMobile');
    this.registerObservable('address', walletState.USER_ADDR);
    this.registerObservable('walletType', walletState.WALLET_TYPE);
    this.registerObservable('walletConnected', walletState.IS_CONNECTED);
    this.registerObservable(
      'metamaskWalletProvider',
      metamaskProviderManager.watchCurrentSelected().pipe(map(selected => selected?.name || null))
    );
  }

  componentWillUnmount() {
    this.destroyState();
  }

  genProviderIcon(styleMr: StyleMerger): ReactNode {
    const className: string = styleMr(styles.walletIcon, 'shield-wallet-address-icon');

    if (this.state.walletType === Wallet.WalletConnect) {
      return <img src={walletconnect} alt={''} className={className} />;
    }

    if (this.state.metamaskWalletProvider === null) {
      return <></>;
    }

    const icon = WALLET_ICONS_MAP[this.state.metamaskWalletProvider];
    return <img src={icon} alt={''} className={className} />;
  }

  render() {
    const mobileCss = this.state.isMobile ? styles.mobile : '';
    const styleMr = bindStyleMerger(mobileCss);

    return this.state.walletConnected ? (
      <div
        className={styleMerge(styles.walletAddress, 'shield-wallet-address', this.props.className)}
        onClick={() => P.Layout.IsShowWalletModal.set(true)}
      >
        <>
          {this.genProviderIcon(styleMr)}

          <Visible when={!this.state.isMobile}>
            <span>{shortAddress(this.state.address || '')}</span>
          </Visible>
        </>
      </div>
    ) : (
      <ConnectWallet size={this.props.btnSize} />
    );
  }
}
