import 'mocha';
import { assert } from 'chai';
import { activeProfile } from 'server/utils/test';
import { Alarm, DEFAULT_STATE, DeviceStatus, Insulin } from 'core/models/model';
import { runAnalysis } from 'core/analyser/analyser';
import { entriesNoSituation } from 'core/analyser/test-data/no-situation';
import { entriesOutdated } from 'core/analyser/test-data/outdated';
import { entriesLow } from 'core/analyser/test-data/low';
import { entriesFalling } from 'core/analyser/test-data/falling';
import { entriesCompressionLow } from 'core/analyser/test-data/compression-low';
import { entriesHigh } from 'core/analyser/test-data/high';
import { entriesRising } from 'core/analyser/test-data/rising';
import { entriesPersistentHigh } from 'core/analyser/test-data/persistent-high';

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
      DEFAULT_STATE,
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
        ...DEFAULT_STATE,
        BATTERY: true,
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
        ...DEFAULT_STATE,
        OUTDATED: true,
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
        ...DEFAULT_STATE,
        LOW: true,
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
        ...DEFAULT_STATE,
        FALLING: true,
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
        ...DEFAULT_STATE,
        COMPRESSION_LOW: true,
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
        ...DEFAULT_STATE,
        HIGH: true,
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
        ...DEFAULT_STATE,
        RISING: true,
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
        ...DEFAULT_STATE,
        PERSISTENT_HIGH: true,
      },
    );
  });
});
