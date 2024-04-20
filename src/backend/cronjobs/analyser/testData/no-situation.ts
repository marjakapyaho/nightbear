import { generateSensorEntries } from 'backend/utils/test';
import { SensorEntry } from 'shared/types/timelineEntries';

export function entriesNoSituation(currentTimestamp: number): SensorEntry[] {
  return generateSensorEntries({
    currentTimestamp: currentTimestamp,
    bloodGlucoseHistory: [8.5, 7, 7, 8],
    latestEntryAge: 5,
  });
}
