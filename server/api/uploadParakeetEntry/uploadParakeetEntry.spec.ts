import 'mocha';
import { assert } from 'chai';
import { uploadParakeetEntry, parseParakeetEntry, parseParakeetStatus } from './uploadParakeetEntry';
import { Request } from '../../utils/api';
import { DeviceStatus, DexcomCalibration, ParakeetSensorEntry } from '../../utils/model';

describe('api/uploadParakeetEntry', () => {

  const context: any = {
    timestamp: () => 1508672249758,
  };

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
    modelVersion: 1,
    timestamp: 1508672249758 - 2 * 14934,
    meterEntries: [{
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
    modelVersion: 1,
    timestamp: 1508672249758,
    bloodGlucose: 9.3, // was 8.7 with the old server
    measuredAtTimestamp: 1508672249758 - 14934,
    rawFiltered: 165824,
    rawUnfiltered: 168416,
  };

  const mockDeviceStatus: DeviceStatus = {
    modelType: 'DeviceStatus',
    modelVersion: 1,
    deviceName: 'parakeet',
    timestamp: 1508672249758,
    batteryLevel: 80,
    geolocation: '60.193707,24.949396',
  };

  // Assertations
  it('uploads parakeet entry with correct response', () => {
    return uploadParakeetEntry(mockRequest, context)
      .then(res => {
        assert.equal(
          res.responseBody,
          '!ACK  0!',
        );
      });
  });

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

});
