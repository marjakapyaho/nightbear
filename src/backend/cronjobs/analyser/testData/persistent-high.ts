import { range } from 'lodash';
import { SensorEntry } from 'shared/types/timelineEntries';
import { getISOStrMinusMinutes } from 'shared/utils/time';

export function entriesPersistentHigh(currentTimestamp: number): SensorEntry[] {
  return range(30).map((index): SensorEntry => {
    return {
      timestamp: getISOStrMinusMinutes(currentTimestamp, index * 5),
      bloodGlucose: 11,
      type: 'DEXCOM_G6_SHARE',
    };
  });
}
