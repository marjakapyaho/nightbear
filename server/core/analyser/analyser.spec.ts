import 'mocha';
import { assert } from 'chai';
import {
  runAnalysis,
  STATUS_BATTERY,
  STATUS_OUTDATED,
  STATUS_LOW,
  STATUS_FALLING,
  STATUS_COMPRESSION_LOW,
  STATUS_HIGH,
  STATUS_RISING,
  STATUS_PERSISTENT_HIGH,
} from './analyser';
import { activeProfile } from './test-data/active-profile';
import { Alarm, DeviceStatus, Insulin } from '../../models/model';
import { entriesLow } from './test-data/low';
import { entriesNoSituation } from './test-data/no-situation';
import { entriesHigh } from './test-data/high';
import { entriesFalling } from './test-data/falling';
import { entriesRising } from './test-data/rising';
import { entriesPersistentHigh } from './test-data/persistent-high';
import { entriesCompressionLow } from './test-data/compression-low';
import { entriesOutdated } from './test-data/outdated';

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

  // Assertations
  it('detects no situation', () => {
    assert.deepEqual(
      runAnalysis(
        currentTimestamp,
        activeProfile('day'),
        entriesNoSituation(currentTimestamp),
        insulin,
        deviceStatus,
        latestAlarms,
      ),
      {
        [STATUS_BATTERY]: false,
        [STATUS_OUTDATED]: false,
        [STATUS_LOW]: false,
        [STATUS_FALLING]: false,
        [STATUS_COMPRESSION_LOW]: false,
        [STATUS_HIGH]: false,
        [STATUS_RISING]: false,
        [STATUS_PERSISTENT_HIGH]: false,
      },
    );
  });

  it('detects battery', () => {
    const deviceStatusBattery: DeviceStatus = {
      modelType: 'DeviceStatus',
      deviceName: 'dexcom',
      timestamp: currentTimestamp,
      batteryLevel: 10,
      geolocation: null,
    };

    assert.deepEqual(
      runAnalysis(
        currentTimestamp,
        activeProfile('day'),
        entriesNoSituation(currentTimestamp),
        insulin,
        deviceStatusBattery,
        latestAlarms,
      ),
      {
        [STATUS_BATTERY]: true,
        [STATUS_OUTDATED]: false,
        [STATUS_LOW]: false,
        [STATUS_FALLING]: false,
        [STATUS_COMPRESSION_LOW]: false,
        [STATUS_HIGH]: false,
        [STATUS_RISING]: false,
        [STATUS_PERSISTENT_HIGH]: false,
      },
    );
  });

  it('detects outdated', () => {
    assert.deepEqual(
      runAnalysis(
        currentTimestamp,
        activeProfile('day'),
        entriesOutdated(currentTimestamp),
        insulin,
        deviceStatus,
        latestAlarms,
      ),
      {
        [STATUS_BATTERY]: false,
        [STATUS_OUTDATED]: true,
        [STATUS_LOW]: false,
        [STATUS_FALLING]: false,
        [STATUS_COMPRESSION_LOW]: false,
        [STATUS_HIGH]: false,
        [STATUS_RISING]: false,
        [STATUS_PERSISTENT_HIGH]: false,
      },
    );
  });

  it('detects low', () => {
    assert.deepEqual(
      runAnalysis(
        currentTimestamp,
        activeProfile('day'),
        entriesLow(currentTimestamp),
        insulin,
        deviceStatus,
        latestAlarms,
      ),
      {
        [STATUS_BATTERY]: false,
        [STATUS_OUTDATED]: false,
        [STATUS_LOW]: true,
        [STATUS_FALLING]: false,
        [STATUS_COMPRESSION_LOW]: false,
        [STATUS_HIGH]: false,
        [STATUS_RISING]: false,
        [STATUS_PERSISTENT_HIGH]: false,
      },
    );
  });

  it('detects falling', () => {
    assert.deepEqual(
      runAnalysis(
        currentTimestamp,
        activeProfile('day'),
        entriesFalling(currentTimestamp),
        insulin,
        deviceStatus,
        latestAlarms,
      ),
      {
        [STATUS_BATTERY]: false,
        [STATUS_OUTDATED]: false,
        [STATUS_LOW]: false,
        [STATUS_FALLING]: true,
        [STATUS_COMPRESSION_LOW]: false,
        [STATUS_HIGH]: false,
        [STATUS_RISING]: false,
        [STATUS_PERSISTENT_HIGH]: false,
      },
    );
  });

  it('detects compression low', () => {
    assert.deepEqual(
      runAnalysis(
        currentTimestamp,
        activeProfile('night'),
        entriesCompressionLow(currentTimestamp),
        insulin,
        deviceStatus,
        latestAlarms,
      ),
      {
        [STATUS_BATTERY]: false,
        [STATUS_OUTDATED]: false,
        [STATUS_LOW]: false,
        [STATUS_FALLING]: false,
        [STATUS_COMPRESSION_LOW]: true,
        [STATUS_HIGH]: false,
        [STATUS_RISING]: false,
        [STATUS_PERSISTENT_HIGH]: false,
      },
    );
  });

  it('detects high', () => {
    assert.deepEqual(
      runAnalysis(
        currentTimestamp,
        activeProfile('day'),
        entriesHigh(currentTimestamp),
        insulin,
        deviceStatus,
        latestAlarms,
      ),
      {
        [STATUS_BATTERY]: false,
        [STATUS_OUTDATED]: false,
        [STATUS_LOW]: false,
        [STATUS_FALLING]: false,
        [STATUS_COMPRESSION_LOW]: false,
        [STATUS_HIGH]: true,
        [STATUS_RISING]: false,
        [STATUS_PERSISTENT_HIGH]: false,
      },
    );
  });

  it('detects rising', () => {
    assert.deepEqual(
      runAnalysis(
        currentTimestamp,
        activeProfile('day'),
        entriesRising(currentTimestamp),
        insulin,
        deviceStatus,
        latestAlarms,
      ),
      {
        [STATUS_BATTERY]: false,
        [STATUS_OUTDATED]: false,
        [STATUS_LOW]: false,
        [STATUS_FALLING]: false,
        [STATUS_COMPRESSION_LOW]: false,
        [STATUS_HIGH]: false,
        [STATUS_RISING]: true,
        [STATUS_PERSISTENT_HIGH]: false,
      },
    );
  });

  it('detects persistent high', () => {
    assert.deepEqual(
      runAnalysis(
        currentTimestamp,
        activeProfile('night'),
        entriesPersistentHigh(currentTimestamp),
        insulin,
        deviceStatus,
        latestAlarms,
      ),
      {
        [STATUS_BATTERY]: false,
        [STATUS_OUTDATED]: false,
        [STATUS_LOW]: false,
        [STATUS_FALLING]: false,
        [STATUS_COMPRESSION_LOW]: false,
        [STATUS_HIGH]: false,
        [STATUS_RISING]: false,
        [STATUS_PERSISTENT_HIGH]: true,
      },
    );
  });
});
