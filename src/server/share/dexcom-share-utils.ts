import { generateUuid } from 'core/utils/id';
import { changeBloodGlucoseUnitToMmoll } from 'core/calculations/calculations';
import { DexcomG6ShareEntry } from 'core/models/model';
import { DexcomShareBgResponse } from 'server/share/dexcom-share-client';

export const parseDexcomG6ShareEntryFromRequest = (val: DexcomShareBgResponse): DexcomG6ShareEntry => {
  return {
    modelType: 'DexcomG6ShareEntry',
    modelUuid: generateUuid(),
    timestamp: parseInt(val.WT.replace(/.*Date\(([0-9]+).*/, '$1'), 10), // e.g. "/Date(1587217854000)/" => 1587217854000
    bloodGlucose: changeBloodGlucoseUnitToMmoll(val.Value),
    trend: val.Trend,
  };
};
