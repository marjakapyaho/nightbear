import { generateSensorEntries } from 'shared/utils/test';
import { range } from 'lodash';
import { SensorEntry } from 'shared/types/timelineEntries';

export function entriesPersistentHigh(currentTimestamp: number): SensorEntry[] {
  return generateSensorEntries({
    currentTimestamp: currentTimestamp,
    bloodGlucoseHistory: range(30).map(() => 11), // been at 11 for a long time
    latestEntryAge: 5,
  });
}
