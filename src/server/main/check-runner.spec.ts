import { MIN_IN_MS } from 'core/calculations/calculations';
import { Alarm, DeviceStatus, DexcomCalibration, DexcomSensorEntry } from 'core/models/model';
import 'mocha';
import { runChecks } from 'server/main/check-runner';
import {
  activeProfile,
  assertEqualWithoutMeta,
  createTestContext,
  withStorage,
  eraseModelUuid,
} from 'server/utils/test';
import { generateUuid } from 'core/utils/id';

describe('server/main/check-runner', () => {
  const timestampNow = 1508672249758;

  // Mock models
  const mockDexcomCalibration: DexcomCalibration = {
    modelType: 'DexcomCalibration',
    modelUuid: generateUuid(),
    timestamp: timestampNow - 20 * MIN_IN_MS,
    meterEntries: [],
    isInitialCalibration: false,
    slope: 828.3002146147081,
    intercept: 30000,
    scale: 0.9980735302684531,
  };

  const mockDexcomSensorEntry: DexcomSensorEntry = {
    modelType: 'DexcomSensorEntry',
    modelUuid: generateUuid(),
    timestamp: timestampNow - 3 * MIN_IN_MS,
    bloodGlucose: 16,
    signalStrength: 168,
    noiseLevel: 1,
  };

  const mockDeviceStatus: DeviceStatus = {
    modelType: 'DeviceStatus',
    modelUuid: generateUuid(),
    deviceName: 'dexcom-uploader',
    timestamp: timestampNow - 10 * MIN_IN_MS,
    batteryLevel: 5,
    geolocation: null,
  };

  const alarmsArrayWithHigh: Alarm[] = [
    {
      modelType: 'Alarm',
      modelUuid: generateUuid(),
      timestamp: timestampNow,
      situationType: 'HIGH',
      isActive: true,
      deactivationTimestamp: null,
      alarmStates: [
        {
          alarmLevel: 1,
          validAfterTimestamp: timestampNow,
          ackedBy: null,
          pushoverReceipts: [],
        },
      ],
    },
  ];

  const alarmsArrayWithHighAndBattery: Alarm[] = [
    {
      modelType: 'Alarm',
      modelUuid: generateUuid(),
      timestamp: timestampNow,
      situationType: 'HIGH',
      isActive: true,
      deactivationTimestamp: null,
      alarmStates: [
        {
          alarmLevel: 1,
          validAfterTimestamp: timestampNow,
          ackedBy: null,
          pushoverReceipts: [],
        },
        {
          alarmLevel: 2,
          validAfterTimestamp: timestampNow,
          ackedBy: null,
          pushoverReceipts: [],
        },
      ],
    },
    {
      modelType: 'Alarm',
      modelUuid: generateUuid(),
      timestamp: timestampNow + 15 * MIN_IN_MS,
      situationType: 'BATTERY',
      isActive: true,
      deactivationTimestamp: null,
      alarmStates: [
        {
          alarmLevel: 1,
          validAfterTimestamp: timestampNow + 15 * MIN_IN_MS,
          ackedBy: null,
          pushoverReceipts: [],
        },
      ],
    },
  ];

  withStorage(createTestStorage => {
    it('runChecks', () => {
      let timestamp = timestampNow;
      const context = createTestContext(createTestStorage(), () => timestamp);
      return Promise.resolve()
        .then(() => context.storage.saveModel(activeProfile('day', timestamp)))
        .then(() => context.storage.saveModel(mockDexcomCalibration))
        .then(() => context.storage.saveModel(mockDexcomSensorEntry))
        .then(() => runChecks(context))
        .then(alarms => assertEqualWithoutMeta(alarms.map(eraseModelUuid), alarmsArrayWithHigh.map(eraseModelUuid)))
        .then(() => context.storage.saveModel(mockDeviceStatus))
        .then(() => (timestamp += 15 * MIN_IN_MS))
        .then(() => runChecks(context))
        .then(alarms =>
          assertEqualWithoutMeta(alarms.map(eraseModelUuid), alarmsArrayWithHighAndBattery.map(eraseModelUuid)),
        );
    });
  });
});
