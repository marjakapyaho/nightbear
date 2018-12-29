import { assert } from 'chai';
import { MIN_IN_MS } from 'core/calculations/calculations';
import { Request } from 'core/models/api';
import { DeviceStatus, DexcomCalibration, MeterEntry, ParakeetSensorEntry } from 'core/models/model';
import { sortBy } from 'lodash';
import 'mocha';
import {
  parseParakeetEntry,
  parseParakeetStatus,
  uploadParakeetEntry,
} from 'server/api/uploadParakeetEntry/uploadParakeetEntry';
import { assertEqualWithoutMeta, createTestContext, saveAndAssociate, withStorage } from 'server/utils/test';

describe('api/uploadParakeetEntry', () => {
  const context = createTestContext();
  const timestampNow = context.timestamp();

  // Mock requests
  const mockRequest: Request = {
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
      ts: '14934', // time since
      bp: '80',
      bm: '4047',
      ct: '283',
      gl: '60.193707,24.949396',
    },
  };

  // Mock objects
  const mockDexcomEntry: MeterEntry = {
    modelType: 'MeterEntry',
    timestamp: timestampNow - 2 * MIN_IN_MS,
    source: 'dexcom',
    bloodGlucose: 8.0,
  };

  const mockDexcomCalibration: DexcomCalibration = {
    modelType: 'DexcomCalibration',
    timestamp: timestampNow - 2 * MIN_IN_MS,
    meterEntries: [],
    isInitialCalibration: false,
    slope: 828.3002146147081,
    intercept: 30000,
    scale: 0.9980735302684531,
  };

  const mockParakeetSensorEntry: ParakeetSensorEntry = {
    modelType: 'ParakeetSensorEntry',
    timestamp: timestampNow - 14934, // requestParam ts (time since)
    bloodGlucose: 9.3, // was 8.7 with the old server
    rawFiltered: 165824,
    rawUnfiltered: 168416,
  };

  const mockDeviceStatus: DeviceStatus = {
    modelType: 'DeviceStatus',
    deviceName: 'parakeet',
    timestamp: timestampNow,
    batteryLevel: 80,
    geolocation: '60.193707,24.949396',
  };

  const mockDeviceStatusTransmitter: DeviceStatus = {
    modelType: 'DeviceStatus',
    deviceName: 'dexcom-transmitter',
    timestamp: timestampNow,
    batteryLevel: 216,
    geolocation: null,
  };

  it('produces correct ParakeetSensorEntry', () => {
    assert.deepEqual(
      parseParakeetEntry(mockRequest.requestParams, mockDexcomCalibration, context.timestamp()),
      mockParakeetSensorEntry,
    );
  });

  it('produces correct DeviceStatus', () => {
    assert.deepEqual(parseParakeetStatus(mockRequest.requestParams, context.timestamp()), [
      mockDeviceStatus,
      mockDeviceStatusTransmitter,
    ]);
  });

  withStorage(createTestStorage => {
    it('uploads parakeet entry with correct response', () => {
      const context = createTestContext(createTestStorage());
      return Promise.resolve()
        .then(() => saveAndAssociate(context, mockDexcomCalibration, mockDexcomEntry))
        .then(() => uploadParakeetEntry(mockRequest, context))
        .then(res => {
          assert.equal(res.responseBody, '!ACK  0!');
        })
        .then(() => context.storage.loadLatestTimelineModels('ParakeetSensorEntry', 100))
        .then(models => assertEqualWithoutMeta(models, [mockParakeetSensorEntry]))
        .then(() => context.storage.loadLatestTimelineModels('DeviceStatus', 100))
        .then(models =>
          assertEqualWithoutMeta(sortBy(models, 'deviceName'), [mockDeviceStatusTransmitter, mockDeviceStatus]),
        );
    });
  });
});
