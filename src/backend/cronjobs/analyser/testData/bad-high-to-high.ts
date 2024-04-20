import { generateSensorEntries } from 'shared/utils/test';
import { Alarm } from 'shared/types/alarms';
import { SensorEntry } from 'shared/types/timelineEntries';
import { MIN_IN_MS } from 'shared/utils/calculations';
import { getTimeAsISOStr } from 'shared/utils/time';

export function entriesBadHighToHigh(currentTimestamp: number): SensorEntry[] {
  return generateSensorEntries({
    currentTimestamp: currentTimestamp,
    bloodGlucoseHistory: [18.5, 17.5, 16.5, 15.5],
    latestEntryAge: 5,
  });
}

export function alarmsWithInactiveBadHigh(currentTimestamp: number): Alarm[] {
  return [
    {
      id: '1234',
      timestamp: getTimeAsISOStr(currentTimestamp - 40 * MIN_IN_MS),
      situation: 'BAD_HIGH',
      isActive: false,
      deactivatedAt: getTimeAsISOStr(currentTimestamp - 15 * MIN_IN_MS),
      alarmStates: [
        {
          alarmLevel: 1,
          validAfterTimestamp: getTimeAsISOStr(currentTimestamp - 40 * MIN_IN_MS),
          ackedBy: null,
          pushoverReceipts: [],
        },
      ],
    },
  ];
}
