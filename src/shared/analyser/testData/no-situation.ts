import { MIN_IN_MS } from 'shared/calculations/calculations';
import { SensorEntry } from 'shared/types/timelineEntries';

export function entriesNoSituation(currentTimestamp: number): SensorEntry[] {
  return [
    {
      timestamp: currentTimestamp - 20 * MIN_IN_MS,
      bloodGlucose: 8.5,
    },
    {
      timestamp: currentTimestamp - 15 * MIN_IN_MS,
      bloodGlucose: 7,
    },
    {
      timestamp: currentTimestamp - 10 * MIN_IN_MS,
      bloodGlucose: 7,
    },
    {
      timestamp: currentTimestamp - 5 * MIN_IN_MS,
      bloodGlucose: 8,
    },
  ];
}
