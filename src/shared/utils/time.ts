import { DateTime } from 'luxon';
import { MIN_IN_MS } from 'shared/utils/calculations';

// TODO: Make this configurable via env (or just use env.TZ as-is)
export const TZ = 'Europe/Helsinki';

// @example "12:34"
export const humanReadableShortTime = (msUtc: number = Date.now()) => {
  return DateTime.fromMillis(msUtc).setZone(TZ).toFormat('HH:mm');
};

// @example "2020-01-31 12:34:56"
export const humanReadableLongTime = (utcISOStr: string) => {
  return DateTime.fromISO(utcISOStr).setZone(TZ).toFormat('yyyy-MM-dd HH:mm:ss');
};

// Returns the timestamp (in milliseconds UTC) of the given hours/minutes/seconds combo for the current day.
// Note that this may be in the past or in the future, relevant to Date.now().
export function getActivationTimestamp(spec: {
  hours: number;
  minutes?: number;
  seconds?: number;
}) {
  const d = new Date();
  d.setUTCHours(spec.hours);
  d.setUTCMinutes(spec?.minutes || 0);
  d.setUTCSeconds(spec?.seconds || 0);
  return d.getTime();
}

export const getTimeInMillis = (time: string | number): number =>
  typeof time === 'string' ? DateTime.fromISO(time).toMillis() : time;

export const getTimeAsISOStr = (time: number | string): string =>
  typeof time === 'string' ? time : DateTime.fromMillis(time).toUTC().toISO() || '';

export const isTimeAfter = (time1: string | number, time2: string | number) =>
  getTimeInMillis(time1) > getTimeInMillis(time2);

export const isTimeAfterOrEqual = (time1: string | number, time2: string | number) =>
  getTimeInMillis(time1) >= getTimeInMillis(time2);

export const isTimeBefore = (time1: string | number, time2: string | number) =>
  getTimeInMillis(time1) < getTimeInMillis(time2);

export const isTimeBeforeOrEqual = (time1: string | number, time2: string | number) =>
  getTimeInMillis(time1) <= getTimeInMillis(time2);

export const getISOStrMinusMinutes = (timestamp: number, minutes: number): string =>
  DateTime.fromMillis(timestamp - minutes * MIN_IN_MS)
    .toUTC()
    .toISO() || '';

export const getTimeSubtractedFrom = (time1: string | number, time2: string | number) =>
  getTimeInMillis(time1) - getTimeInMillis(time2);

export const getTimeMinusTime = (time1: string | number, time2: string | number) =>
  getTimeAsISOStr(getTimeInMillis(time1) - getTimeInMillis(time2));

export const getTimeAddedWith = (time1: string | number, time2: string | number) =>
  getTimeInMillis(time1) + getTimeInMillis(time2);
