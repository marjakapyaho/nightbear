import { generateSensorEntries } from 'shared/utils/test';
import { SensorEntry } from 'shared/types/timelineEntries';

export function entriesOutdated(currentTimestamp: number): SensorEntry[] {
  return generateSensorEntries({
    currentTimestamp: currentTimestamp,
    bloodGlucoseHistory: [6, 5, 4.7, 3.8],
    latestEntryAge: 30, // last entry was long ago
  });
}
