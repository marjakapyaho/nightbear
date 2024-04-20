import { generateSensorEntries } from 'shared/utils/test';
import { SensorEntry } from 'shared/types/timelineEntries';

export function entriesFalling(currentTimestamp: number): SensorEntry[] {
  return generateSensorEntries({
    currentTimestamp: currentTimestamp,
    bloodGlucoseHistory: [11, 9.8, 8.0, 7.2],
    latestEntryAge: 5,
  });
}
