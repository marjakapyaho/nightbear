import { Alarm } from 'shared/types/alarms';
import { SensorEntry } from 'shared/types/timelineEntries';
import { MIN_IN_MS } from 'shared/utils/calculations';
import { getISOStrMinusMinutes } from 'shared/utils/time';

export function entriesBadLowToLow(currentTimestamp: number): SensorEntry[] {
  return [
    {
      timestamp: getISOStrMinusMinutes(currentTimestamp, 20),
      bloodGlucose: 2.9,
      type: 'DEXCOM_G6_SHARE',
    },
    {
      timestamp: getISOStrMinusMinutes(currentTimestamp, 15),
      bloodGlucose: 3.3,
      type: 'DEXCOM_G6_SHARE',
    },
    {
      timestamp: getISOStrMinusMinutes(currentTimestamp, 10),
      bloodGlucose: 3.6,
      type: 'DEXCOM_G6_SHARE',
    },
    {
      timestamp: getISOStrMinusMinutes(currentTimestamp, 5),
      bloodGlucose: 3.8,
      type: 'DEXCOM_G6_SHARE',
    },
  ];
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
