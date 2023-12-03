import { AppName, getAppName } from '../util/app';
import { ops as ShieldOps } from '../components/shield-option-trade/const/wallet-connect';
import { WalletConnectOps } from './walletconnect';

const appName: AppName = getAppName();

let wcOps: WalletConnectOps;

switch (appName) {
  case AppName.ShieldTrade: {
    wcOps = ShieldOps;
    break;
  }
}

export { wcOps };
