import 'mocha';
import { assert } from 'chai';
import {
  runAnalysis,
  STATUS_BATTERY,
  STATUS_FALLING,
  STATUS_HIGH,
  STATUS_LOW,
  STATUS_OUTDATED,
  STATUS_PERSISTENT_HIGH,
  STATUS_RISING,
} from './analyser';
import { activeProfile } from './activeProfile';
import { MIN_IN_MS } from '../calculations/calculations';
import { Alarm, DeviceStatus, Insulin, SensorEntry } from '../model';

describe('utils/analyser', () => {

  // Mock objects
  const currentTimestamp = 1508672249758;
  const insulin: Insulin[] = [];
  const latestAlarms: Alarm[] = [];

  const deviceStatus: DeviceStatus = {
    modelType: 'DeviceStatus',
    deviceName: 'dexcom',
    timestamp: currentTimestamp,
    batteryLevel: 70,
    geolocation: null,
  };

  const entries: SensorEntry[] = [
    {
      modelType: 'DexcomSensorEntry',
      timestamp: currentTimestamp - 20 * MIN_IN_MS,
      bloodGlucose: 8.5,
      signalStrength: 1,
      noiseLevel: 1,
    },
    {
      modelType: 'DexcomSensorEntry',
      timestamp: currentTimestamp - 15 * MIN_IN_MS,
      bloodGlucose: 7,
      signalStrength: 1,
      noiseLevel: 1,
    },
    {
      modelType: 'DexcomSensorEntry',
      timestamp: currentTimestamp - 10 * MIN_IN_MS,
      bloodGlucose: 7,
      signalStrength: 1,
      noiseLevel: 1,
    },
    {
      modelType: 'DexcomSensorEntry',
      timestamp: currentTimestamp - 5 * MIN_IN_MS,
      bloodGlucose: 8,
      signalStrength: 1,
      noiseLevel: 1,
    },
  ];

  // Assertations
  it('detects no situation', () => {
    assert.deepEqual(
      runAnalysis(currentTimestamp, activeProfile, entries, insulin, deviceStatus, latestAlarms),
      {
        [STATUS_OUTDATED]: false,
        [STATUS_HIGH]: false,
        [STATUS_PERSISTENT_HIGH]: false,
        [STATUS_LOW]: false,
        [STATUS_RISING]: false,
        [STATUS_FALLING]: false,
        [STATUS_BATTERY]: false,
      },
    );
  });

});
