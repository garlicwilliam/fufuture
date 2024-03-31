import { concatMap, EMPTY, from, Observable, of } from 'rxjs';
import * as request from 'superagent';
import { Response } from 'superagent';
import { catchError, filter, map, take } from 'rxjs/operators';

export type HttpError = { err: any; ok: boolean };

export function httpPost(
  url: string,
  param: any,
  ops?: { isForm?: boolean; withCredentials?: boolean; throwErr?: boolean }
): Observable<any> {
  try {
    const postUrl = ops?.isForm
      ? request.post(url).type('form')
      : request.post(url).withCredentials(ops?.withCredentials || false);
    return from(postUrl.send(param)).pipe(
      catchError(err => {
        console.warn('http post error is', err);
        if (ops?.throwErr) {
          throw err;
        } else {
          return of({ err, ok: false } as HttpError);
        }
      })
    );
  } catch (err) {
    console.warn('http post error', err);
    return of({ err, ok: false, body: { code: 500 } } as HttpError);
  }
}

export function httpPostUseRetry(
  urls: string[],
  param: any,
  ops?: { isForm?: boolean; withCredentials?: boolean; checker?: (res: Response) => boolean }
): Observable<any> {
  return from(urls).pipe(
    concatMap(url => {
      return httpPost(url, param, { ...ops, throwErr: true }).pipe(
        catchError(err => {
          return of(null);
        }),
        map(res => {
          if (ops?.checker) {
            if (ops.checker(res)) {
              return res;
            } else {
              return null;
            }
          } else {
            return res;
          }
        })
      );
    }),
    filter(res => res !== null),
    take(1)
  );
}

export function httpGet(
  url: string,
  param: any = {},
  ops?: { returnError?: boolean; withCredentials?: boolean }
): Observable<any> {
  try {
    return from(
      request
        .get(url)
        .withCredentials(ops?.withCredentials || false)
        .send(param)
    ).pipe(
      catchError(err => {
        console.warn('http get error is', err);
        if (ops?.returnError) {
          throw err;
        } else {
          return EMPTY;
        }
      })
    );
  } catch (err) {
    console.warn(err);
    if (ops?.returnError) {
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
