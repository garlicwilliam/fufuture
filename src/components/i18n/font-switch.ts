import { P } from '../../state-manager/page/page-state-parser';

export enum FontWeight {
  Reg = 'Reg',
  Medium = 'Medium',
  Bold = 'Bold',
  Bolder = 'Bolder',
  Heavy = 'Heavy',
}

export class FontSwitch {
  private _lang: string;
  private names = {};
  private namesLatin = {};

  constructor() {
    const lang = P.Lang.get();
    this._lang = lang.substring(0, 1).toUpperCase() + lang.substring(1);

    this.names = {
      [FontWeight.Reg]: this.fontCssName(FontWeight.Reg, this._lang),
      [FontWeight.Medium]: this.fontCssName(FontWeight.Medium, this._lang),
      [FontWeight.Bold]: this.fontCssName(FontWeight.Bold, this._lang),
      [FontWeight.Bolder]: this.fontCssName(FontWeight.Bolder, this._lang),
      [FontWeight.Heavy]: this.fontCssName(FontWeight.Heavy, this._lang),
    };
    this.namesLatin = {
      [FontWeight.Reg]: this.fontCssName(FontWeight.Reg, 'En'),
      [FontWeight.Medium]: this.fontCssName(FontWeight.Medium, 'En'),
      [FontWeight.Bold]: this.fontCssName(FontWeight.Bold, 'En'),
      [FontWeight.Bolder]: this.fontCssName(FontWeight.Bolder, 'En'),
      [FontWeight.Heavy]: this.fontCssName(FontWeight.Heavy, 'En'),
    };
  }

  public get regularLatin() {
    return this.namesLatin[FontWeight.Reg];
  }

  public get regular() {
    return this.names[FontWeight.Reg];
  }

  public get mediumLatin() {
    return this.namesLatin[FontWeight.Medium];
  }

  public get medium() {
    return this.names[FontWeight.Medium];
  }

  public get boldLatin() {
    return this.namesLatin[FontWeight.Bold];
  }

  public get bold() {
    return this.names[FontWeight.Bold];
  }

  public get bolderLatin() {
    return this.namesLatin[FontWeight.Bolder];
  }

  public get bolder() {
    return this.names[FontWeight.Bolder];
  }

  public get heavyLatin() {
    return this.namesLatin[FontWeight.Heavy];
  }

  public get heavy() {
    return this.names[FontWeight.Heavy];
  }

  private fontCssName(weight: FontWeight, lang: string) {
    return 'sldFont' + weight + lang;
  }
}

export const fontCss = new FontSwitch();
