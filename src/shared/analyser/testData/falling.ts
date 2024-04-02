import { MIN_IN_MS } from 'shared/calculations/calculations';
import { SensorEntry } from 'shared/types/timelineEntries';

export function entriesFalling(currentTimestamp: number): SensorEntry[] {
  return [
    {
      timestamp: currentTimestamp - 20 * MIN_IN_MS,
      bloodGlucose: 11,
    },
    {
      timestamp: currentTimestamp - 15 * MIN_IN_MS,
      bloodGlucose: 9.8,
    },
    {
      timestamp: currentTimestamp - 10 * MIN_IN_MS,
      bloodGlucose: 8.0,
    },
    {
      timestamp: currentTimestamp - 5 * MIN_IN_MS,
      bloodGlucose: 7.2,
    },
  ];
}
