import 'mocha';
import { assert } from 'chai';
import { uploadDexcomEntry, parseDexcomEntry, parseDexcomStatus, initCalibration, amendCalibration } from './uploadDexcomEntry';
import { Request } from 'core/models/api';
import { DeviceStatus, DexcomCalibration, DexcomSensorEntry } from 'core/models/model';
import { assertEqualWithoutMeta, createTestContext, withStorage } from 'server/utils/test';
import { MIN_IN_MS } from 'core/calculations/calculations';

describe('api/uploadDexcomEntry', () => {

  const timestampNow = 1508672249758;

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
      date: timestampNow,
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
      date: timestampNow - 2 * MIN_IN_MS,
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
      date: timestampNow - MIN_IN_MS,
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
    timestamp: timestampNow,
    bloodGlucose: 7.5,
    signalStrength: 168,
    noiseLevel: 1,
  };

  const mockDexcomCalibration: DexcomCalibration = {
    modelType: 'DexcomCalibration',
    timestamp: timestampNow - 3 * MIN_IN_MS,
    meterEntries: [{
      modelType: 'MeterEntry',
      timestamp: timestampNow - 3 * MIN_IN_MS,
      bloodGlucose: 8.0,
    }],
    isInitialCalibration: false,
    slope: 828.3002146147081,
    intercept: 30000,
    scale: 0.9980735302684531,
  };

  const mockDexcomCalWithJustCalibration: DexcomCalibration = {
    modelType: 'DexcomCalibration',
    timestamp: timestampNow - MIN_IN_MS,
    meterEntries: [],
    isInitialCalibration: false,
    slope: 828.3002146147081,
    intercept: 30000,
    scale: 0.9980735302684531,
  };

  const mockDexcomCalWithMeterAndCalEntries: DexcomCalibration = {
    modelType: 'DexcomCalibration',
    timestamp: timestampNow - MIN_IN_MS,
    meterEntries: [{
      modelType: 'MeterEntry',
      timestamp: timestampNow - 2 * MIN_IN_MS,
      bloodGlucose: 8.5,
    }],
    isInitialCalibration: false,
    slope: 828.3002146147081,
    intercept: 30000,
    scale: 0.9980735302684531,
  };

  const mockDeviceStatus: DeviceStatus = {
    modelType: 'DeviceStatus',
    deviceName: 'dexcom',
    timestamp: timestampNow,
    batteryLevel: 80,
    geolocation: null,
  };

  // Assertations
  withStorage(createTestStorage => {

    it('uploads Dexcom sensor entry with correct response', () => {
      const context = createTestContext(createTestStorage());
      return Promise.resolve()
        .then(() => context.storage.saveModel(mockDexcomCalibration))
        .then(() => uploadDexcomEntry(mockRequestBgEntry, context))
        .then(res => {
          assert.equal(
            res.responseBody,
            mockRequestBgEntry.requestBody,
          );
        })
        .then(() => context.storage.loadLatestTimelineModels('DexcomSensorEntry', 100))
        .then(models => assertEqualWithoutMeta(models, [mockDexcomSensorEntry]));
    });

    it('uploads Dexcom meter entry and calibration with correct responses', () => {
      const context = createTestContext(createTestStorage());
      return Promise.resolve()
        .then(() => uploadDexcomEntry(mockRequestCalibration, context))
        .then(res => {
          assert.equal(
            res.responseBody,
            mockRequestCalibration.requestBody,
          );
        })
        .then(() => context.storage.loadLatestTimelineModels('DexcomCalibration', 100))
        .then(models => assertEqualWithoutMeta(models, [mockDexcomCalWithJustCalibration]))
        .then(() => uploadDexcomEntry(mockRequestMeterEntry, context))
        .then(res => {
          assert.equal(
            res.responseBody,
            mockRequestMeterEntry.requestBody,
          );
        })
        .then(() => context.storage.loadLatestTimelineModels('DexcomCalibration', 100))
        .then(models => assertEqualWithoutMeta(models, [mockDexcomCalWithMeterAndCalEntries]));
    });

    it('uploads Dexcom device status with correct response', () => {
      const context = createTestContext(createTestStorage());
      return Promise.resolve()
        .then(() => uploadDexcomEntry(mockRequestDeviceStatus, context))
        .then(res => {
          assert.equal(
            res.responseBody,
            mockRequestDeviceStatus.requestBody,
          );
        })
        .then(() => context.storage.loadLatestTimelineModels('DeviceStatus', 100))
        .then(models => assertEqualWithoutMeta(models, [mockDeviceStatus]));
    });

  });

  it('produces correct DexcomSensorEntry', () => {
    assert.deepEqual(
      parseDexcomEntry(mockRequestBgEntry.requestBody as any, mockDexcomCalibration),
      mockDexcomSensorEntry,
    );
  });

  it('produces correct DexcomCalibration with cal entry', () => {
    assert.deepEqual(
      initCalibration(mockRequestCalibration.requestBody as any, mockDexcomCalibration),
      mockDexcomCalWithJustCalibration,
    );
  });

  it('does not regenerate new calibration with same cal entry', () => {
    assert.deepEqual(
      initCalibration(mockRequestCalibration.requestBody as any, mockDexcomCalWithJustCalibration),
      null,
    );
  });

  it('adds meter entry to correct initalized calibration', () => {
    assert.deepEqual(
      amendCalibration(mockRequestMeterEntry.requestBody as any, mockDexcomCalWithJustCalibration),
      mockDexcomCalWithMeterAndCalEntries,
    );
  });

  it('produces correct DeviceStatus', () => {
    const context = createTestContext();
    assert.deepEqual(
      parseDexcomStatus(mockRequestDeviceStatus.requestBody as any, context.timestamp()),
      mockDeviceStatus,
    );
  });

});
