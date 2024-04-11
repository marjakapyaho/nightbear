import { MIN_IN_MS } from 'shared/utils/calculations';
import { SensorEntry } from 'shared/types/timelineEntries';

export function entriesCompressionLow(currentTimestamp: number): SensorEntry[] {
  return [
    {
      timestamp: currentTimestamp - 30 * MIN_IN_MS,
      bloodGlucose: 10,
    },
    {
      timestamp: currentTimestamp - 25 * MIN_IN_MS,
      bloodGlucose: 10.4,
    },
    {
      timestamp: currentTimestamp - 20 * MIN_IN_MS,
      bloodGlucose: 9.9,
    },
    {
      timestamp: currentTimestamp - 15 * MIN_IN_MS,
      bloodGlucose: 7,
    },
    {
      timestamp: currentTimestamp - 10 * MIN_IN_MS,
      bloodGlucose: 3.8,
    },
  ];
}
