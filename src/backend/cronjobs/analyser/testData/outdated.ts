import { MIN_IN_MS } from 'shared/utils/calculations';
import { SensorEntry } from 'shared/types/timelineEntries';

export function entriesOutdated(currentTimestamp: number): SensorEntry[] {
  return [
    {
      timestamp: currentTimestamp - 45 * MIN_IN_MS,
      bloodGlucose: 6,
    },
    {
      timestamp: currentTimestamp - 40 * MIN_IN_MS,
      bloodGlucose: 5,
    },
    {
      timestamp: currentTimestamp - 35 * MIN_IN_MS,
      bloodGlucose: 4.7,
    },
    {
      timestamp: currentTimestamp - 30 * MIN_IN_MS,
      bloodGlucose: 3.8,
    },
  ];
}
