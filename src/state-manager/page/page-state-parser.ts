import { PageState, PageStateDefine, PageStateDefineTree, PageStateTree } from '../interface';
import { PageStateImp } from './page-state';
import { PAGE_STATE } from './page-state-def';
import { confirmIsMini, confirmIsMobile, confirmIsNarrow, Size, windowHeight, windowWidth } from '../../util/layout';
import _ from 'lodash';
import { asyncScheduler } from 'rxjs';

function isPageStateDefine(def: any): boolean {
  return _.has(def, '_default');
}

export function parsePageStateTreeDefine<D extends PageStateDefineTree>(
  defines: D,
  parentPath: string
): PageStateTree<D> {
  const rs = {} as any;

  const keys = Object.keys(defines) as (keyof D)[];
  keys.forEach(k => {
    const def: PageStateDefineTree | PageStateDefine<any> = defines[k];
    if (isPageStateDefine(def)) {
      rs[k] = convertPageState(def as PageStateDefine<any>, parentPath + '.' + k.toString());
    } else {
      rs[k] = parsePageStateTreeDefine(def as PageStateDefineTree, parentPath + '.' + k.toString());
    }
  });

  return rs as PageStateTree<D>;
}

export function convertPageState<T>(pageDefine: PageStateDefine<T>, path: string): PageState<T> {
  return new PageStateImp(pageDefine._default, path);
}

export const P = parsePageStateTreeDefine(PAGE_STATE, 'P');

export function updateMobileMode(): { isMobile: boolean; isNarrow: boolean; windowSize: Size } {
  const isMobile: boolean = confirmIsMobile();
  const isNarrow: boolean = confirmIsNarrow();
  const isMini: boolean = confirmIsMini();
  const size: Size = { w: windowWidth(), h: windowHeight() };

  // update global page state
  asyncScheduler.schedule(() => {
    P.Layout.IsMobile.set(isMobile, true);
    P.Layout.IsNarrow.set(isNarrow, true);
    P.Layout.IsMini.set(isMini, true);
    P.Layout.WindowSize.set(size, true);
  });

  return { isMobile, isNarrow, windowSize: size };
}
