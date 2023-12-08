import { BigNumber } from 'ethers';
import { baseBigNumber } from './ethers';
import { E18, ZERO } from '../constant';
import * as _ from 'lodash';
import { numStrFormat, FormatOption } from './math';

export type DecimalJson = {
  decimal: number;
  value: string;
};

export class SldDecimal {
  private originBigNumber: BigNumber | null = null;
  private originDecimal: number = 0;
  private e18BigNumber: BigNumber | null = null;
  private numeric: string = '';

  private constructor() {}

  static readonly ZERO = SldDecimal.fromE18(ZERO, 0);

  static fromOrigin(origin: BigNumber, decimal: number) {
    const ins = new SldDecimal();
    ins.originBigNumber = origin;
    ins.originDecimal = decimal;

    return ins;
  }

  static fromE18(e18BigNumber: BigNumber, originDecimal: number) {
    const ins = new SldDecimal();
    ins.originDecimal = originDecimal;
    ins.e18BigNumber = e18BigNumber;

    return ins;
  }

  static fromNumeric(num: string, originDecimal: number) {
    if (num.indexOf(',') >= 0) {
      console.warn('fromNumeric() arg number string should not contains ","');

      num = num.replace(',', '');
    }

    const ins = new SldDecimal();
    ins.originDecimal = originDecimal;

    if (num.indexOf('.') >= 0) {
      const parts: string[] = num.split('.');
      let dec: string = parts[1];

      if (dec.length > originDecimal) {
        dec = dec.substring(0, originDecimal);
        ins.numeric = parts[0] + '.' + dec;
      } else {
        ins.numeric = num;
      }
    } else {
      ins.numeric = num;
    }

    return ins;
  }

  static fromJson(json: DecimalJson): SldDecimal {
    if (!json || !json.value || !json.decimal) {
      return SldDecimal.ZERO;
    }
    return SldDecimal.fromOrigin(BigNumber.from(json.value), json.decimal);
  }

  static from(decimal: SldDecimal) {
    const ins = new SldDecimal();

    ins.numeric = decimal.numeric;
    ins.originDecimal = decimal.originDecimal;
    ins.originBigNumber = decimal.originBigNumber;
    ins.e18BigNumber = decimal.e18BigNumber;

    return ins;
  }

  static min(...decimals: SldDecimal[]): SldDecimal {
    let minRs = decimals[0];
    decimals.forEach(dec => {
      if (dec.lt(minRs)) {
        minRs = dec;
      }
    });

    return minRs;
  }

  static max(...decimals: SldDecimal[]): SldDecimal {
    let maxRs = decimals[0];
    decimals.forEach(dec => {
      if (dec.gt(maxRs)) {
        maxRs = dec;
      }
    });

    return maxRs;
  }

  public isFloat(): boolean {
    if (this.numeric.length > 0) {
      const num = _.trim(this.numeric, '0');
      const pIndex = num.indexOf('.');
      return pIndex >= 0 && pIndex < num.length - 1;
    } else if (this.e18BigNumber) {
      if (!this.e18BigNumber.eq(0)) {
        const str = this.e18BigNumber.toString();

        if (str.length <= 18) {
          return true;
        } else {
          return _.trim(str.substring(str.length - 18), '0').length > 0;
        }
      }

      return false;
    } else if (this.originBigNumber) {
      if (!this.originBigNumber.eq(0)) {
        const str = this.originBigNumber.toString();

        if (str.length <= this.originDecimal) {
          return true;
        } else {
          return _.trim(str.substring(str.length - this.originDecimal), '0').length > 0;
        }
      }

      return false;
    } else {
      return false;
    }
  }

  public isZero(): boolean {
    return this.toE18().eq(0);
  }

  public gtZero(): boolean {
    return this.toE18().gt(0);
  }

  public ltZero(): boolean {
    return this.toE18().lt(0);
  }

  public toE18(): BigNumber {
    if (this.e18BigNumber === null) {
      if (this.originBigNumber) {
        this.originToE18();
      } else if (this.numeric) {
        this.numericToE18();
      }
    }

    return this.e18BigNumber ? this.e18BigNumber : ZERO;
  }

  public toOrigin(): BigNumber {
    if (this.originBigNumber === null) {
      if (this.numeric) {
        this.numericToOrigin();
      } else if (this.e18BigNumber) {
        this.e18ToOrigin();
      }
    }

    return this.originBigNumber ? this.originBigNumber : ZERO;
  }

  public toJson(): DecimalJson {
    return {
      decimal: this.getOriginDecimal(),
      value: this.toOrigin().toString() || '0',
    };
  }

  public toNumeric(removeZero?: boolean): string {
    if (!this.numeric) {
      if (this.e18BigNumber) {
        this.e18ToNumeric();
      } else if (this.originBigNumber) {
        this.originToNumeric();
      }
    }

    if (removeZero && this.numeric.indexOf('.') > 0) {
      const numString: string = _.trimEnd(_.trimEnd(this.numeric, '0'), '.');
      return numString.length === 0 ? '0' : numString;
    } else {
      return this.numeric;
    }
  }

  public format(opt?: FormatOption) {
    return numStrFormat(this.toNumeric(), opt);
  }

  public getOriginDecimal(): number {
    return this.originDecimal;
  }

  public cutToInteger(): SldDecimal {
    if (this === SldDecimal.ZERO || this.isZero()) {
      return this;
    }

    if (this.numeric.length > 0) {
      const parts: string[] = this.numeric.split('.');
      return SldDecimal.fromNumeric(parts[0], this.originDecimal);
    } else {
      const dec: number = this.originBigNumber ? this.originDecimal : 18;
      const big: BigNumber = this.originBigNumber ? this.originBigNumber : (this.e18BigNumber as BigNumber);
      const one = baseBigNumber(dec);
      const newBig = big.div(one).mul(one);

      if (this.originBigNumber) {
        return SldDecimal.fromOrigin(newBig, dec);
      } else {
        return SldDecimal.fromE18(newBig, dec);
      }
    }
  }

  public lt(sldDecimal: SldDecimal): boolean {
    return this.toE18().lt(sldDecimal.toE18());
  }

  public lte(sldDecimal: SldDecimal): boolean {
    return this.toE18().lte(sldDecimal.toE18());
  }

  public gt(sldDecimal: SldDecimal): boolean {
    return this.toE18().gt(sldDecimal.toE18());
  }

  public gte(sldDecimal: SldDecimal): boolean {
    return this.toE18().gte(sldDecimal.toE18());
  }

  public eq(sldDecimal: SldDecimal): boolean {
    return this.toE18().eq(sldDecimal.toE18());
  }

  public add(sldDecimal: SldDecimal): SldDecimal {
    if (this === SldDecimal.ZERO || this.isZero()) {
      return sldDecimal;
    }

    if (sldDecimal === SldDecimal.ZERO || sldDecimal.isZero()) {
      return this;
    }

    if (this.originDecimal !== sldDecimal.getOriginDecimal()) {
      throw Error('Can not plus tow SldDecimal instance with different origin decimals');
    }

    return SldDecimal.fromE18(this.toE18().add(sldDecimal.toE18()), this.originDecimal);
  }

  public sub(sldDecimal: SldDecimal): SldDecimal {
    if (this === SldDecimal.ZERO || this.isZero()) {
      return SldDecimal.fromE18(ZERO.sub(sldDecimal.toE18()), sldDecimal.getOriginDecimal());
    }

    if (sldDecimal === SldDecimal.ZERO || sldDecimal.isZero()) {
      return this;
    }

    if (this.originDecimal !== sldDecimal.getOriginDecimal()) {
      throw Error(`Can not subtract an SldDecimal instance with a different origin decimal.
        ${this.originDecimal}, ${sldDecimal.getOriginDecimal()}, ${this.toNumeric()}, ${sldDecimal.toNumeric()}`);
    }

    return SldDecimal.fromE18(this.toE18().sub(sldDecimal.toE18()), this.originDecimal);
  }

  public div(num: BigNumber): SldDecimal {
    if (num.eq(ZERO)) {
      throw Error('Can not division Zero');
    }

    if (this === SldDecimal.ZERO || this.isZero()) {
      return this;
    }

    return SldDecimal.fromE18(this.toE18().div(num), this.getOriginDecimal());
  }

  public mul(num: BigNumber): SldDecimal {
    if (this.isZero()) {
      return this;
    }

    if (num.isZero()) {
      return SldDecimal.ZERO;
    }

    return SldDecimal.fromE18(this.toE18().mul(num), this.getOriginDecimal());
  }

  public toUsdValue(price: SldDecPrice, decimal?: number): SldUsdValue {
    const e18 = this.toE18().mul(price.toE18()).div(E18);
    return SldUsdValue.fromE18(e18, decimal || this.originDecimal);
  }

  public toDecimal(): this {
    return this;
  }

  public castDecimal(newDecimal: number): SldDecimal {
    return SldDecimal.fromE18(this.toE18(), newDecimal);
  }

  public fix(fix: number): SldDecimal {
    return SldDecimal.fromNumeric(this.castDecimal(fix).toNumeric(), this.getOriginDecimal());
  }
  // ----------------------------------------------------------------------------------------------------

  private originToE18() {
    if (!this.originBigNumber) {
      return;
    }

    if (this.originDecimal === 18) {
      this.e18BigNumber = this.originBigNumber;
      return;
    }

    const offset = 18 - this.originDecimal;
    this.e18BigNumber =
      offset > 0 ? this.originBigNumber.mul(baseBigNumber(offset)) : this.originBigNumber.div(baseBigNumber(-offset));
  }

  private e18ToOrigin() {
    if (!this.e18BigNumber) {
      return;
    }

    if (this.originDecimal === 18) {
      this.originBigNumber = this.e18BigNumber;
      return;
    }

    const offset = 18 - this.originDecimal;
    this.originBigNumber =
      offset > 0 ? this.e18BigNumber.div(baseBigNumber(offset)) : this.e18BigNumber.mul(baseBigNumber(-offset));
  }

  private numericToE18() {
    if (!this.numeric) {
      return;
    }

    this.e18BigNumber = this.numericToBigNumber(18);
  }

  private numericToOrigin() {
    if (!this.numeric) {
      return;
    }

    this.originBigNumber = this.numericToBigNumber(this.originDecimal);
  }

  private numericToBigNumber(decimal: number): BigNumber {
    if (this.numeric.indexOf('.') < 0) {
      return BigNumber.from(this.numeric).mul(baseBigNumber(decimal));
    }

    const parts: string[] = this.numeric.split('.');
    const intPart: string = parts[0];
    let decPart: string = parts[1];

    if (decPart.length > decimal) {
      decPart = decPart.substring(0, decimal);
    } else if (decPart.length < decimal) {
      decPart = _.padEnd(decPart, decimal, '0');
    }

    //console.log('int dec', this.numeric, intPart, decPart);

    return BigNumber.from(intPart + decPart);
  }

  private e18ToNumeric() {
    if (!this.e18BigNumber) {
      return;
    }

    this.numeric = this.bigNumberToNumeric(this.e18BigNumber, 18);
  }

  private originToNumeric() {
    if (!this.originBigNumber) {
      return;
    }

    this.numeric = this.bigNumberToNumeric(this.originBigNumber, this.originDecimal);
  }

  private bigNumberToNumeric(big: BigNumber, decimal: number): string {
    let str = big.toString();
    let sign = 1;

    if (str.startsWith('-')) {
      sign = -1;
      str = str.substring(1);
    }

    let final: string = '';
    if (str.length > decimal) {
      let dec = str.substring(str.length - decimal);
      const int = str.substring(0, str.length - decimal);

      if (dec.length > this.originDecimal) {
        dec = dec.substring(0, this.originDecimal);
      }

      final = int + '.' + dec;
    } else {
      let dec = _.padStart(str, decimal, '0');

      if (dec.length > this.originDecimal) {
        dec = dec.substring(0, this.originDecimal);
      }

      final = dec.length > 0 ? '0.' + dec : '0';
    }

    const signStr = sign < 0 ? '-' : '';
    return signStr + final;
  }
}

export class SldDecPrice {
  static fromE18(price: BigNumber) {
    return new SldDecPrice(SldDecimal.fromE18(price, 18));
  }

  static fromJson(json: DecimalJson) {
    return new SldDecPrice(SldDecimal.fromJson(json));
  }

  static readonly ZERO = SldDecPrice.fromE18(BigNumber.from(0));

  static max(...args: SldDecPrice[]): SldDecPrice {
    let rs = args[0];

    args.forEach((arg: SldDecPrice) => {
      if (arg.gt(rs)) {
        rs = arg;
      }
    });

    return rs;
  }

  static min(...args: SldDecPrice[]): SldDecPrice {
    let rs = args[0];

    args.forEach(arg => {
      if (arg.lt(rs)) {
        rs = arg;
      }
    });

    return rs;
  }

  private constructor(private decimalObj: SldDecimal) {}

  public format(opt?: FormatOption): string {
    return this.decimalObj.format(opt);
  }

  public toDecimal(): SldDecimal {
    return this.decimalObj;
  }

  public toE18(): BigNumber {
    return this.decimalObj.toE18();
  }

  public gtZero(): boolean {
    return this.decimalObj.gtZero();
  }

  public isZero(): boolean {
    return this.decimalObj.isZero();
  }

  public gt(price: SldDecPrice): boolean {
    return this.toE18().gt(price.toE18());
  }

  public gte(price: SldDecPrice): boolean {
    return this.toE18().gte(price.toE18());
  }

  public lt(price: SldDecPrice): boolean {
    return this.toE18().lt(price.toE18());
  }

  public eq(price: SldDecPrice): boolean {
    return this.toE18().eq(price.toE18());
  }

  public add(price: SldDecPrice): SldDecPrice {
    return SldDecPrice.fromE18(this.toE18().add(price.toE18()));
  }

  public sub(price: SldDecPrice): SldDecPrice {
    return SldDecPrice.fromE18(this.toE18().sub(price.toE18()));
  }

  public div(num: BigNumber): SldDecPrice {
    return SldDecPrice.fromE18(this.toE18().div(num));
  }

  public increase(percent: SldDecPercent): SldDecPrice {
    const final = this.toE18().mul(percent.toE18()).div(E18).add(this.toE18());
    return SldDecPrice.fromE18(final);
  }

  public decrease(percent: SldDecPercent): SldDecPrice {
    if (percent.gt(SldDecPercent.genPercent('100'))) {
      throw 'Decrease price can not over 100%.';
    }

    const final = this.toE18().sub(this.toE18().mul(percent.toE18()).div(E18));
    return SldDecPrice.fromE18(final);
  }
}

export class SldUsdValue {
  static fromE18(value: BigNumber, tokenDecimal: number) {
    return new SldUsdValue(tokenDecimal, SldDecimal.fromE18(value, 18));
  }

  static readonly ZERO = SldUsdValue.fromE18(ZERO, 0);

  private constructor(private tokenOriginDecimal: number, private decimalObj: SldDecimal) {}

  public getTokenDecimal(): number {
    return this.tokenOriginDecimal;
  }

  public switchTokenDecimal(tokenDecimal: number): this {
    this.tokenOriginDecimal = tokenDecimal;
    return this;
  }

  public format(opt?: FormatOption): string {
    return this.decimalObj.format(opt);
  }

  public toE18(): BigNumber {
    return this.decimalObj.toE18();
  }

  public isZero(): boolean {
    return this.decimalObj.isZero();
  }

  public gtZero(): boolean {
    return this.decimalObj.gtZero();
  }

  public toDecimal() {
    return this.decimalObj;
  }

  public add(val: SldUsdValue): SldUsdValue {
    if (this === SldUsdValue.ZERO || this.isZero()) {
      return val;
    }

    if (val === SldUsdValue.ZERO || val.isZero()) {
      return this;
    }

    if (this.tokenOriginDecimal !== val.getTokenDecimal()) {
      throw Error('Can not plus tow SldUsdValue instance with different token decimals');
    }

    return SldUsdValue.fromE18(this.toE18().add(val.toE18()), this.tokenOriginDecimal);
  }

  public sub(val: SldUsdValue): SldUsdValue {
    if (this === SldUsdValue.ZERO || this.isZero()) {
      return SldUsdValue.fromE18(ZERO.sub(val.toE18()), val.tokenOriginDecimal);
    }

    if (val === SldUsdValue.ZERO || val.isZero()) {
      return this;
    }

    if (this.tokenOriginDecimal !== val.getTokenDecimal()) {
      throw Error('Can not subtract an SldUsdValue instance with a different origin decimals');
    }

    return SldUsdValue.fromE18(this.toE18().sub(val.toE18()), this.tokenOriginDecimal);
  }

  public toTokenAmount(price: SldDecPrice): SldDecimal {
    if (this === SldUsdValue.ZERO) {
      return SldDecimal.ZERO;
    }

    const e18 = this.decimalObj.toE18().mul(E18).div(price.toE18());
    return SldDecimal.fromE18(e18, this.tokenOriginDecimal);
  }

  public toStableTokenAmount(): SldDecimal {
    if (this === SldUsdValue.ZERO) {
      return SldDecimal.ZERO;
    }

    return SldDecimal.fromE18(this.decimalObj.toE18(), this.tokenOriginDecimal);
  }
}

export class SldDecPercent {
  static fromOrigin(num: BigNumber, decimal: number) {
    return new SldDecPercent(SldDecimal.fromOrigin(num, decimal));
  }

  static fromDecimal(dec: SldDecimal) {
    return new SldDecPercent(dec);
  }

  // 1E18 == 100%
  static fromE18(e18Num: BigNumber, originDecimal: number = 18) {
    return new SldDecPercent(SldDecimal.fromE18(e18Num, originDecimal));
  }

  static genPercent(numeric: string, decimal: number = 18): SldDecPercent {
    const ori = SldDecimal.fromNumeric(numeric, decimal).div(BigNumber.from(100));
    return SldDecPercent.fromDecimal(ori);
  }

  static fromArgs(total: SldDecimal, part: SldDecimal): SldDecPercent {
    if (total.isZero() || part.isZero()) {
      return SldDecPercent.ZERO;
    }
    return SldDecPercent.fromE18(part.toE18().mul(E18).div(total.toE18()));
  }

  static readonly HUNDRED = SldDecPercent.fromOrigin(E18, 18);
  static readonly ZERO = SldDecPercent.fromOrigin(ZERO, 18);

  private percentDecObj: SldDecimal;

  private constructor(private originDecObj: SldDecimal) {
    const percentDecimal: number = this.originDecObj.getOriginDecimal();
    const percentOrigin: BigNumber = this.originDecObj.toOrigin().mul(100);

    this.percentDecObj = SldDecimal.fromOrigin(percentOrigin, percentDecimal);
  }

  public percentFormat(opt?: FormatOption): string {
    return this.percentDecObj.format(opt);
  }

  public thousandthFormat(opt?: FormatOption): string {
    return this.percentDecObj.mul(BigNumber.from(10)).format(opt);
  }

  // 100% === E18
  public toE18(): BigNumber {
    return this.originDecObj.toE18();
  }

  public toOrigin(): BigNumber {
    return this.originDecObj.toOrigin();
  }

  public toDecimal(): SldDecimal {
    return this.originDecObj;
  }

  public toPercentVal(): SldDecimal {
    return this.percentDecObj;
  }

  public applyTo(multiplicand: SldDecimal): SldDecimal {
    const rs: BigNumber = multiplicand.toE18().mul(this.toE18()).div(E18);
    return SldDecimal.fromE18(rs, multiplicand.getOriginDecimal());
  }

  public add(percent: SldDecPercent): SldDecPercent {
    const e18: BigNumber = percent.toE18().add(this.toE18());
    const ori = SldDecimal.fromE18(e18, this.originDecObj.getOriginDecimal());

    return SldDecPercent.fromDecimal(ori);
  }

  public sub(percent: SldDecPercent): SldDecPercent {
    const diffE18: BigNumber = this.originDecObj.toE18().sub(percent.toE18());
    const ori: SldDecimal = SldDecimal.fromE18(diffE18, this.originDecObj.getOriginDecimal());

    return SldDecPercent.fromDecimal(ori);
  }

  public mul(percent: SldDecPercent): SldDecPercent {
    const e18: BigNumber = this.toE18().mul(percent.toE18()).div(E18);
    const dec: SldDecimal = SldDecimal.fromE18(e18, this.originDecObj.getOriginDecimal());

    return SldDecPercent.fromDecimal(dec);
  }

  public times(times: SldDecimal): SldDecPercent {
    const targetOrigin = this.originDecObj.mul(times.toE18()).div(E18);
    return SldDecPercent.fromDecimal(targetOrigin);
  }

  public div(divisor: BigNumber): SldDecPercent {
    const dec = SldDecimal.fromE18(this.toE18().div(divisor), this.originDecObj.getOriginDecimal());
    return SldDecPercent.fromDecimal(dec);
  }

  public eq(percent: SldDecPercent): boolean {
    return this.toE18().eq(percent.toE18());
  }

  public lt(percent: SldDecPercent): boolean {
    return this.toE18().lt(percent.toE18());
  }

  public lte(percent: SldDecPercent): boolean {
    return this.toE18().lte(percent.toE18());
  }

  public gt(percent: SldDecPercent): boolean {
    return this.toE18().gt(percent.toE18());
  }

  public gte(percent: SldDecPercent): boolean {
    return this.toE18().gte(percent.toE18());
  }

  public isZero(): boolean {
    return this.originDecObj.isZero();
  }

  public gtZero(): boolean {
    return this.originDecObj.gtZero();
  }
}
