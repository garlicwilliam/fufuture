import { Observable } from 'rxjs';
import { Network } from '../constant/network';
import { providers, Signer } from 'ethers';
import { SldDecimal } from '../util/decimal';
import { WcWalletInfo } from '../services/wc-modal/wc-modal.service';
import { Wallet } from './define';

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

  watchProvider(): Observable<providers.Web3Provider>;

  watchSigner(): Observable<Signer>;

  watchNativeBalance(trigger?: Observable<any>): Observable<SldDecimal>;

  getNativeBalance(): Observable<SldDecimal>;

  walletName(): string | { name: string; url: string };

  signMessage(message: string): Observable<{ signature: string }>;
}
