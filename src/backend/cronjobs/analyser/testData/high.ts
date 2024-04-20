import { InsulinEntry, SensorEntry } from 'shared/types/timelineEntries';

import { generateSensorEntries } from 'shared/utils/test';

export function entriesHigh(currentTimestamp: number): SensorEntry[] {
  return generateSensorEntries({
    currentTimestamp: currentTimestamp,
    bloodGlucoseHistory: [14, 14.8, 14.9, 15.9],
    latestEntryAge: 5,
  });
}

export function recentInsulin(currentTimestamp: number): InsulinEntry[] {
  return [
    {
      timestamp: new Date(currentTimestamp).toISOString(),
      amount: 3,
      type: 'FAST',
    },
  ];
}
