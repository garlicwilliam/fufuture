import { BaseStateComponent } from '../../../state-manager/base-state-component';
import styles from './wallet-address.module.less';
import { walletState } from '../../../state-manager/wallet/wallet-state';
import { shortAddress } from '../../../util';
import { P } from '../../../state-manager/page/page-state-parser';
import { styleMerge } from '../../../util/string';
import { EthereumProviderName, Wallet } from '../../../constant';
import { ReactNode } from 'react';
import { WALLET_ICONS_MAP, walletconnect } from '../../connect-wallet/wallet-icons';
import { metamaskProviderManager } from '../../../wallet/metamask-like-manager';
import { map } from 'rxjs/operators';
import { ConnectWallet } from './connect-wallet';

type IProps = {
  className?: string;
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

  genProviderIcon(): ReactNode {
    if (this.state.walletType === Wallet.WalletConnect) {
      return <img src={walletconnect} alt={''} className={styles.walletIcon} />;
    }

    if (this.state.metamaskWalletProvider === null) {
      return <></>;
    }

    const icon = WALLET_ICONS_MAP[this.state.metamaskWalletProvider];
    return <img src={icon} alt={''} className={styles.walletIcon} />;
  }

  render() {
    return this.state.walletConnected ? (
      <div
        className={styleMerge(styles.walletAddress, 'shield-wallet-address', this.props.className)}
        onClick={() => P.Layout.IsShowWalletModal.set(true)}
      >
        <>
          {this.genProviderIcon()}
          <span>{shortAddress(this.state.address || '')}</span>
        </>
      </div>
    ) : (
      <ConnectWallet />
    );
  }
}
