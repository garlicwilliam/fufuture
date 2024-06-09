import { Network } from '../constant/network';

export function networkParse(chainId: string | number): Network {
  const network: Network =
    typeof chainId === 'number'
      ? (chainId.toString() as Network)
      : chainId.startsWith('0x')
      ? (parseInt(chainId, 16).toString() as Network)
      : (parseInt(chainId, 10).toString() as Network);

  return network;
}
