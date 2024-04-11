import { MIN_IN_MS } from 'shared/utils/calculations';
import { InsulinEntry, SensorEntry } from 'shared/types/timelineEntries';

export function entriesHigh(currentTimestamp: number): SensorEntry[] {
  return [
    {
      timestamp: currentTimestamp - 20 * MIN_IN_MS,
      bloodGlucose: 14,
    },
    {
      timestamp: currentTimestamp - 15 * MIN_IN_MS,
      bloodGlucose: 14.8,
    },
    {
      timestamp: currentTimestamp - 10 * MIN_IN_MS,
      bloodGlucose: 14.9,
    },
    {
      timestamp: currentTimestamp - 5 * MIN_IN_MS,
      bloodGlucose: 15.9,
    },
  ];
}

export function recentInsulin(currentTimestamp: number): InsulinEntry[] {
  return [
    {
      timestamp: currentTimestamp,
      amount: 3,
    },
  ];
}
