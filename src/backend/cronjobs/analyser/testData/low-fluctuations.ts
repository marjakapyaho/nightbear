import { generateSensorEntries } from 'shared/utils/test';
import { SensorEntry } from 'shared/types/timelineEntries';

export function entriesLowFluctuations(currentTimestamp: number): SensorEntry[] {
  return generateSensorEntries({
    currentTimestamp: currentTimestamp,
    bloodGlucoseHistory: [4, 3.8, 3.5, 3.4, 3.6, 3.8],
    latestEntryAge: 5,
  });
}
