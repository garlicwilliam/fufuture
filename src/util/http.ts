import { EMPTY, from, Observable, of } from 'rxjs';
import * as request from 'superagent';
import { Response } from 'superagent';
import { catchError, map } from 'rxjs/operators';

export type HttpError = { err: any; ok: boolean };

export function httpPost(url: string, param: any, isForm: boolean = false): Observable<any> {
  try {
    const postUrl = isForm ? request.post(url).type('form') : request.post(url);
    return from(postUrl.send(param)).pipe(
      catchError(err => {
        console.warn('http post error is', err);
        return of({ err, ok: false } as HttpError);
      })
    );
  } catch (err) {
    console.warn('http post error', err);
    return of({ err, ok: false, body: { code: 500 } } as HttpError);
  }
}

export function httpGet(url: string, param: any = {}, returnErr: boolean = false): Observable<any> {
  try {
    return from(request.get(url).send(param)).pipe(
      catchError(err => {
        console.warn('http get error is', err);
        if (returnErr) {
          throw err;
        } else {
          return EMPTY;
        }
      })
    );
  } catch (err) {
    console.warn(err);
    if (returnErr) {
      throw err;
    } else {
      return EMPTY;
    }
  }
}

export function httpJson(url: string): Observable<any> {
  return from(request.get(url).accept('application/json')).pipe(
    map((res: Response) => {
      return res.body;
    }),
    catchError(err => {
      console.warn(err);
      return of({});
    })
  );
}
