import { CarbEntry, SensorEntry } from 'shared/types/timelineEntries';
import { MIN_IN_MS } from 'shared/utils/calculations';
import { getISOStrMinusMinutes } from 'shared/utils/time';

export function entriesLow(currentTimestamp: number): SensorEntry[] {
  return [
    {
      timestamp: getISOStrMinusMinutes(currentTimestamp, 20),
      bloodGlucose: 6,
      type: 'DEXCOM_G6_SHARE',
    },
    {
      timestamp: getISOStrMinusMinutes(currentTimestamp, 15),
      bloodGlucose: 5,
      type: 'DEXCOM_G6_SHARE',
    },
    {
      timestamp: getISOStrMinusMinutes(currentTimestamp, 10),
      bloodGlucose: 4.7,
      type: 'DEXCOM_G6_SHARE',
    },
    {
      timestamp: getISOStrMinusMinutes(currentTimestamp, 5),
      bloodGlucose: 3.8,
      type: 'DEXCOM_G6_SHARE',
    },
  ];
}

export function recentCarbs(currentTimestamp: number): CarbEntry[] {
  return [
    {
      timestamp: currentTimestamp - 15 * MIN_IN_MS,
      amount: 30,
      speedFactor: 1,
    },
  ];
}
