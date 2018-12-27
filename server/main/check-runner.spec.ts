import { MIN_IN_MS } from 'core/calculations/calculations';
import { Alarm, DeviceStatus, DexcomCalibration, DexcomSensorEntry } from 'core/models/model';
import 'mocha';
import { runChecks } from 'server/main/check-runner';
import { activeSettings, assertEqualWithoutMeta, createTestContext, withStorage } from 'server/utils/test';

describe('server/main/check-runner', () => {
  const timestampNow = 1508672249758;

  // Mock models
  const mockDexcomCalibration: DexcomCalibration = {
    modelType: 'DexcomCalibration',
    timestamp: timestampNow - 20 * MIN_IN_MS,
    meterEntries: [],
    isInitialCalibration: false,
    slope: 828.3002146147081,
    intercept: 30000,
    scale: 0.9980735302684531,
  };

  const mockDexcomSensorEntry: DexcomSensorEntry = {
    modelType: 'DexcomSensorEntry',
    timestamp: timestampNow - 3 * MIN_IN_MS,
    bloodGlucose: 16,
    signalStrength: 168,
    noiseLevel: 1,
  };

  const mockDeviceStatus: DeviceStatus = {
    modelType: 'DeviceStatus',
    deviceName: 'dexcom-uploader',
    timestamp: timestampNow - 10 * MIN_IN_MS,
    batteryLevel: 5,
    geolocation: null,
  };

  const alarmsArrayWithHigh: Alarm[] = [
    {
      modelType: 'Alarm',
      alarmLevel: 1,
      isActive: true,
      pushoverReceipts: [],
      situationType: 'HIGH',
      timestamp: timestampNow,
      validAfterTimestamp: timestampNow,
    },
  ];

  const alarmsArrayWithHighAndBattery: Alarm[] = [
    {
      modelType: 'Alarm',
      alarmLevel: 2,
      isActive: true,
      pushoverReceipts: [],
      situationType: 'HIGH',
      timestamp: timestampNow,
      validAfterTimestamp: timestampNow,
    },
    {
      modelType: 'Alarm',
      alarmLevel: 1,
      isActive: true,
      pushoverReceipts: [],
      situationType: 'BATTERY',
      timestamp: timestampNow + 15 * MIN_IN_MS,
      validAfterTimestamp: timestampNow + 15 * MIN_IN_MS,
    },
  ];

  withStorage(createTestStorage => {
    it('runChecks', () => {
      let timestamp = timestampNow;
      const context = createTestContext(createTestStorage(), () => timestamp);
      return Promise.resolve()
        .then(() => context.storage.saveModel(activeSettings('day')))
        .then(() => context.storage.saveModel(mockDexcomCalibration))
        .then(() => context.storage.saveModel(mockDexcomSensorEntry))
        .then(() => runChecks(context))
        .then(alarms => assertEqualWithoutMeta(alarms, alarmsArrayWithHigh))
        .then(() => context.storage.saveModel(mockDeviceStatus))
        .then(() => (timestamp += 15 * MIN_IN_MS))
        .then(() => runChecks(context))
        .then(alarms => assertEqualWithoutMeta(alarms, alarmsArrayWithHighAndBattery));
    });
  });
});
