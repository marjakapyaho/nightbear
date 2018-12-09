import 'mocha';
import { assert } from 'chai';
import { Request } from 'core/models/api';
import { DeviceStatus, DexcomCalibration, ParakeetSensorEntry } from 'core/models/model';
import { createTestContext, withStorage, assertEqualWithoutMeta } from 'server/utils/test';
import { MIN_IN_MS } from 'core/calculations/calculations';
import {
  parseParakeetEntry,
  parseParakeetStatus,
  uploadParakeetEntry,
} from 'server/api/uploadParakeetEntry/uploadParakeetEntry';

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
  const mockDexcomCalibration: DexcomCalibration = {
    modelType: 'DexcomCalibration',
    timestamp: timestampNow - 2 * MIN_IN_MS,
    meterEntries: [
      {
        modelType: 'MeterEntry',
        timestamp: timestampNow - 2 * MIN_IN_MS,
        bloodGlucose: 8.0,
      },
    ],
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

  it('produces correct ParakeetSensorEntry', () => {
    assert.deepEqual(
      parseParakeetEntry(mockRequest.requestParams, mockDexcomCalibration, context.timestamp()),
      mockParakeetSensorEntry,
    );
  });

  it('produces correct DeviceStatus', () => {
    assert.deepEqual(parseParakeetStatus(mockRequest.requestParams, context.timestamp()), mockDeviceStatus);
  });

  withStorage(createTestStorage => {
    it('uploads parakeet entry with correct response', () => {
      const context = createTestContext(createTestStorage());
      return Promise.resolve()
        .then(() => context.storage.saveModel(mockDexcomCalibration))
        .then(() => uploadParakeetEntry(mockRequest, context))
        .then(res => {
          assert.equal(res.responseBody, '!ACK  0!');
        })
        .then(() => context.storage.loadLatestTimelineModels('ParakeetSensorEntry', 100))
        .then(models => assertEqualWithoutMeta(models, [mockParakeetSensorEntry]))
        .then(() => context.storage.loadLatestTimelineModels('DeviceStatus', 100))
        .then(models => assertEqualWithoutMeta(models, [mockDeviceStatus]));
    });
  });
});
