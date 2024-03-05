import { BehaviorSubject, Observable } from 'rxjs';
import * as _ from 'lodash';
import { setAddAll, setDelAll } from './array';

export enum AppName {
  Stone = 'shield-stone',
  StoneOmni = 'stone-omni',
  ShieldHome = 'shield-home',
  ShieldTrade = 'shield-trade',
}
const field = 'SldApp';

export function setAppName(name: AppName) {
  window[field] = name;
  addBodyClass(name);
}

export function getAppName(): AppName {
  return window[field];
}

export function addBodyClass(name: string | string[], remove?: string | string[]) {
  let classSet = bodyClasses();

  const names = typeof name === 'string' ? [name] : name;
  classSet = setAddAll(classSet, names);

  if (remove) {
    const removes = typeof remove === 'string' ? [remove] : remove;
    classSet = setDelAll(classSet, removes);
  }

  writeBodyClassName(classSet);
}

export function delBodyClass(...names: string[]) {
  const classSet = bodyClasses();

  for (const n of names) {
    classSet.delete(n);
  }

  writeBodyClassName(classSet);
}

export function initAppVariable<T>(name: string, val: T): BehaviorSubject<T> {
  window[name] = new BehaviorSubject<T>(val);
  return window[name];
}

export function watchAppVariable<T>(name: string): Observable<T> {
  return window[name] as Observable<T>;
}

export function setAppVariable<T>(name: string, val: T) {
  const subject = window[name] as BehaviorSubject<T>;
  if (!_.isEqual(subject.getValue(), val)) {
    subject.next(val);
  }
}

export function addAppListener<K extends keyof WindowEventMap>(event: K, callback: () => any) {
  callback();
  window.addEventListener(event, callback);
}

// ---------------------------------------------------------------------------------------------------------------------

function bodyClasses(): Set<string> {
  const className: string | null = document.body.getAttribute('class');
  const classArray = className ? className.split(' ').filter((one: string) => one.trim().length > 0) : [];

  return new Set<string>(classArray);
}

function writeBodyClassName(classSet: Set<string>) {
  const newClassName: string = Array.from(classSet).join(' ');
  document.body.setAttribute('class', newClassName);
}
