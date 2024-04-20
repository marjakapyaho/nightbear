import { generateSensorEntries } from 'backend/utils/test';
import { SensorEntry } from 'shared/types/timelineEntries';

export function entriesBadHigh(currentTimestamp: number): SensorEntry[] {
  return generateSensorEntries({
    currentTimestamp: currentTimestamp,
    bloodGlucoseHistory: [15.9, 16.5, 17.5, 18.5],
    latestEntryAge: 5,
  });
}
