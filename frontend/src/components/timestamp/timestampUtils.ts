import { DAY_IN_MS, HOUR_IN_MS } from '@nightbear/shared';
import { DateTime, Duration } from 'luxon';

const LIVE_FORMAT_AGE_LIMIT = HOUR_IN_MS;
const FULL_FORMAT_AGE_LIMIT = DAY_IN_MS * 0.5;

// @example "12:34 ago"
// @example "12:34:56"
export const getFormattedTs = (ts: number, live?: boolean): string => {
  const liveAge = getLiveAge(ts, live);
  if (liveAge !== null) {
    return Duration.fromMillis(liveAge).toFormat("mm:ss 'ago'"); // https://moment.github.io/luxon/docs/manual/formatting.html#table-of-tokens
  } else {
    return getFormattedTimestamp(ts);
  }
};

// Difference to current time in ms, or null if we shouldn't have a live age anymore
export const getLiveAge = (ts: number, live?: boolean): number | null => {
  if (!live) return null;
  const delta = Date.now() - ts;
  return delta >= 0 && delta <= LIVE_FORMAT_AGE_LIMIT ? delta : null;
};

// @example "12:34:56"
export const getFormattedTimestamp = (timestamp: number): string => {
  const age = Date.now() - timestamp;
  if (age < FULL_FORMAT_AGE_LIMIT) {
    return DateTime.fromMillis(timestamp).toFormat('HH:mm:ss'); // https://moment.github.io/luxon/docs/manual/formatting.html#table-of-tokens
  } else {
    return DateTime.fromMillis(timestamp).toLocaleString(DateTime.DATETIME_SHORT);
  }
};
