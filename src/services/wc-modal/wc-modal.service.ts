import { asyncScheduler, BehaviorSubject, Observable } from 'rxjs';
import { filter, map, tap } from 'rxjs/operators';

export type WcWalletInfo = {
  name: string;
  nameShort: string;
  icon: string;
  download: {
    ios: string;
    android: string;
  };
  uri: string;
  peer: {
    name: string;
    url: string;
  };
};

export type WcModalEvent = { type: 'show'; walletInfo: WcWalletInfo } | { type: 'hide' };
export class WcModalService {
  private curStatus: BehaviorSubject<WcModalEvent | null> = new BehaviorSubject<WcModalEvent | null>(null);
  private state: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  constructor() {}

  subscribeState(): Observable<boolean> {
    return this.state;
  }

  watchEvent(): Observable<WcModalEvent> {
    return this.curStatus.pipe(filter(Boolean));
  }

  cancel() {
    this.hide();
    this.state.next(false);
  }

  show(content: WcWalletInfo) {
    const event: WcModalEvent = {
      type: 'show',
      walletInfo: content,
    };

    asyncScheduler.schedule(() => {
      this.curStatus.next(event);
      this.state.next(true);
    });
  }

  hide() {
    const event: WcModalEvent = { type: 'hide' };

    asyncScheduler.schedule(() => {
      this.curStatus.next(event);
    });
  }
}

export const wcModalService: WcModalService = new WcModalService();
