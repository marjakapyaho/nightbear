import { changeBloodGlucoseUnitToMmoll } from 'shared/utils/calculations';
import { DexcomShareResponse } from 'backend/cronjobs/dexcom/dexcomShareClient';
import { SensorEntry } from 'shared/types/timelineEntries';
import { getTimeAsISOStr } from 'shared/utils/time';

export const mapDexcomShareResponseToSensorEntry = (val: DexcomShareResponse): SensorEntry => {
  return {
    timestamp: getTimeAsISOStr(parseInt(val.WT.replace(/.*Date\(([0-9]+).*/, '$1'), 10)), // e.g. "/Date(1587217854000)/" => 1587217854000
    bloodGlucose: changeBloodGlucoseUnitToMmoll(val.Value),
    type: 'DEXCOM_G6_SHARE',
  };
};
