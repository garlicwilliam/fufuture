import { PageState } from '../interface';
import { BehaviorSubject, Observable } from 'rxjs';
import _ from 'lodash';

export class PageStateImp<T> implements PageState<T> {
  private readonly state: BehaviorSubject<T>;

  constructor(private defaultVal: T, private path: string) {
    this.state = new BehaviorSubject<T>(defaultVal);
  }

  default(): T {
    return this.defaultVal;
  }

  set(state: T, compare: boolean = false): void {
    if (compare) {
      const curr = this.state.getValue();
      if (_.isEqual(state, curr)) {
        return;
      }
    }

    this.state.next(state);
  }

  setToDefault() {
    this.state.next(this.defaultVal);
  }

  get(): T {
    return this.state.getValue();
  }

  watch(): Observable<T> {
    return this.state;
  }
}
