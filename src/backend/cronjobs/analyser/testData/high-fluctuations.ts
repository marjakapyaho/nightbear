import { generateSensorEntries } from 'backend/utils/test';
import { SensorEntry } from 'shared/types/timelineEntries';

export function entriesHighFluctuations(currentTimestamp: number): SensorEntry[] {
  return generateSensorEntries({
    currentTimestamp: currentTimestamp,
    bloodGlucoseHistory: [14.5, 15.3, 15.6, 16.5, 15.9, 15.5, 15.1],
    latestEntryAge: 5,
  });
}
