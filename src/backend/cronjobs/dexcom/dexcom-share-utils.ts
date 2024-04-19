import { changeBloodGlucoseUnitToMmoll } from 'shared/utils/calculations';
import { DexcomShareResponse } from 'backend/cronjobs/dexcom/dexcom-share-client';
import { SensorEntry } from 'shared/types/timelineEntries';

export const mapDexcomShareResponseToSensorEntry = (val: DexcomShareResponse): SensorEntry => {
  return {
    timestamp: parseInt(val.WT.replace(/.*Date\(([0-9]+).*/, '$1'), 10), // e.g. "/Date(1587217854000)/" => 1587217854000
    bloodGlucose: changeBloodGlucoseUnitToMmoll(val.Value),
    type: 'DEXCOM_G6_SHARE',
  };
};
