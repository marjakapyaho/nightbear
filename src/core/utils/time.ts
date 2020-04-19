import { DateTime } from 'luxon';

// TODO: Make this configurable via env (or just use env.TZ as-is)
export const TZ = 'Europe/Helsinki';

// @example "12:34"
export function humanReadableShortTime(msUtc: number = Date.now()) {
  return DateTime.fromMillis(msUtc)
    .setZone(TZ)
    .toFormat('HH:mm'); // https://moment.github.io/luxon/docs/manual/formatting.html#table-of-tokens
}

// Returns the timestamp (in milliseconds UTC) of the given hours/minutes/seconds combo for the current day.
// Note that this may be in the past or in the future, relevant to Date.now().
export function getActivationTimestamp(spec: { hours: number; minutes?: number; seconds?: number }) {
  const d = new Date();
  d.setUTCHours(spec.hours);
  d.setUTCMinutes(spec?.minutes || 0);
  d.setUTCSeconds(spec?.seconds || 0);
  return d.getTime();
}
