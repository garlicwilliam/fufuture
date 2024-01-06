import Mask from '../components/mask/index';
import { EMPTY, Observable } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { maskService } from './mask/mask.service';
import { I18n } from '../components/i18n/i18n';

// export const loadingObs = <T extends boolean | string>(
//   obs: Observable<T>,
//   failText: string | null = null,
//   pendingText: string | null = null,
//   sucHide: boolean = false
// ): Observable<T> => {
//   Mask.showLoading(pendingText);
//   return obs.pipe(
//     tap((done: T) => {
//       if (done) {
//         if (sucHide) {
//           Mask.hide();
//         } else {
//           Mask.showSuccess();
//         }
//       } else {
//         Mask.showFail(failText);
//       }
//     }),
//     catchError(err => {
//       Mask.showFail(failText);
//       return EMPTY;
//     })
//   );
// };

export const loadingObs = <T extends boolean | string>(
  obs: Observable<T>,
  failText: string | null = null,
  pendingText: string | null = null,
  sucHide: boolean = false
): Observable<T> => {
  maskService.pending(pendingText);

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
