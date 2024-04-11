import { MIN_IN_MS } from 'shared/utils/calculations';
import { generateUuid } from 'shared/utils/id';
import { SensorEntry } from 'shared/types/timelineEntries';
import { Alarm } from 'shared/types/alarms';

export function entriesBadLowToLow(currentTimestamp: number): SensorEntry[] {
  return [
    {
      timestamp: currentTimestamp - 20 * MIN_IN_MS,
      bloodGlucose: 2.9,
    },
    {
      timestamp: currentTimestamp - 15 * MIN_IN_MS,
      bloodGlucose: 3.3,
    },
    {
      timestamp: currentTimestamp - 10 * MIN_IN_MS,
      bloodGlucose: 3.6,
    },
    {
      timestamp: currentTimestamp - 5 * MIN_IN_MS,
      bloodGlucose: 3.8,
    },
  ];
}

export function alarmsWithInactiveBadLow(currentTimestamp: number): Alarm[] {
  return [
    {
      id: '123',
      timestamp: currentTimestamp - 40 * MIN_IN_MS,
      situationType: 'BAD_LOW',
      isActive: false,
      deactivationTimestamp: currentTimestamp - 10 * MIN_IN_MS,
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
