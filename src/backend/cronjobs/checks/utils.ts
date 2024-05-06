import { HOUR_IN_MS } from 'shared/utils/calculations';
import { Context } from 'backend/utils/api';
import {
  getTimeMinusTime,
  getTimeMinusTimeMs,
  isTimeLargerOrEqual,
  isTimeSmaller,
} from 'shared/utils/time';

export const getRange = (context: Context, hours: number) => ({
  from: getTimeMinusTime(context.timestamp(), hours * HOUR_IN_MS),
});

export const getEntriesWithinTimeRange = <T extends { timestamp: string }>(
  currentTimestamp: string,
  entries: T[],
  rangeInMs: number,
) => {
  const timeWindowStart = getTimeMinusTimeMs(currentTimestamp, rangeInMs);
  return entries.filter(entry => isTimeLargerOrEqual(entry.timestamp, timeWindowStart));
};

export const getEntriesBeforeMs = <T extends { timestamp: string }>(
  currentTimestamp: string,
  entries: T[],
  diffToNowMs: number,
) => {
  const timeWindowEnd = getTimeMinusTimeMs(currentTimestamp, diffToNowMs);
  return entries.filter(entry => isTimeSmaller(entry.timestamp, timeWindowEnd));
};
