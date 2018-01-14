import 'mocha';
import { assert } from 'chai';
import { uploadDexcomEntry, parseDexcomEntry, parseDexcomStatus } from './uploadDexcomEntry';
import { Request } from '../utils/api';
import { DeviceStatus, DexcomCalibration, DexcomSensorEntry } from '../utils/model';

describe('api/uploadDexcomEntry', () => {

  const context: any = {
    timestamp: () => 1508672249758,
  };

  const mockRequest: Request = {
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
      date: 1448227670000,
      noise: 1,
    },
  };

  const mockRequest2: Request = {
    requestId: '',
    requestMethod: '',
    requestPath: '',
    requestHeaders: {},
    requestParams: {},
    requestBody: {
      uploaderBattery: 80,
    },
  };

  const mockDexcomCalibration: DexcomCalibration = {
    modelType: 'DexcomCalibration',
    modelVersion: 1,
    timestamp: 1508672249758 - 2 * 14934,
    bloodGlucose: [ 8.0 ],
    isInitialCalibration: false,
    slope: 828.3002146147081,
    intercept: 30000,
    scale: 0.9980735302684531,
  };

  const mockDexcomSensorEntry: DexcomSensorEntry = {
    modelType: 'DexcomSensorEntry',
    modelVersion: 1,
    timestamp: 1508672249758,
    bloodGlucose: 7.5,
    signalStrength: 168,
    noiseLevel: 1,
  };

  const mockDeviceStatus: DeviceStatus = {
    modelType: 'DeviceStatus',
    modelVersion: 1,
    deviceName: 'dexcom',
    timestamp: 1508672249758,
    batteryLevel: 80,
    geolocation: null,
  };

  it('uploads Dexcom entry with correct response', () => {
    return uploadDexcomEntry(mockRequest, context)
      .then(res => {
        assert.equal(
          res.responseBody,
          mockRequest.requestBody,
        );
      });
  });

  it('produces correct DexcomSensorEntry', () => {
    assert.deepEqual(
      parseDexcomEntry(mockRequest.requestBody as any, mockDexcomCalibration, context.timestamp()),
      mockDexcomSensorEntry,
    );
  });

  it('produces correct DeviceStatus', () => {
    assert.deepEqual(
      parseDexcomStatus(mockRequest2.requestBody as any, context.timestamp()),
      mockDeviceStatus,
    );
  });

});
