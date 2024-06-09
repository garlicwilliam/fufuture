import { isValidAddress } from '../util/address';

export const testAddress: string = '';
const isLocal: boolean =
  window.location.host === 'local.stakestone.io:3000' || window.location.host === 'localhost:3000';

export const TESTING_ADDR: string | null = isValidAddress(testAddress) && isLocal ? testAddress : null;
