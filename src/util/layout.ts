import { RESPONSIVE_MOBILE, RESPONSIVE_MOBILE_MINI, RESPONSIVE_NARROW } from '../constant';

export type Size = { w: number; h: number };

export function isAndroid(): boolean {
  return window.navigator?.userAgent?.toLowerCase().indexOf('android') >= 0;
}

export function isIpad(): boolean {
  return window.navigator?.userAgent?.toLowerCase().indexOf('ipad') >= 0;
}

export function isIPhone(): boolean {
  return window.navigator?.userAgent?.toLowerCase().indexOf('iphone') >= 0;
}

export function confirmIsNarrow(): boolean {
  return window.innerWidth <= RESPONSIVE_NARROW && windowWidth() > RESPONSIVE_MOBILE;
}

export function confirmIsMini(): boolean {
  return window.innerWidth <= RESPONSIVE_MOBILE_MINI;
}

export function confirmIsMobile(): boolean {
  return windowWidth() <= RESPONSIVE_MOBILE && !isIpad();
}

export function windowWidth(): number {
  return Math.min(window.innerWidth, document.body.clientWidth);
}

export function windowHeight(): number {
  return Math.min(window.innerHeight);
}

export function screenSizeConfirm(windowSize: Size, minRatio: number, maxRatio: number, maxScreenWidth: number): Size {
  const targetWidth: number = Math.min(windowSize.w, maxScreenWidth);
  const targetHeight: number = windowSize.h;
  const target: Size = { w: targetWidth, h: targetHeight };

  const realRatio = target.w / target.h;
  if (realRatio < minRatio) {
    const w = target.w;
    const h = Math.floor(target.w / minRatio);

    return { w, h };
  } else if (realRatio > maxRatio) {
    const w = target.w;
    const h = Math.floor(target.w / maxRatio);

    return { w, h };
  } else {
    return target;
  }
}
