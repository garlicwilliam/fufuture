import { Observable } from 'rxjs';
import { Wallet } from '../constant';
import { Network } from '../constant/network';
import { providers, Signer } from 'ethers';
import { SldDecimal } from '../util/decimal';
import { WcWalletInfo } from '../services/wc-modal/wc-modal.service';

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

  walletName(): string;
}
