import BN from 'bn.js';
import { fromUint8Array, toUint8Array } from 'js-base64';
import _ from 'lodash';
import { isValidAddress } from './address';

export type StyleMerger = (...names: (string | undefined)[]) => string;

export function styleMerge(...names: (string | undefined)[]): string {
  return names.filter(one => one !== undefined && one.length > 0).join(' ');
}

export function bindStyleMerger(mobileCss: string, ...cssArr: string[]): StyleMerger {
  function merger(...names: (string | undefined)[]) {
    return styleMerge(mobileCss, ...cssArr, ...names);
  }

  return merger;
}

export function cssPick(express: boolean | undefined | null, ...style: string[]): string {
  return express ? style.join(' ') : '';
}

export function genReferralCode(address: string): string {
  if (address.startsWith('0x')) {
    const hex = address.substring(2);

    let bin: string = new BN(hex, 'hex').toString(2);
    if (bin.length < 160) {
      bin = _.padStart(bin, 160, '0');
    }

    const binArray = _.chunk(bin, 8)
      .map(one => one.join(''))
      .map(one => parseInt(one, 2));
    const bytes = new Uint8Array(binArray);

    const code = fromUint8Array(bytes, true);

    return code;
  }

  return '';
}

export function parseReferralCode(code: string): string {
  try {
    const bytes = toUint8Array(code);
    let address = new BN(bytes).toString('hex');
    address = _.padStart(address, 40, '0');
    address = '0x' + address;

    return isValidAddress(address) ? address : '';
  } catch (err) {
    return '';
  }
}

export function parseQueryString(queryString: string): { [k: string]: string } {
  type Pair = { [k: string]: string };

  const qStr = _.trimStart(queryString, '?');
  const qItems = qStr.split('&');
  const qPairs: string[][] = qItems.map(item => item.split('='));
  const pairs = qPairs.filter(pair => pair.length === 2) as [string, string][];

  if (pairs.length === 0) {
    return {};
  }

  return pairs.reduce((acc: Pair, cur: [string, string]) => {
    return Object.assign(acc, { [cur[0]]: cur[1] });
  }, {} as Pair);
}

export function pxStr(num?: number | undefined | null): string | undefined {
  if (typeof num === 'number') {
    return num.toString() + 'px';
  } else {
    return undefined;
  }
}

export function padTimeStr(number: number): string {
  return _.padStart(number.toString(), 2, '0');
}

export function parseNumber(numStr: string): number {
  const rs = Number(numStr);
  return isNaN(rs) ? 0 : rs;
}
