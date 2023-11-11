import dayjs from 'dayjs';
import { i18n } from '../components/i18n/i18n-fn';

export type DeltaTime = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  ceilDays: number;
  totalHours: number;
};

export const EMPTY_DELTA_TIME = {
  days: 0,
  hours: 0,
  minutes: 0,
  seconds: 0,
  ceilDays: 0,
  totalHours: 0,
};

function toMilliseconds(time: string | number): number {
  let timeStr = time.toString();
  const millisecondLen: number = new Date().getTime().toString().length;
  if (timeStr.length < millisecondLen) {
    timeStr = timeStr + '000';
  }

  return Number(timeStr);
}

export const formatTime = (time: string | number) => {
  const milliSec = toMilliseconds(time);
  return dayjs(milliSec).format('YYYY-MM-DD HH:mm:ss');
};

export const formatMinute = (time: number) => {
  const milliSec = toMilliseconds(time);
  return dayjs(milliSec).format('MM-DD HH:mm');
};

export const formatDate = (time: number, fmtStr: string = 'YYYY.MM.DD') => {
  const milliSec = toMilliseconds(time);
  return dayjs(milliSec).format(fmtStr);
};

export function displayDuration(seconds: number): DeltaTime {
  if (seconds <= 0) {
    return EMPTY_DELTA_TIME;
  }

  const modDay = 24 * 3600;
  const modHrs = 3600;
  const modMin = 60;
  const modSec = 1;

  const day = Math.floor(seconds / modDay);
  seconds = seconds % modDay;

  const hrs = Math.floor(seconds / modHrs);
  seconds = seconds % modHrs;

  const min = Math.floor(seconds / modMin);
  seconds = seconds % modMin;

  const sec = Math.floor(seconds / modSec);

  return {
    days: day,
    hours: hrs,
    minutes: min,
    seconds: sec,

    ceilDays: hrs > 0 || min > 0 ? day + 1 : day,
    totalHours: day * 24 + hrs,
  };
}

export function deltaTimeToStr(delta: DeltaTime, useSec: boolean = false): string {
  const days =
    delta.days === 0
      ? ''
      : delta.days === 1
      ? i18n('com-one-day', { num: '1' })
      : i18n('com-some-days', { num: delta.days.toString() });

  const hours = delta.hours + 'h';
  const minus = delta.minutes + 'm';
  const secd = useSec ? delta.seconds + 's' : '';

  return [days, hours, minus, secd].join(' ').trim();
}

export function curTimestamp(): number {
  return Math.ceil(new Date().getTime() / 1000);
}
