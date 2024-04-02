import { MIN_IN_MS } from 'shared/calculations/calculations';
import { SensorEntry } from 'shared/types/timelineEntries';

export function entriesHighFluctuations(currentTimestamp: number): SensorEntry[] {
  return [
    {
      timestamp: currentTimestamp - 35 * MIN_IN_MS,
      bloodGlucose: 14.5,
    },
    {
      timestamp: currentTimestamp - 30 * MIN_IN_MS,
      bloodGlucose: 15.3,
    },
    {
      timestamp: currentTimestamp - 25 * MIN_IN_MS,
      bloodGlucose: 15.6,
    },
    {
      timestamp: currentTimestamp - 20 * MIN_IN_MS,
      bloodGlucose: 16.5,
    },
    {
      timestamp: currentTimestamp - 15 * MIN_IN_MS,
      bloodGlucose: 15.9,
    },
    {
      timestamp: currentTimestamp - 10 * MIN_IN_MS,
      bloodGlucose: 15.5,
    },
    {
      timestamp: currentTimestamp - 5 * MIN_IN_MS,
      bloodGlucose: 15.1,
    },
  ];
}
