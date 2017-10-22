import 'mocha';
import { assert } from 'chai';
import { uploadParakeetEntry, parseParakeetEntry, parseParakeetStatus } from './uploadParakeetEntry';
import { Request } from '../utils/api';
import { DeviceStatus, ParakeetSensorEntry } from '../utils/model';

describe('api/uploadParakeetEntry', () => {

  const context: any = {
    timestamp: () => 1508672249758,
  };

  const mockRequest: Request = {
    requestId: '',
    requestMethod: '',
    requestPath: '',
    requestHeaders: {},
    requestBody: {},
    requestParams: {
      rr: '2867847',
      zi: '6921800',
      pc: '53478',
      lv: '89472', // unfiltered
      lf: '102912', // filtered
      db: '216',
      ts: '14909', // time since
      bp: '72',
      bm: '3981',
      ct: '279',
      gl: '60.193707,24.949396',
    },
  };

  const mockParakeetSensorEntry: ParakeetSensorEntry = {
    modelType: 'ParakeetSensorEntry',
    modelVersion: 1,
    timestamp: 1508672249758,
    bloodGlucose: 4,
    measuredAtTimestamp: 1508672249758 - 14909,
    rawFiltered: 102912,
    rawUnfiltered: 89472,
  };

  const mockDeviceStatus: DeviceStatus = {
    modelType: 'DeviceStatus',
    modelVersion: 1,
    deviceName: 'parakeet',
    timestamp: 1508672249758,
    batteryLevel: 72,
    geolocation: '60.193707,24.949396',
  };

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
      parseParakeetEntry(mockRequest.requestParams, context.timestamp()),
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
