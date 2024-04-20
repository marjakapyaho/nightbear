import { generateSensorEntries } from 'shared/utils/test';
import { SensorEntry } from 'shared/types/timelineEntries';

export function entriesBadLow(currentTimestamp: number): SensorEntry[] {
  return generateSensorEntries({
    currentTimestamp: currentTimestamp,
    bloodGlucoseHistory: [4, 4.5, 3.5, 2.9],
    latestEntryAge: 5,
  });
}
