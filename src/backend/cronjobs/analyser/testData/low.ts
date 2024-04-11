import { MIN_IN_MS } from 'shared/utils/calculations';
import { CarbEntry, SensorEntry } from 'shared/types/timelineEntries';

export function entriesLow(currentTimestamp: number): SensorEntry[] {
  return [
    {
      timestamp: currentTimestamp - 20 * MIN_IN_MS,
      bloodGlucose: 6,
    },
    {
      timestamp: currentTimestamp - 15 * MIN_IN_MS,
      bloodGlucose: 5,
    },
    {
      timestamp: currentTimestamp - 10 * MIN_IN_MS,
      bloodGlucose: 4.7,
    },
    {
      timestamp: currentTimestamp - 5 * MIN_IN_MS,
      bloodGlucose: 3.8,
    },
  ];
}

export function recentCarbs(currentTimestamp: number): CarbEntry[] {
  return [
    {
      timestamp: currentTimestamp - 15 * MIN_IN_MS,
      amount: 30,
    },
  ];
}
