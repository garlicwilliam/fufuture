export const shortAddress = (address: string | null | undefined, prefixLong: boolean | number = false) => {
  if (!address) {
    return '';
  }

  if (typeof prefixLong === 'boolean') {
    return prefixLong
      ? address.replace(/^(.{10})(.*)(.{4})/, '$1...$3')
      : address.replace(/^(.{6})(.*)(.{4})/, '$1...$3');
  } else {
    const reg = new RegExp('^(.{' + prefixLong + '})(.*)(.{4})');
    return address.replace(reg, '$1...$3');
  }
};
