import { DateTime } from 'luxon'
import { HOUR_IN_MS, MIN_IN_MS } from './const'

// TODO: Make this configurable via env (or just use env.DEFAULT_TIMEZONE as-is)
export const DEFAULT_TIMEZONE = 'Europe/Helsinki'

// @example "12:34"
export const humanReadableShortTime = (msUtc: number = Date.now()) => {
  return DateTime.fromMillis(msUtc).setZone(DEFAULT_TIMEZONE).toFormat('HH:mm')
}

// @example "2020-01-31 12:34:56"
export const humanReadableLongTime = (utcISOStr: string) => {
  return DateTime.fromISO(utcISOStr).setZone(DEFAULT_TIMEZONE).toFormat('yyyy-MM-dd HH:mm:ss')
}

// @example "2020-01-31"
export const getDateWithoutTime = (utcISOStr: string) => {
  return DateTime.fromISO(utcISOStr).toFormat('yyyy-MM-dd')
}

export const getDateWithoutTimeMs = (timestampMs: number) => {
  return DateTime.fromMillis(timestampMs).toFormat('yyyy-MM-dd')
}

// Returns the timestamp (in milliseconds UTC) of the given hours/minutes/seconds combo for the current day.
// Note that this may be in the past or in the future, relevant to Date.now().
export function getActivationTimestamp(spec: {
  hours: number
  minutes?: number
  seconds?: number
}) {
  const d = new Date()
  d.setUTCHours(spec.hours)
  d.setUTCMinutes(spec?.minutes || 0)
  d.setUTCSeconds(spec?.seconds || 0)
  return d.getTime()
}

// Type converters
export const getTimeInMillis = (time: string | number): number =>
  typeof time === 'string' ? DateTime.fromISO(time).toMillis() : time

export const getTimeAsISOStr = (time: number | string): string =>
  typeof time === 'string' ? time : DateTime.fromMillis(time).toUTC().toISO() || ''

export const minToMs = (minutes: number) => minutes * MIN_IN_MS
export const hourToMs = (minutes: number) => minutes * HOUR_IN_MS

// Comparisons
export const isTimeLarger = (time1: string | number, time2: string | number) =>
  getTimeInMillis(time1) > getTimeInMillis(time2)

export const isTimeLargerOrEqual = (time1: string | number, time2: string | number) =>
  getTimeInMillis(time1) >= getTimeInMillis(time2)

export const isTimeSmaller = (time1: string | number, time2: string | number) =>
  getTimeInMillis(time1) < getTimeInMillis(time2)

export const isTimeSmallerOrEqual = (time1: string | number, time2: string | number) =>
  getTimeInMillis(time1) <= getTimeInMillis(time2)

// Minus
export const getTimeMinusTime = (time1: string | number, time2: string | number) =>
  getTimeAsISOStr(getTimeInMillis(time1) - getTimeInMillis(time2))

export const getTimeMinusTimeMs = (time1: string | number, time2: string | number) =>
  getTimeInMillis(time1) - getTimeInMillis(time2)

export const getTimeMinusMinutes = (time1: string | number, minutes: number) =>
  getTimeAsISOStr(getTimeInMillis(time1) - minutes * MIN_IN_MS)

export const getTimeMinusHours = (time1: string | number, hours: number) =>
  getTimeAsISOStr(getTimeInMillis(time1) - hours * HOUR_IN_MS)

// Plus
export const getTimePlusTime = (time1: string | number, time2: string | number) =>
  getTimeAsISOStr(getTimeInMillis(time1) + getTimeInMillis(time2))

export const getTimePlusMinutes = (time1: string | number, minutes: number) =>
  getTimeAsISOStr(getTimeInMillis(time1) + minutes * MIN_IN_MS)

export const getTimePlusTimeMs = (time1: string | number, time2: string | number) =>
  getTimeInMillis(time1) + getTimeInMillis(time2)

export const measure = () => {
  const then = Date.now()
  return () => (getTimeMinusTimeMs(Date.now(), then) / 1000).toFixed(3) + ' sec'
}
