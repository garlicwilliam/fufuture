import * as WcQrCode from './QrCode';
import { TemplateResult, render } from 'lit';

export function genQrCode(uri: string, size: number, iconSize: number, target: HTMLElement): void {
  const contents: TemplateResult<any>[] = WcQrCode.QrCodeUtil.generate(uri, size, iconSize);

  render(contents, target);
}
