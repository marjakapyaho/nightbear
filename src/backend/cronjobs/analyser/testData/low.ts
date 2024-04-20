import { CarbEntry, SensorEntry } from 'shared/types/timelineEntries';
import { MIN_IN_MS } from 'shared/utils/calculations';

import { generateSensorEntries } from 'backend/utils/test';

export function entriesLow(currentTimestamp: number): SensorEntry[] {
  return generateSensorEntries({
    currentTimestamp: currentTimestamp,
    bloodGlucoseHistory: [6, 5, 4.7, 3.8],
    latestEntryAge: 5,
  });
}

export function recentCarbs(currentTimestamp: number): CarbEntry[] {
  return [
    {
      timestamp: new Date(currentTimestamp - 15 * MIN_IN_MS).toISOString(),
      amount: 30,
      speedFactor: 1,
    },
  ];
}
