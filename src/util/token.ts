import { TokenErc20 } from '../state-manager/state-types';
import { isSameAddress } from './address';

export function isSameToken(a: TokenErc20 | null | undefined, b: TokenErc20 | null | undefined): boolean {
  if (!a || !b) {
    return false;
  }

  return (
    a.network === b.network && a.symbol === b.symbol && isSameAddress(a.address, b.address) && a.decimal === b.decimal
  );
}
