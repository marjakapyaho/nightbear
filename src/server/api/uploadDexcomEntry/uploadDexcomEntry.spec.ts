import { assert } from 'chai';
import { MIN_IN_MS } from 'core/calculations/calculations';
import { Request } from 'core/models/api';
import {
  DeviceStatus,
  DexcomCalibration,
  DexcomRawSensorEntry,
  DexcomSensorEntry,
  MeterEntry,
} from 'core/models/model';
import { first } from 'lodash';
import 'mocha';
import { parseDexcomEntry, parseDexcomStatus, uploadDexcomEntry } from 'server/api/uploadDexcomEntry/uploadDexcomEntry';
import { assertEqualWithoutMeta, createTestContext, saveAndAssociate, withStorage } from 'server/utils/test';

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
      date: timestampNow - 10 * MIN_IN_MS,
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
      date: timestampNow - 9 * MIN_IN_MS,
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

  const mockDexcomRawSensorEntry: DexcomRawSensorEntry = {
    bloodGlucose: 8.6,
    modelType: 'DexcomRawSensorEntry',
    noiseLevel: 1,
    rawFiltered: 156608,
    rawUnfiltered: 158880,
    signalStrength: 168,
    timestamp: 1508672249758,
  };

  const mockDexcomCalibration: DexcomCalibration = {
    modelType: 'DexcomCalibration',
    timestamp: timestampNow - 3 * MIN_IN_MS,
    meterEntries: [],
    isInitialCalibration: false,
    slope: 828.3002146147081,
    intercept: 30000,
    scale: 0.9980735302684531,
  };

  const mockDexcomCalWithMeterAndCalEntries: DexcomCalibration = {
    modelType: 'DexcomCalibration',
    timestamp: timestampNow - 9 * MIN_IN_MS,
    meterEntries: [],
    isInitialCalibration: false,
    slope: 828.3002146147081,
    intercept: 30000,
    scale: 0.9980735302684531,
  };

  const mockDeviceStatus: DeviceStatus = {
    modelType: 'DeviceStatus',
    deviceName: 'dexcom-uploader',
    timestamp: timestampNow,
    batteryLevel: 80,
    geolocation: null,
  };

  // Assertions
  withStorage(createTestStorage => {
    it('uploads Dexcom sensor entry with correct response', () => {
      const context = createTestContext(createTestStorage());
      return Promise.resolve()
        .then(() =>
          saveAndAssociate(context, mockDexcomCalibration, {
            modelType: 'MeterEntry',
            timestamp: timestampNow - 3 * MIN_IN_MS,
            source: 'dexcom',
            bloodGlucose: 8.0,
          }),
        )
        .then(() => uploadDexcomEntry(mockRequestBgEntry, context))
        .then(res => assert.equal(res.responseBody, mockRequestBgEntry.requestBody))
        .then(() => context.storage.loadLatestTimelineModels('DexcomSensorEntry', 100))
        .then(models => assertEqualWithoutMeta(models, [mockDexcomSensorEntry]));
    });

    it('uploads Dexcom meter entry and calibration with correct responses', () => {
      const context = createTestContext(createTestStorage());
      let savedEntry: MeterEntry | undefined;
      return Promise.resolve()
        .then(() => uploadDexcomEntry(mockRequestMeterEntry, context))
        .then(res => assert.equal(res.responseBody, mockRequestMeterEntry.requestBody))
        .then(() => context.storage.loadLatestTimelineModels('MeterEntry', 100))
        .then(models => (savedEntry = first(models)))
        .then(model =>
          assertEqualWithoutMeta(model, {
            modelType: 'MeterEntry',
            timestamp: timestampNow - 10 * MIN_IN_MS,
            source: 'dexcom',
            bloodGlucose: 8.5,
          }),
        )
        .then(() => uploadDexcomEntry(mockRequestCalibration, context))
        .then(res => assert.equal(res.responseBody, mockRequestCalibration.requestBody))
        .then(() => context.storage.loadLatestTimelineModels('DexcomCalibration', 100))
        .then(models =>
          assertEqualWithoutMeta(models, [
            {
              ...mockDexcomCalWithMeterAndCalEntries,
              meterEntries: [
                {
                  modelType: 'MeterEntry',
                  modelRef: savedEntry ? (savedEntry as any).modelMeta._id : null, // the calibration contains a link to the correct MeterEntry!
                },
              ],
            },
          ]),
        );
    });

    it('uploads Dexcom device status with correct response', () => {
      const context = createTestContext(createTestStorage());
      return Promise.resolve()
        .then(() => uploadDexcomEntry(mockRequestDeviceStatus, context))
        .then(res => {
          assert.equal(res.responseBody, mockRequestDeviceStatus.requestBody);
        })
        .then(() => context.storage.loadLatestTimelineModels('DeviceStatus', 100))
        .then(models => assertEqualWithoutMeta(models, [mockDeviceStatus]));
    });

    it("doesn't generate the same DexcomCalibration again", () => {
      const context = createTestContext(createTestStorage());
      return (
        Promise.resolve()
          // We need a MeterEntry in the DB, otherwise there's nothing to link the DexcomCalibration to:
          .then(() => uploadDexcomEntry(mockRequestMeterEntry, context))
          // Upload the calibration for the first time:
          .then(() => uploadDexcomEntry(mockRequestCalibration, context))
          .then(() => context.storage.loadLatestTimelineModels('DexcomCalibration', 100))
          .then(models => assert.equal(models.length, 1))
          // Upload the calibration for the second time:
          .then(() => uploadDexcomEntry(mockRequestCalibration, context))
          .then(() => context.storage.loadLatestTimelineModels('DexcomCalibration', 100))
          .then(models => assert.equal(models.length, 1)) // still just one!
      );
    });
  });

  it('produces correct DexcomSensorEntry', () => {
    assert.deepEqual(parseDexcomEntry(mockRequestBgEntry.requestBody as any, mockDexcomCalibration), [
      mockDexcomRawSensorEntry,
      mockDexcomSensorEntry,
    ]);
  });

  it('produces correct DeviceStatus', () => {
    const context = createTestContext();
    assert.deepEqual(
      parseDexcomStatus(mockRequestDeviceStatus.requestBody as any, context.timestamp()),
      mockDeviceStatus,
    );
  });
});
