import { SensorEntry } from 'shared/types/timelineEntries';
import { getISOStrMinusMinutes } from 'shared/utils/time';

export function entriesCompressionLow(currentTimestamp: number): SensorEntry[] {
  return [
    {
      timestamp: getISOStrMinusMinutes(currentTimestamp, 30),
      bloodGlucose: 10,
      type: 'DEXCOM_G6_SHARE',
    },
    {
      timestamp: getISOStrMinusMinutes(currentTimestamp, 25),
      bloodGlucose: 10.4,
      type: 'DEXCOM_G6_SHARE',
    },
    {
      timestamp: getISOStrMinusMinutes(currentTimestamp, 20),
      bloodGlucose: 9.9,
      type: 'DEXCOM_G6_SHARE',
    },
    {
      timestamp: getISOStrMinusMinutes(currentTimestamp, 15),
      bloodGlucose: 7,
      type: 'DEXCOM_G6_SHARE',
    },
    {
      timestamp: getISOStrMinusMinutes(currentTimestamp, 10),
      bloodGlucose: 3.8,
      type: 'DEXCOM_G6_SHARE',
    },
  ];
}
