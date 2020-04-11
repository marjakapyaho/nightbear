import { DateTime } from 'luxon';

// @example "12:34"
export function humanReadableShortTime(utcTs: number) {
  return DateTime.fromMillis(utcTs).toFormat('HH:mm'); // https://moment.github.io/luxon/docs/manual/formatting.html#table-of-tokens
}
