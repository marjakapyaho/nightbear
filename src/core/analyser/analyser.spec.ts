import { assert } from 'chai';
import { runAnalysis } from 'core/analyser/analyser';
import { entriesCompressionLow } from 'core/analyser/test-data/compression-low';
import { entriesFalling } from 'core/analyser/test-data/falling';
import { entriesHigh } from 'core/analyser/test-data/high';
import { entriesLow } from 'core/analyser/test-data/low';
import { entriesNoSituation } from 'core/analyser/test-data/no-situation';
import { entriesOutdated } from 'core/analyser/test-data/outdated';
import { entriesPersistentHigh } from 'core/analyser/test-data/persistent-high';
import { entriesRising } from 'core/analyser/test-data/rising';
import { Alarm, DEFAULT_STATE, DeviceStatus, Insulin } from 'core/models/model';
import 'mocha';
import { activeProfile } from 'server/utils/test';
import { generateUuid } from 'core/utils/id';

describe('utils/analyser', () => {
  // Mock objects
  const currentTimestamp = 1508672249758;
  const insulin: Insulin[] = [];
  const latestAlarms: Alarm[] = [];

  const deviceStatus: DeviceStatus = {
    modelType: 'DeviceStatus',
    modelUuid: generateUuid(),
    deviceName: 'dexcom-uploader',
    timestamp: currentTimestamp,
    batteryLevel: 70,
    geolocation: null,
  };

  // Assertions
  it('detects no situation', () => {
    assert.deepEqual(
      runAnalysis(
        currentTimestamp,
        activeProfile('day', currentTimestamp),
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
      modelUuid: generateUuid(),
      deviceName: 'dexcom-uploader',
      timestamp: currentTimestamp,
      batteryLevel: 10,
      geolocation: null,
    };

    assert.deepEqual(
      runAnalysis(
        currentTimestamp,
        activeProfile('day', currentTimestamp),
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
        activeProfile('day', currentTimestamp),
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
        activeProfile('day', currentTimestamp),
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
        activeProfile('day', currentTimestamp),
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
        activeProfile('night', currentTimestamp),
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
        activeProfile('day', currentTimestamp),
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
        activeProfile('day', currentTimestamp),
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
        activeProfile('night', currentTimestamp),
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
