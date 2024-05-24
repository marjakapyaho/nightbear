import { changeBloodGlucoseUnitToMmoll } from '../../shared';
import { DexcomShareResponse } from './dexcomShareClient';
import { SensorEntry } from '../../shared';
import { getTimeAsISOStr } from '../../shared';

export const mapDexcomShareResponseToSensorEntry = (val: DexcomShareResponse): SensorEntry => {
  return {
    timestamp: getTimeAsISOStr(parseInt(val.WT.replace(/.*Date\(([0-9]+).*/, '$1'), 10)), // e.g. "/Date(1587217854000)/" => 1587217854000
    bloodGlucose: changeBloodGlucoseUnitToMmoll(val.Value),
    type: 'DEXCOM_G6_SHARE',
  };
};
