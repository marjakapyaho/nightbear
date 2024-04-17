import { MIN_IN_MS } from 'shared/utils/calculations';
import { SensorEntry } from 'shared/types/timelineEntries';
import { Alarm } from 'shared/types/alarms';

export function entriesBadHighToHigh(currentTimestamp: number): SensorEntry[] {
  return [
    {
      timestamp: currentTimestamp - 20 * MIN_IN_MS,
      bloodGlucose: 18.5,
    },
    {
      timestamp: currentTimestamp - 15 * MIN_IN_MS,
      bloodGlucose: 17.5,
    },
    {
      timestamp: currentTimestamp - 10 * MIN_IN_MS,
      bloodGlucose: 16.5,
    },
    {
      timestamp: currentTimestamp - 5 * MIN_IN_MS,
      bloodGlucose: 15.5,
    },
  ];
}

export function alarmsWithInactiveBadHigh(currentTimestamp: number): Alarm[] {
  return [
    {
      id: '1234',
      timestamp: currentTimestamp - 40 * MIN_IN_MS,
      situation: 'BAD_HIGH',
      isActive: false,
      deactivatedAt: currentTimestamp - 15 * MIN_IN_MS,
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
