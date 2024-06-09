import { Observable } from 'rxjs';
import { Network } from '../constant/network';
import { providers, Signer } from 'ethers';
import { SldDecimal } from '../util/decimal';
import { WcWalletInfo } from '../services/wc-modal/wc-modal.service';
import { SldWalletId, Wallet } from './define';
import { TokenErc20 } from '../state-manager/state-types';

/**
 * 一个钱包实例要实现的接口
 */
export interface WalletInterface {
  walletType: Wallet;

  doConnect(info?: WcWalletInfo): Observable<boolean>;

  disconnect(): Observable<boolean>;

  wasConnected(): Observable<boolean>;

  watchAccount(): Observable<string>;

  getAccount(): string | null;

  getNetwork(): Network | null;

  watchNetwork(): Observable<Network>;

  switchNetwork(id: Network): Observable<boolean>;

  addErc20Token(token: TokenErc20, icon?: string): Observable<boolean>;

  watchProvider(): Observable<providers.Web3Provider>;

  watchSigner(): Observable<Signer>;

  watchNativeBalance(trigger?: Observable<any>): Observable<{ balance: SldDecimal; network: Network }>;

  getNativeBalance(): Observable<SldDecimal>;

  walletName(): string | { name: string; url: string };

  walletId(): Observable<SldWalletId>;

  walletIcon(): Observable<string>;

  signMessage(message: string): Observable<{ signature: string }>;
}
