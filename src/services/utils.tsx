import { EMPTY, Observable } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { maskService } from './mask/mask.service';
import { I18n } from '../components/i18n/i18n';
import { i18n } from '../components/i18n/i18n-fn';

export const loadingObs = <T extends boolean | string>(
  obs: Observable<T>,
  failText: string | null = null,
  pendingText: string | null = null,
  sucHide: boolean = false
): Observable<T> => {
  maskService.pending(pendingText || i18n('com-pending'));

  return obs.pipe(
    tap((done: T) => {
      if (done) {
        if (sucHide) {
          maskService.hide();
        } else {
          maskService.success(<I18n id={'com-succeed'} />);
        }
      } else {
        maskService.failed(failText);
      }
    }),
    catchError(err => {
      maskService.failed(failText);
      return EMPTY;
    })
  );
};

export const pendingMask = (
  pending$: Observable<any>,
  opt?: { tipFailed?: string; tipPending?: string; tipSuccess?: string; hide?: boolean; rsJudge?: (rs: any) => boolean }
): Observable<any> => {
  maskService.pending(opt?.tipPending || i18n('com-pending'));
  return pending$.pipe(
    tap(rs => {
      const judge = opt?.rsJudge || ((rs: any) => !!rs);

      if (judge(rs)) {
        if (opt?.hide) {
          maskService.hide();
        } else {
          maskService.success(opt?.tipSuccess || i18n('com-succeed'));
        }
      } else {
        maskService.failed(opt?.tipFailed || i18n('com-failed'));
      }
    }),
    catchError(err => {
      maskService.failed(opt?.tipFailed || i18n('com-failed'));
      return EMPTY;
    })
  );
};
