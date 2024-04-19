import { SensorEntry } from 'shared/types/timelineEntries';
import { getISOStrMinusMinutes } from 'shared/utils/time';

export function entriesBadHigh(currentTimestamp: number): SensorEntry[] {
  return [
    {
      timestamp: getISOStrMinusMinutes(currentTimestamp, 20),
      bloodGlucose: 15.9,
      type: 'DEXCOM_G6_SHARE',
    },
    {
      timestamp: getISOStrMinusMinutes(currentTimestamp, 15),
      bloodGlucose: 16.5,
      type: 'DEXCOM_G6_SHARE',
    },
    {
      timestamp: getISOStrMinusMinutes(currentTimestamp, 10),
      bloodGlucose: 17.5,
      type: 'DEXCOM_G6_SHARE',
    },
    {
      timestamp: getISOStrMinusMinutes(currentTimestamp, 5),
      bloodGlucose: 18.5,
      type: 'DEXCOM_G6_SHARE',
    },
  ];
}
