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
import { Alarm, Carbs, DeviceStatus, Insulin } from '../model';

describe('utils/analyser', () => {

  // Mock objects
  const currentTimestamp = 1508672249758;
  const insulin: Insulin[] = [];
  const carbs: Carbs[] = [];
  const latestAlarms: Alarm[] = [];

  const deviceStatus: DeviceStatus = {
    modelType: 'DeviceStatus',
    deviceName: 'dexcom',
    timestamp: currentTimestamp,
    batteryLevel: 70,
    geolocation: null,
  };

  const entries = [
    { timestamp: currentTimestamp - 10 * MIN_IN_MS, bloodGlucose: 7, slope: 1 },
    { timestamp: currentTimestamp - 5 * MIN_IN_MS, bloodGlucose: 7, slope: 1 },
  ];

  // Assertations
  it('detects no situation', () => {
    assert.deepEqual(
      runAnalysis(currentTimestamp, activeProfile, entries, insulin, carbs, deviceStatus, latestAlarms),
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
