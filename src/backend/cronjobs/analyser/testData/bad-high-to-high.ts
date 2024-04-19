import { Alarm } from 'shared/types/alarms';
import { SensorEntry } from 'shared/types/timelineEntries';
import { MIN_IN_MS } from 'shared/utils/calculations';
import { getISOStrMinusMinutes } from 'shared/utils/time';

export function entriesBadHighToHigh(currentTimestamp: number): SensorEntry[] {
  return [
    {
      timestamp: getISOStrMinusMinutes(currentTimestamp, 20),
      bloodGlucose: 18.5,
      type: 'DEXCOM_G6_SHARE',
    },
    {
      timestamp: getISOStrMinusMinutes(currentTimestamp, 15),
      bloodGlucose: 17.5,
      type: 'DEXCOM_G6_SHARE',
    },
    {
      timestamp: getISOStrMinusMinutes(currentTimestamp, 10),
      bloodGlucose: 16.5,
      type: 'DEXCOM_G6_SHARE',
    },
    {
      timestamp: getISOStrMinusMinutes(currentTimestamp, 5),
      bloodGlucose: 15.5,
      type: 'DEXCOM_G6_SHARE',
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
