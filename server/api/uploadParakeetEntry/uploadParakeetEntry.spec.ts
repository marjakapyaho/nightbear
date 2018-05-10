import 'mocha';
import { assert } from 'chai';
import { uploadParakeetEntry, parseParakeetEntry, parseParakeetStatus } from './uploadParakeetEntry';
import { Request } from '../../models/api';
import { DeviceStatus, DexcomCalibration, ParakeetSensorEntry } from '../../models/model';
import { createTestContext, withStorage } from '../../utils/test';

describe('api/uploadParakeetEntry', () => {

  const context = createTestContext();

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
    timestamp: 1508672249758 - 2 * 14934,
    meterEntries: [{
      modelType: 'MeterEntry',
      timestamp: 1508672249758,
      bloodGlucose: 8.0,
      measuredAt: 1508672249758 - 3 * 14934,
    }],
    isInitialCalibration: false,
    slope: 828.3002146147081,
    intercept: 30000,
    scale: 0.9980735302684531,
  };

  const mockParakeetSensorEntry: ParakeetSensorEntry = {
    modelType: 'ParakeetSensorEntry',
    timestamp: 1508672249758,
    bloodGlucose: 9.3, // was 8.7 with the old server
    measuredAtTimestamp: 1508672249758 - 14934,
    rawFiltered: 165824,
    rawUnfiltered: 168416,
  };

  const mockDeviceStatus: DeviceStatus = {
    modelType: 'DeviceStatus',
    deviceName: 'parakeet',
    timestamp: 1508672249758,
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
    assert.deepEqual(
      parseParakeetStatus(mockRequest.requestParams, context.timestamp()),
      mockDeviceStatus,
    );
  });

  withStorage(createTestStorage => {

    it('uploads parakeet entry with correct response', () => {
      const context = createTestContext(createTestStorage());
      const calibration: DexcomCalibration = {
        modelType: 'DexcomCalibration',
        timestamp: context.timestamp(),
        meterEntries: [],
        isInitialCalibration: false,
        slope: 880.0351223627074,
        intercept: 32412.807085821638,
        scale: 1,
      };
      return Promise.resolve()
        .then(() => context.storage.saveModel(calibration))
        .then(() => uploadParakeetEntry(mockRequest, context))
        .then(res => {
          assert.equal(
            res.responseBody,
            '!ACK  0!',
          );
        })
        .then(() => context.storage.loadLatestTimelineModels('ParakeetSensorEntry', 100))
        .then(models => {
          assert.equal(models.length, 1); // should find only one
          assert.equal(models[0].bloodGlucose, 8.6); // the BG was correctly calculated with the previous calibration
        })
        .then(() => context.storage.loadLatestTimelineModels('DeviceStatus', 100))
        .then(models => {
          assert.equal(models.length, 1); // should find only one
          assert.equal(models[0].batteryLevel, 80);
        });

    });

  });

});
