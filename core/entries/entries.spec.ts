import 'mocha';
import { getMergedEntriesFeed } from './entries';
import { HOUR_IN_MS, MIN_IN_MS } from '../calculations/calculations';
import { Request } from 'core/models/api';
import { assertEqualWithoutMeta, createTestContext, withStorage } from 'server/utils/test';
import { uploadDexcomEntry } from 'server/api/uploadDexcomEntry/uploadDexcomEntry';
import { uploadParakeetEntry } from 'server/api/uploadParakeetEntry/uploadParakeetEntry';
import { DexcomCalibration } from 'core/models/model';

describe.only('core/entries', () => {
  const timestamp = 1508672249758;

  // Mock requests
  const mockRequestDexcomEntry: Request = {
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
      sgv: 135,
      dateString: 'Sun Nov 22 23:27:50 EET 2015',
      type: 'sgv',
      date: timestamp - 20 * MIN_IN_MS,
      noise: 1,
    },
  };

  const mockRequestRawDexcomEntry: Request = {
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
      sgv: 135,
      dateString: 'Sun Nov 22 23:27:50 EET 2015',
      type: 'sgv',
      date: timestamp - 15 * MIN_IN_MS,
      noise: 4,
    },
  };

  const mockRequestParakeetEntryHidden: Request = {
    requestId: '',
    requestMethod: '',
    requestPath: '',
    requestHeaders: {},
    requestBody: {},
    requestParams: {
      rr: '6577574',
      zi: '6921800',
      pc: '53478',
      lv: '168416', // unfiltered
      lf: '165824', // filtered
      db: '216',
      ts: `${17 * MIN_IN_MS}`, // time since
      bp: '80',
      bm: '4047',
      ct: '283',
      gl: '60.193707,24.949396',
    },
  };

  const mockRequestParakeetEntry: Request = {
    requestId: '',
    requestMethod: '',
    requestPath: '',
    requestHeaders: {},
    requestBody: {},
    requestParams: {
      rr: '6577574',
      zi: '6921800',
      pc: '53478',
      lv: '168416', // unfiltered
      lf: '165824', // filtered
      db: '216',
      ts: `${5 * MIN_IN_MS}`, // time since
      bp: '80',
      bm: '4047',
      ct: '283',
      gl: '60.193707,24.949396',
    },
  };

  const mockDexcomCalibration: DexcomCalibration = {
    modelType: 'DexcomCalibration',
    timestamp: timestamp - 30 * MIN_IN_MS,
    meterEntries: [{
      modelType: 'MeterEntry',
      timestamp: timestamp - 30 * MIN_IN_MS,
      bloodGlucose: 8.0,
    }],
    isInitialCalibration: false,
    slope: 828.3002146147081,
    intercept: 30000,
    scale: 0.9980735302684531,
  };

  withStorage(createTestStorage => {

    it('getMergedEntriesFeed', () => {
      let currentTime = timestamp;
      const context = createTestContext(createTestStorage(), () => currentTime);
      return Promise.resolve()
        .then(() => context.storage.saveModel(mockDexcomCalibration))
        .then(() => uploadDexcomEntry(mockRequestDexcomEntry, context))
        .then(() => uploadParakeetEntry(mockRequestParakeetEntryHidden, context))
        .then(() => uploadDexcomEntry(mockRequestRawDexcomEntry, context))
        .then(() => currentTime += 100)
        .then(() => uploadParakeetEntry(mockRequestParakeetEntry, context))
        .then(() => getMergedEntriesFeed(context, 24 * HOUR_IN_MS, timestamp))
        .then(entries => {
          assertEqualWithoutMeta(
            entries,
            [{
              bloodGlucose: 7.5,
              modelType: 'DexcomSensorEntry',
              noiseLevel: 1,
              signalStrength: 168,
              timestamp: timestamp - 20 * MIN_IN_MS,
            },
            {
              bloodGlucose: 8.6,
              modelType: 'DexcomRawSensorEntry',
              noiseLevel: 4,
              rawFiltered: 156608,
              rawUnfiltered: 158880,
              signalStrength: 168,
              timestamp: timestamp - 15 * MIN_IN_MS,
            },
            {
              bloodGlucose: 9.3,
              modelType: 'ParakeetSensorEntry',
              rawFiltered: 165824,
              rawUnfiltered: 168416,
              timestamp: timestamp - 5 * MIN_IN_MS + 100,
            }],
          );
        });
    });
  });
});
