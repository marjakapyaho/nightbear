import { SensorEntry } from 'shared/types/timelineEntries';
import { getISOStrMinusMinutes } from 'shared/utils/time';

export function entriesLowFluctuations(currentTimestamp: number): SensorEntry[] {
  return [
    {
      timestamp: getISOStrMinusMinutes(currentTimestamp, 30),
      bloodGlucose: 4,
      type: 'DEXCOM_G6_SHARE',
    },
    {
      timestamp: getISOStrMinusMinutes(currentTimestamp, 25),
      bloodGlucose: 3.8,
      type: 'DEXCOM_G6_SHARE',
    },
    {
      timestamp: getISOStrMinusMinutes(currentTimestamp, 20),
      bloodGlucose: 3.5,
      type: 'DEXCOM_G6_SHARE',
    },
    {
      timestamp: getISOStrMinusMinutes(currentTimestamp, 15),
      bloodGlucose: 3.4,
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
