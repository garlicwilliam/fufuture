import { BaseStateComponent } from '../../../state-manager/base-state-component';
import styles from './wallet-address.module.less';
import { walletState } from '../../../state-manager/wallet/wallet-state';
import { shortAddress } from '../../../util';
import { P } from '../../../state-manager/page/page-state-parser';
import { bindStyleMerger, styleMerge, StyleMerger } from '../../../util/string';
import { ReactNode } from 'react';
import { WALLET_ICONS_MAP, walletconnect, safe } from '../../connect-wallet/wallet-icons';
import { metamaskProviderManager } from '../../../wallet/metamask-like-manager';
import { map } from 'rxjs/operators';
import { ConnectWallet } from './connect-wallet';
import { Visible } from '../../builtin/hidden';
import { EthereumProviderName, SldWalletId, Wallet } from '../../../wallet/define';
import { switchMap } from 'rxjs';

type IProps = {
  className?: string;
  btnSize?: 'small' | 'tiny';
  showMobileAddr?: boolean;
};

type IState = {
  isMobile: boolean;
  address: string | null;
  walletType: Wallet | null;
  walletId: SldWalletId | null;
  walletIcon: string;
  isConnected: boolean;
  metamaskWalletProvider: EthereumProviderName | null;
};

export class WalletAddress extends BaseStateComponent<IProps, IState> {
  state: IState = {
    isMobile: P.Layout.IsMobile.get(),
    address: null,
    metamaskWalletProvider: null,
    walletType: null,
    walletId: null,
    walletIcon: '',
    isConnected: false,
  };

  componentDidMount() {
    this.registerIsMobile('isMobile');
    this.registerObservable('address', walletState.USER_ADDR);
    this.registerObservable('walletType', walletState.WALLET_TYPE);
    this.registerObservable('walletId', walletState.watchWalletInstance().pipe(switchMap(wallet => wallet.walletId())));
    this.registerObservable(
      'walletIcon',
      walletState.watchWalletInstance().pipe(switchMap(wallet => wallet.walletIcon()))
    );
    this.registerObservable('isConnected', walletState.IS_CONNECTED);
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
      const imgSrc: string = this.state.walletIcon || walletconnect;
      return <img src={imgSrc} alt={'WalletConnect'} className={className} />;
    }

    if (this.state.walletType === Wallet.SafeWallet) {
      return <img src={safe} alt={'Safe'} className={className} />;
    }

    if (this.state.metamaskWalletProvider === null) {
      return <></>;
    }

    const icon: string = WALLET_ICONS_MAP[this.state.metamaskWalletProvider];
    return <img src={icon} alt={''} className={className} />;
  }

  onClickAddr() {
    if (this.state.walletType === Wallet.SafeWallet) {
      return;
    }
    P.Layout.IsShowWalletModal.set(true);
  }

  render(): JSX.Element {
    const mobileCss: string = this.state.isMobile ? styles.mobile : '';
    const styleMr: StyleMerger = bindStyleMerger(mobileCss);

    return this.state.isConnected ? (
      <div
        className={styleMerge(styles.walletAddress, 'shield-wallet-address', this.props.className)}
        onClick={this.onClickAddr.bind(this)}
      >
        <>
          {this.genProviderIcon(styleMr)}

          <Visible when={!this.state.isMobile || this.props.showMobileAddr === true}>
            <span>{shortAddress(this.state.address || '', 2)}</span>
          </Visible>
        </>
      </div>
    ) : (
      <ConnectWallet size={this.props.btnSize} />
    );
  }
}
