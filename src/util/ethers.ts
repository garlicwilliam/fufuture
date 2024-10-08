import { BigNumber } from 'ethers';

export function baseBigNumber(wei: number): BigNumber {
  wei = Math.abs(wei);

  if (wei === 0) {
    return BigNumber.from('1');
  }

  const tail = new Array(wei).fill('0').join('');
  return BigNumber.from('1' + tail);
}

export function keepE18Number(origin: BigNumber, originDecimals: number): BigNumber {
  if (originDecimals === 18) {
    return origin;
  }

  const offset = 18 - originDecimals;
  return offset > 0 ? origin.mul(baseBigNumber(offset)) : origin.div(baseBigNumber(offset));
}
