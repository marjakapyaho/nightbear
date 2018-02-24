import 'mocha';
import { assert } from 'chai';
import { uploadDexcomEntry, parseDexcomEntry, parseDexcomStatus, initCalibration, parseCalibration } from './uploadDexcomEntry';
import { Request } from '../utils/api';
import { DeviceStatus, DexcomCalibration, DexcomSensorEntry } from '../utils/model';

describe('api/uploadDexcomEntry', () => {

  const context: any = {
    timestamp: () => 1508672249758,
  };

  // Mock requests
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
      sgv: 135,
      dateString: 'Sun Nov 22 23:27:50 EET 2015',
      type: 'sgv',
      date: 1448227670000,
      noise: 1,
    },
  };

  const mockRequestMeterEntry: Request = {
    requestId: '',
    requestMethod: '',
    requestPath: '',
    requestHeaders: {},
    requestParams: {},
    requestBody: {
      device: 'dexcom',
      type: 'mbg',
      date: 1508672249758 - 3 * 14934,
      dateString: 'Sat Feb 24 14:13:42 EET 2018',
      mbg: 153,
    },
  };

  const mockRequestCalibration: Request = {
    requestId: '',
    requestMethod: '',
    requestPath: '',
    requestHeaders: {},
    requestParams: {},
    requestBody: {
      device: 'dexcom',
      type: 'cal',
      date: 1508672249758 - 2 * 14934,
      dateString: 'Sat Feb 24 11:55:48 EET 2018',
      slope: 828.3002146147081,
      intercept: 30000,
      scale: 0.9980735302684531,
    },
  };

  const mockRequestDeviceStatus: Request = {
    requestId: '',
    requestMethod: '',
    requestPath: '',
    requestHeaders: {},
    requestParams: {},
    requestBody: {
      uploaderBattery: 80,
    },
  };

  // Mock objects
  const mockDexcomSensorEntry: DexcomSensorEntry = {
    modelType: 'DexcomSensorEntry',
    modelVersion: 1,
    timestamp: 1508672249758,
    bloodGlucose: 7.5,
    signalStrength: 168,
    noiseLevel: 1,
  };

  const mockDexcomCalibration: DexcomCalibration = {
    modelType: 'DexcomCalibration',
    modelVersion: 1,
    timestamp: 1508672249758 - 2 * 14934,
    meterEntries: [{
      bloodGlucose: 8.0,
      measuredAt: 1508672249758 - 4 * 14934,
    }],
    isInitialCalibration: false,
    slope: 828.3002146147081,
    intercept: 30000,
    scale: 0.9980735302684531,
  };

  const mockDexcomCalWithMeterEntry: DexcomCalibration = {
    modelType: 'DexcomCalibration',
    modelVersion: 1,
    timestamp: 1508672249758,
    meterEntries: [{
      bloodGlucose: 8.5,
      measuredAt: 1508672249758 - 3 * 14934,
    }],
    isInitialCalibration: false,
    slope: null,
    intercept: null,
    scale: null,
  };

  const mockDexcomCalWithMeterAndCalEntries: DexcomCalibration = {
    modelType: 'DexcomCalibration',
    modelVersion: 1,
    timestamp: 1508672249758,
    meterEntries: [{
      bloodGlucose: 8.5,
      measuredAt: 1508672249758 - 3 * 14934,
    }],
    isInitialCalibration: false,
    slope: 828.3002146147081,
    intercept: 30000,
    scale: 0.9980735302684531,
  };

  const mockDeviceStatus: DeviceStatus = {
    modelType: 'DeviceStatus',
    modelVersion: 1,
    deviceName: 'dexcom',
    timestamp: 1508672249758,
    batteryLevel: 80,
    geolocation: null,
  };

  // Assertations
  it('uploads Dexcom entry with correct response', () => {
    return uploadDexcomEntry(mockRequestBgEntry, context)
      .then(res => {
        assert.equal(
          res.responseBody,
          mockRequestBgEntry.requestBody,
        );
      });
  });

  it('produces correct DexcomSensorEntry', () => {
    assert.deepEqual(
      parseDexcomEntry(mockRequestBgEntry.requestBody as any, mockDexcomCalibration, context.timestamp()),
      mockDexcomSensorEntry,
    );
  });

  it('produces correct DexcomCalibration with new meter entry', () => {
    assert.deepEqual(
      initCalibration(mockRequestMeterEntry.requestBody as any, mockDexcomCalibration, context.timestamp()),
      mockDexcomCalWithMeterEntry,
    );
  });

  it('does not regenerate new calibration with same meter entry', () => {
    assert.deepEqual(
      initCalibration(mockRequestMeterEntry.requestBody as any, mockDexcomCalWithMeterEntry, context.timestamp()),
      null,
    );
  });

  it('adds calibration data to correct initalized calibration', () => {
    assert.deepEqual(
      parseCalibration(mockRequestCalibration.requestBody as any, mockDexcomCalWithMeterEntry),
      mockDexcomCalWithMeterAndCalEntries,
    );
  });

  it('produces correct DeviceStatus', () => {
    assert.deepEqual(
      parseDexcomStatus(mockRequestDeviceStatus.requestBody as any, context.timestamp()),
      mockDeviceStatus,
    );
  });

});
