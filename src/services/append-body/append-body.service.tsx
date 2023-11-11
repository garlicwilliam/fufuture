import { asyncScheduler, BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import * as _ from 'lodash';

export class AppendBodyService {
  private elementMap = new Map<string, JSX.Element>();
  private renderIds: BehaviorSubject<Set<string>> = new BehaviorSubject<Set<string>>(new Set());

  public renderElement(el: JSX.Element, id: string) {
    if ((this.elementMap.has(id) && this.elementMap.get(id) !== el) || !this.elementMap.has(id)) {
      this.elementMap.set(id, el);
    }

    asyncScheduler.schedule(() => {
      const ids: Set<string> = this.renderIds.getValue().add(id);
      this.renderIds.next(ids);
    });
  }

  public removeElement(id: string) {
    this.elementMap.delete(id);

    asyncScheduler.schedule(() => {
      const ids = this.renderIds.getValue();
      ids.delete(id);
      this.renderIds.next(ids);
    });
  }

  public watchElements(): Observable<[string, JSX.Element][]> {
    return this.renderIds.pipe(
      map((ids: Set<string>) => {
        const rs: [string, JSX.Element][] = [];
        ids.forEach(id => {
          const el: JSX.Element = this.elementMap.get(id) as JSX.Element;
          rs.push([id, el]);
        });

        return _.sortBy(rs, one => one[0]);
      })
    );
  }
}

export const appendBodyService = new AppendBodyService();
