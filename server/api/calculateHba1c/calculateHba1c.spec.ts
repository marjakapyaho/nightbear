import 'mocha';
import { assertEqualWithoutMeta, createTestContext, createTestRequest, withStorage } from 'server/utils/test';
import { DexcomCalibration, Hba1c } from 'server/models/model';
import { uploadDexcomEntry } from '../uploadDexcomEntry/uploadDexcomEntry';
import { Request } from 'server/models/api';
import { calculateHba1cForDate } from './calculateHba1c';
import { getHba1cHistory } from '../getHba1cHistory/getHba1cHistory';

describe('api/calculateHba1c', () => {

  const request = createTestRequest();

  const mockDexcomCalibration: DexcomCalibration = {
    modelType: 'DexcomCalibration',
    timestamp: 1508672249758,
    meterEntries: [{
      modelType: 'MeterEntry',
      timestamp: 1508672249758,
      bloodGlucose: 8.0,
      measuredAt: 1508672249758,
    }],
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
      date: 1448227670000,
      noise: 1,
    },
  };

  withStorage(createTestStorage => {

    it('calculate hba1c for date', () => {
      const context = createTestContext(createTestStorage());

      const mockHba1c: Hba1c = {
        modelType: 'Hba1c',
        source: 'calculated',
        timestamp: context.timestamp(),
        hba1cValue: 6.218815331010453,
      };

      const mockResponseJson = [mockHba1c];

      return Promise.resolve()
        .then(() => context.storage.saveModel(mockDexcomCalibration))
        .then(() => uploadDexcomEntry(mockRequestBgEntry, context))
        .then(() => calculateHba1cForDate(request, context))
        .then(() => getHba1cHistory(request, context))
        .then(res => assertEqualWithoutMeta(res.responseBody as any, mockResponseJson));
    });

  });
});
