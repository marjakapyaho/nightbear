import { assert } from 'chai';
import { runAnalysis } from 'core/analyser/analyser';
import { entriesCompressionLow } from 'core/analyser/test-data/compression-low';
import { entriesFalling } from 'core/analyser/test-data/falling';
import { entriesHigh, recentInsulin } from 'core/analyser/test-data/high';
import { entriesLow, recentCarbs } from 'core/analyser/test-data/low';
import { entriesNoSituation } from 'core/analyser/test-data/no-situation';
import { entriesOutdated } from 'core/analyser/test-data/outdated';
import { entriesPersistentHigh } from 'core/analyser/test-data/persistent-high';
import { entriesRising } from 'core/analyser/test-data/rising';
import { Alarm, Carbs, DEFAULT_STATE, DeviceStatus, Insulin } from 'core/models/model';
import 'mocha';
import { activeProfile } from 'server/utils/test';
import { generateUuid } from 'core/utils/id';
import { entriesBadLow } from 'core/analyser/test-data/bad-low';
import { entriesBadHigh } from 'core/analyser/test-data/bad-high';
import { alarmsWithInactiveBadHigh, entriesBadHighToHigh } from 'core/analyser/test-data/bad-high-to-high';
import { alarmsWithInactiveBadLow, entriesBadLowToLow } from 'core/analyser/test-data/bad-low-to-low';
import { entriesHighFluctuations } from 'core/analyser/test-data/high-fluctuations';
import { entriesLowFluctuations } from 'core/analyser/test-data/low-fluctuations';

describe('utils/analyser', () => {
  // Mock objects
  const currentTimestamp = 1508672249758;
  const insulin: Insulin[] = [];
  const carbs: Carbs[] = [];
  const alarms: Alarm[] = [];

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
        carbs,
        deviceStatus,
        alarms,
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
        carbs,
        deviceStatusBattery,
        alarms,
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
        carbs,
        deviceStatus,
        alarms,
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
        carbs,
        deviceStatus,
        alarms,
      ),
      {
        ...DEFAULT_STATE,
        LOW: true,
      },
    );
  });

  it('detects bad low', () => {
    assert.deepEqual(
      runAnalysis(
        currentTimestamp,
        activeProfile('day', currentTimestamp),
        entriesBadLow(currentTimestamp),
        insulin,
        carbs,
        deviceStatus,
        alarms,
      ),
      {
        ...DEFAULT_STATE,
        BAD_LOW: true,
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
        carbs,
        deviceStatus,
        alarms,
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
        carbs,
        deviceStatus,
        alarms,
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
        carbs,
        deviceStatus,
        alarms,
      ),
      {
        ...DEFAULT_STATE,
        HIGH: true,
      },
    );
  });

  it('detects bad high', () => {
    assert.deepEqual(
      runAnalysis(
        currentTimestamp,
        activeProfile('day', currentTimestamp),
        entriesBadHigh(currentTimestamp),
        insulin,
        carbs,
        deviceStatus,
        alarms,
      ),
      {
        ...DEFAULT_STATE,
        BAD_HIGH: true,
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
        carbs,
        deviceStatus,
        alarms,
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
        carbs,
        deviceStatus,
        alarms,
      ),
      {
        ...DEFAULT_STATE,
        PERSISTENT_HIGH: true,
      },
    );
  });

  it('does not detect high when coming down from bad high', () => {
    assert.deepEqual(
      runAnalysis(
        currentTimestamp,
        activeProfile('night', currentTimestamp),
        entriesBadHighToHigh(currentTimestamp),
        insulin,
        carbs,
        deviceStatus,
        alarmsWithInactiveBadHigh(currentTimestamp),
      ),
      DEFAULT_STATE,
    );
  });

  it('does not detect low when coming up from bad low', () => {
    assert.deepEqual(
      runAnalysis(
        currentTimestamp,
        activeProfile('night', currentTimestamp),
        entriesBadLowToLow(currentTimestamp),
        insulin,
        carbs,
        deviceStatus,
        alarmsWithInactiveBadLow(currentTimestamp),
      ),
      DEFAULT_STATE,
    );
  });

  it('keeps high alarm regardless of fluctuations', () => {
    assert.deepEqual(
      runAnalysis(
        currentTimestamp,
        activeProfile('night', currentTimestamp),
        entriesHighFluctuations(currentTimestamp),
        insulin,
        carbs,
        deviceStatus,
        alarms,
      ),
      {
        ...DEFAULT_STATE,
        HIGH: true,
      },
    );
  });

  it('keeps low alarm regardless of fluctuations', () => {
    assert.deepEqual(
      runAnalysis(
        currentTimestamp,
        activeProfile('night', currentTimestamp),
        entriesLowFluctuations(currentTimestamp),
        insulin,
        carbs,
        deviceStatus,
        alarms,
      ),
      {
        ...DEFAULT_STATE,
        LOW: true,
      },
    );
  });

  it('does not detect high if there is recent insulin (detects rising instead)', () => {
    assert.deepEqual(
      runAnalysis(
        currentTimestamp,
        activeProfile('night', currentTimestamp),
        entriesHigh(currentTimestamp),
        recentInsulin(currentTimestamp),
        carbs,
        deviceStatus,
        alarms,
      ),
      {
        ...DEFAULT_STATE,
        RISING: true,
      },
    );
  });

  it('does not detect low if there are recent carbs (detects falling instead)', () => {
    assert.deepEqual(
      runAnalysis(
        currentTimestamp,
        activeProfile('night', currentTimestamp),
        entriesLow(currentTimestamp),
        insulin,
        recentCarbs(currentTimestamp),
        deviceStatus,
        alarms,
      ),
      {
        ...DEFAULT_STATE,
        FALLING: true,
      },
    );
  });
});
