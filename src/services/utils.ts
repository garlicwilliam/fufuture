import Mask from '../components/mask/index';
import { EMPTY, Observable } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

export const loadingObs = <T extends boolean | string>(
  obs: Observable<T>,
  failText: string | null = null,
  pendingText: string | null = null,
  sucHide: boolean = false
): Observable<T> => {
  Mask.showLoading(pendingText);
  return obs.pipe(
    tap((done: T) => {
      if (done) {
        if (sucHide) {
          Mask.hide();
        } else {
          Mask.showSuccess();
        }
      } else {
        Mask.showFail(failText);
      }
    }),
    catchError(err => {
      Mask.showFail(failText);
      return EMPTY;
    })
  );
};
