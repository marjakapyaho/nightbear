import { generateSensorEntries } from 'shared/utils/test';
import { Alarm } from 'shared/types/alarms';
import { SensorEntry } from 'shared/types/timelineEntries';
import { MIN_IN_MS } from 'shared/utils/calculations';

export function entriesBadLowToLow(currentTimestamp: number): SensorEntry[] {
  return generateSensorEntries({
    currentTimestamp: currentTimestamp,
    bloodGlucoseHistory: [2.9, 3.3, 3.6, 3.8],
    latestEntryAge: 5,
  });
}

export function alarmsWithInactiveBadLow(currentTimestamp: number): Alarm[] {
  return [
    {
      id: '123',
      timestamp: currentTimestamp - 40 * MIN_IN_MS,
      situation: 'BAD_LOW',
      isActive: false,
      deactivatedAt: currentTimestamp - 10 * MIN_IN_MS,
      alarmStates: [
        {
          alarmLevel: 1,
          validAfterTimestamp: currentTimestamp - 40 * MIN_IN_MS,
          ackedBy: null,
          pushoverReceipts: [],
        },
      ],
    },
  ];
}
