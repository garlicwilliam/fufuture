import { ShieldOrderState } from '../../../state-manager/state-types';
import { I18n } from '../../i18n/i18n';

export const OrderStatusNode = {
  [ShieldOrderState.ACTIVE]: <I18n id={'trade-order-status-active'} />,
  [ShieldOrderState.CLOSED]: <I18n id={'trade-order-status-closed'} />,
  [ShieldOrderState.TAKER_LIQUIDATED]: <I18n id={'trade-order-status-taker-liquidated'} />,
  [ShieldOrderState.MAKER_LIQUIDATED]: <I18n id={'trade-order-status-maker-liquidated'} />,
  [ShieldOrderState.POOL_LIQUIDATED]: <I18n id={'trade-order-status-pool-liquidated'} />,
  [ShieldOrderState.MAKER_AGREEMENT_LIQUIDATED]: <I18n id={'trade-order-status-agreement-liquidated'} />,
  [ShieldOrderState.POOL_AGREEMENT_LIQUIDATED]: <I18n id={'trade-order-status-agreement-liquidated'} />,
  [ShieldOrderState.TAKER_MAKER_AGREEMENT_LIQUIDATED]: <I18n id={'trade-order-status-agreement-liquidated'} />,
  [ShieldOrderState.TAKER_POOL_AGREEMENT_LIQUIDATED]: <I18n id={'trade-order-status-agreement-liquidated'} />,
};
