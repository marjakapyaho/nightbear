import { HOUR_IN_MS, MIN_IN_MS } from 'shared/calculations/calculations';
import { getMergedEntriesFeed } from 'shared/entries/entries';
import { Request } from 'shared/models/api';
import 'mocha';
import { uploadDexcomEntry } from 'backend/api/uploadDexcomEntry/uploadDexcomEntry';
import { uploadParakeetEntry } from 'backend/api/uploadParakeetEntry/uploadParakeetEntry';
import {
  assertEqualWithoutMeta,
  createTestContext,
  saveAndAssociate,
  withStorage,
  eraseModelUuid,
  ERASED_UUID,
} from 'backend/utils/test';
import { generateUuid } from 'shared/utils/id';
import { parseDexcomG6ShareEntryFromRequest } from 'backend/share/dexcom-share-utils';
import { DexcomShareBgResponse } from 'backend/share/dexcom-share-client';

describe('shared/entries', () => {
  const timestamp = 1508672249758;

  // Mock requests (and mock share entry)
  const mockG6ShareEntry: DexcomShareBgResponse = {
    DT: '/Date(1426780716000-0700)/',
    ST: '/Date(1426784306000)/',
    Trend: 4,
    Value: 99,
    WT: `/Date(${timestamp - 40 * MIN_IN_MS})/`,
  };

  const mockRequestG6SensorEntry: Request = {
    requestId: '',
    requestMethod: '',
    requestPath: '',
    requestHeaders: {},
    requestParams: {},
    requestBody: {
      device: 'xDrip-DexcomG5 G5 Native',
      date: timestamp - 35 * MIN_IN_MS,
      dateString: '2020-03-30T02:15:00.821+0300',
      sgv: 126,
      direction: 'FortyFiveDown',
    },
  };

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

  withStorage(createTestStorage => {
    it('getMergedEntriesFeed', () => {
      let currentTime = timestamp;
      const context = createTestContext(createTestStorage(), () => currentTime);
      return Promise.resolve()
        .then(() =>
          saveAndAssociate(
            context,
            {
              modelType: 'DexcomCalibration',
              modelUuid: generateUuid(),
              timestamp: timestamp - 30 * MIN_IN_MS,
              meterEntries: [],
              isInitialCalibration: false,
              slope: 828.3002146147081,
              intercept: 30000,
              scale: 0.9980735302684531,
            },
            {
              modelType: 'MeterEntry',
              modelUuid: generateUuid(),
              timestamp: timestamp - 30 * MIN_IN_MS,
              source: 'dexcom',
              bloodGlucose: 8.0,
            },
          ),
        )
        .then(() => context.storage.saveModel(parseDexcomG6ShareEntryFromRequest(mockG6ShareEntry)))
        .then(() => uploadDexcomEntry(mockRequestG6SensorEntry, context))
        .then(() => uploadDexcomEntry(mockRequestDexcomEntry, context))
        .then(() => uploadParakeetEntry(mockRequestParakeetEntryHidden, context))
        .then(() => uploadDexcomEntry(mockRequestRawDexcomEntry, context))
        .then(() => (currentTime += 100))
        .then(() => uploadParakeetEntry(mockRequestParakeetEntry, context))
        .then(() => getMergedEntriesFeed(context, 24 * HOUR_IN_MS, timestamp))
        .then(entries => {
          assertEqualWithoutMeta(entries.map(eraseModelUuid), [
            {
              modelType: 'DexcomG6ShareEntry',
              modelUuid: ERASED_UUID,
              timestamp: timestamp - 40 * MIN_IN_MS,
              bloodGlucose: 5.5,
              trend: 4,
            },
            {
              modelType: 'DexcomG6SensorEntry',
              modelUuid: ERASED_UUID,
              timestamp: timestamp - 35 * MIN_IN_MS,
              bloodGlucose: 7,
              direction: 'FortyFiveDown',
            },
            {
              modelType: 'MeterEntry',
              modelUuid: ERASED_UUID,
              timestamp: timestamp - 30 * MIN_IN_MS,
              source: 'dexcom',
              bloodGlucose: 8.0,
            },
            {
              bloodGlucose: 7.5,
              modelType: 'DexcomSensorEntry',
              modelUuid: ERASED_UUID,
              noiseLevel: 1,
              signalStrength: 168,
              timestamp: timestamp - 20 * MIN_IN_MS,
            },
            {
              bloodGlucose: 8.6,
              modelType: 'DexcomRawSensorEntry',
              modelUuid: ERASED_UUID,
              noiseLevel: 4,
              rawFiltered: 156608,
              rawUnfiltered: 158880,
              signalStrength: 168,
              timestamp: timestamp - 15 * MIN_IN_MS,
            },
            {
              bloodGlucose: 9.3,
              modelType: 'ParakeetSensorEntry',
              modelUuid: ERASED_UUID,
              rawFiltered: 165824,
              rawUnfiltered: 168416,
              timestamp: timestamp - 5 * MIN_IN_MS + 100,
            },
          ]);
        });
    });
  });
});
