import eth1 from '../../../assets/imgs/tokens/eth1.svg';
import btc1 from '../../../assets/imgs/tokens/btc1.svg';
import {ShieldUnderlyingType} from "../../../state-manager/state-types";
export const eth = eth1;
export const btc = btc1;

export const iconSizeTiny = 20;
export const iconSize = 24;
export const iconSizeBig = 30;

export const iconFontSizeTiny = 14;
export const iconFontSize = 16;
export const iconFontSizeBig = 18;

export const IndexUnderlyingAssetsIcon: { [k in ShieldUnderlyingType]: string } = {
  [ShieldUnderlyingType.ETH]: eth,
  [ShieldUnderlyingType.BTC]: btc,
};
