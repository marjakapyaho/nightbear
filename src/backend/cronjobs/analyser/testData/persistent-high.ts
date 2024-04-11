import { MIN_IN_MS } from 'shared/utils/calculations';
import { range } from 'lodash';
import { SensorEntry } from 'shared/types/timelineEntries';

export function entriesPersistentHigh(currentTimestamp: number): SensorEntry[] {
  return range(30).map((index): SensorEntry => {
    return {
      timestamp: currentTimestamp - index * 5 * MIN_IN_MS,
      bloodGlucose: 11,
    };
  });
}
