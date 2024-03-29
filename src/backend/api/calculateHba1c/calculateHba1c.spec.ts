import { Request } from 'shared/models/api';
import { DexcomCalibration, Hba1c, MeterEntry } from 'shared/models/model';
import 'mocha';
import { calculateHba1cForDate } from 'backend/api/calculateHba1c/calculateHba1c';
import { getHba1cHistory } from 'backend/api/getHba1cHistory/getHba1cHistory';
import { uploadDexcomEntry } from 'backend/api/uploadDexcomEntry/uploadDexcomEntry';
import {
  assertEqualWithoutMeta,
  createTestContext,
  createTestRequest,
  saveAndAssociate,
  withStorage,
  ERASED_UUID,
  eraseModelUuid,
} from 'backend/utils/test';
import { generateUuid } from 'shared/utils/id';

describe('api/calculateHba1c', () => {
  const request = createTestRequest();

  const mockDexcomMeterEntry: MeterEntry = {
    modelType: 'MeterEntry',
    modelUuid: generateUuid(),
    timestamp: 1508672249758 - 3 * 14934,
    source: 'dexcom',
    bloodGlucose: 8.0,
  };
  const mockDexcomCalibration: DexcomCalibration = {
    modelType: 'DexcomCalibration',
    modelUuid: generateUuid(),
    timestamp: 1508672249758 - 3 * 14934,
    meterEntries: [],
    isInitialCalibration: false,
    slope: 828.3002146147081,
    intercept: 30000,
    scale: 0.9980735302684531,
  };

  const mockRequestBgEntry: Request = {
    requestId: '',
    requestMethod: '',
    requestPath: '',
    requestHeaders: {},
    requestParams: {},
    requestBody: {
      unfiltered: 158880,
      filtered: 156608,
      direction: 'Flat',
      device: 'dexcom',
      rssi: 168,
      sgv: 150, // 8.3 mmol/l
      dateString: 'Sun Nov 22 23:27:50 EET 2015',
      type: 'sgv',
      date: 1508672249758 - 2 * 14934,
      noise: 1,
    },
  };

  withStorage(createTestStorage => {
    it('calculate hba1c for date', () => {
      const context = createTestContext(createTestStorage());

      const mockHba1c: Hba1c = {
        modelType: 'Hba1c',
        modelUuid: ERASED_UUID,
        source: 'calculated',
        timestamp: 1508672249758,
        hba1cValue: 6.044599303135889,
      };

      const mockResponseJson = [mockHba1c];

      return Promise.resolve()
        .then(() => saveAndAssociate(context, mockDexcomCalibration, mockDexcomMeterEntry))
        .then(() => uploadDexcomEntry(mockRequestBgEntry, context))
        .then(() => calculateHba1cForDate(request, context))
        .then(() => getHba1cHistory(request, context))
        .then(res => assertEqualWithoutMeta((res.responseBody as any).map(eraseModelUuid), mockResponseJson));
    });
  });
});
