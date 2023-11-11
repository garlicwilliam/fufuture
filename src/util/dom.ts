import { fromEvent, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export function getParentById(dom: HTMLElement, ...targetId: string[]): HTMLElement | null {
  const parent = dom.parentElement;
  if (parent) {
    if (targetId.indexOf(parent.id) >= 0) {
      return parent;
    } else {
      return getParentById(parent, ...targetId);
    }
  } else {
    return null;
  }
}

/**
 * Check if document click event in the specified areas
 * @param elementIds
 */
export function isDocumentClickInArea(elementIds: string[]): Observable<[Event, boolean]> {
  return fromEvent(document, 'click').pipe(
    map((event: Event) => {
      const target = event.target as HTMLElement;

      if (elementIds.indexOf(target.id) >= 0) {
        return [event, true];
      }

      const gotAElement: HTMLElement | null = getParentById(target, ...elementIds);
      const isIn = gotAElement !== null;

      return [event, isIn];
    })
  );
}
