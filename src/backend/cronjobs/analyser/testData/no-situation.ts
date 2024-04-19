import { SensorEntry } from 'shared/types/timelineEntries';
import { getISOStrMinusMinutes } from 'shared/utils/time';

export function entriesNoSituation(currentTimestamp: number): SensorEntry[] {
  return [
    {
      timestamp: getISOStrMinusMinutes(currentTimestamp, 20),
      bloodGlucose: 8.5,
      type: 'DEXCOM_G6_SHARE',
    },
    {
      timestamp: getISOStrMinusMinutes(currentTimestamp, 15),
      bloodGlucose: 7,
      type: 'DEXCOM_G6_SHARE',
    },
    {
      timestamp: getISOStrMinusMinutes(currentTimestamp, 10),
      bloodGlucose: 7,
      type: 'DEXCOM_G6_SHARE',
    },
    {
      timestamp: getISOStrMinusMinutes(currentTimestamp, 5),
      bloodGlucose: 8,
      type: 'DEXCOM_G6_SHARE',
    },
  ];
}
