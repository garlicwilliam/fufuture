import { ReactNode } from 'react';
import { BehaviorSubject, Observable } from 'rxjs';
import { filter } from 'rxjs/operators';

export type MaskEvent = {
  type: 'success' | 'failed' | 'pending' | 'hide';
  text?: ReactNode;
  title?: ReactNode;
};

export class MaskService {
  private curStatus: BehaviorSubject<MaskEvent | null> = new BehaviorSubject<MaskEvent | null>(null);

  watchEvent(): Observable<MaskEvent> {
    return this.curStatus.pipe(filter(Boolean));
  }

  success(text: ReactNode, title?: ReactNode) {
    const event: MaskEvent = {
      type: 'success',
      text,
      title,
    };
    this.curStatus.next(event);
  }

  failed(text: ReactNode, title?: ReactNode) {
    const event: MaskEvent = {
      type: 'failed',
      text,
      title,
    };
    this.curStatus.next(event);
  }

  pending(text: ReactNode, title?: ReactNode) {
    const event: MaskEvent = {
      type: 'pending',
      text,
      title,
    };

    this.curStatus.next(event);
  }

  hide() {
    const event: MaskEvent = {
      type: 'hide',
    };
    this.curStatus.next(event);
  }
}

export const maskService = new MaskService();
