import { generateSensorEntries } from 'shared/utils/test';
import { SensorEntry } from 'shared/types/timelineEntries';

export function entriesCompressionLow(currentTimestamp: number): SensorEntry[] {
  return generateSensorEntries({
    currentTimestamp: currentTimestamp,
    bloodGlucoseHistory: [10, 10.4, 9.9, 7, 3.8],
    latestEntryAge: 10, // last entry is some time ago
  });
}
