import * as _ from 'lodash';
import { EMPTY_ADDRESS } from '../constant';

export function isValidAddress(address: string | undefined | null): boolean {
  if (!address || typeof address !== 'string') {
    return false;
  }
  const reg = /^0x([0-9a-zA-Z]{40})/g;
  return reg.test(address.trim());
}

export function isSameAddress(address1: string, address2: string): boolean {
  return isValidAddress(address2) && isValidAddress(address1) && address1.toLowerCase() === address2.toLowerCase();
}

export function isEmptyAddress(address: string) {
  return isSameAddress(address, EMPTY_ADDRESS);
}

export function isAddressIn(address: string, addressArray: string[]): boolean {
  if (!addressArray || _.isEmpty(addressArray || !Array.isArray(addressArray))) {
    return false;
  }

  return addressArray.some(one => isSameAddress(one, address));
}
