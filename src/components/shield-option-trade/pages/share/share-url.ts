import { BigNumber } from 'ethers';
import { Network } from '../../../../constant/network';
import { prefixPath } from '../../../common/utils/location-wrapper';
import { RouteKey } from '../../../../constant/routes';

export function genShareUrl(orderId: BigNumber, network: Network): string {
  const hostPrefix: string = window.location.origin + prefixPath;
  const oid: string = orderId.toString();
  const nid: string = network;

  return `${hostPrefix}/${RouteKey.poster}/${oid}/${nid}`;
}
