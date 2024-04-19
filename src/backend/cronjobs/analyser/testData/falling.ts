import { SensorEntry } from 'shared/types/timelineEntries';
import { getISOStrMinusMinutes } from 'shared/utils/time';

export function entriesFalling(currentTimestamp: number): SensorEntry[] {
  return [
    {
      timestamp: getISOStrMinusMinutes(currentTimestamp, 20),
      bloodGlucose: 11,
      type: 'DEXCOM_G6_SHARE',
    },
    {
      timestamp: getISOStrMinusMinutes(currentTimestamp, 15),
      bloodGlucose: 9.8,
      type: 'DEXCOM_G6_SHARE',
    },
    {
      timestamp: getISOStrMinusMinutes(currentTimestamp, 10),
      bloodGlucose: 8.0,
      type: 'DEXCOM_G6_SHARE',
    },
    {
      timestamp: getISOStrMinusMinutes(currentTimestamp, 5),
      bloodGlucose: 7.2,
      type: 'DEXCOM_G6_SHARE',
    },
  ];
}
