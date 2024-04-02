import { assert } from 'chai';
import { runAnalysis } from 'shared/analyser/analyser';
import { entriesCompressionLow } from 'shared/analyser/testData/compression-low';
import { entriesFalling } from 'shared/analyser/testData/falling';
import { entriesHigh, recentInsulin } from 'shared/analyser/testData/high';
import { entriesLow, recentCarbs } from 'shared/analyser/testData/low';
import { entriesNoSituation } from 'shared/analyser/testData/no-situation';
import { entriesOutdated } from 'shared/analyser/testData/outdated';
import { entriesPersistentHigh } from 'shared/analyser/testData/persistent-high';
import { entriesRising } from 'shared/analyser/testData/rising';
import 'mocha';
import { activeProfile } from 'backend/utils/test';
import { entriesBadLow } from 'shared/analyser/testData/bad-low';
import { entriesBadHigh } from 'shared/analyser/testData/bad-high';
import { alarmsWithInactiveBadHigh, entriesBadHighToHigh } from 'shared/analyser/testData/bad-high-to-high';
import { alarmsWithInactiveBadLow, entriesBadLowToLow } from 'shared/analyser/testData/bad-low-to-low';
import { entriesHighFluctuations } from 'shared/analyser/testData/high-fluctuations';
import { entriesLowFluctuations } from 'shared/analyser/testData/low-fluctuations';
import { MIN_IN_MS } from 'shared/calculations/calculations';
import { CarbEntry, InsulinEntry } from 'shared/types/timelineEntries';
import { Alarm } from 'shared/types/alarms';
import { DEFAULT_STATE } from 'shared/types/analyser';

describe('utils/analyser', () => {
  // Mock objects
  const currentTimestamp = 1508672249758;
  const insulin: InsulinEntry[] = [];
  const carbs: CarbEntry[] = [];
  const alarms: Alarm[] = [];

  // Assertions
  it('detects no situation', () => {
    assert.deepEqual(
      runAnalysis(
        currentTimestamp,
        activeProfile('day', currentTimestamp),
        entriesNoSituation(currentTimestamp),
        insulin,
        carbs,
        alarms,
      ),
      DEFAULT_STATE,
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

        alarms,
      ),
      {
        ...DEFAULT_STATE,
        LOW: true,
      },
    );
  });

  it('does not detect high or rising if there is recent insulin', () => {
    assert.deepEqual(
      runAnalysis(
        currentTimestamp,
        activeProfile('night', currentTimestamp),
        entriesHigh(currentTimestamp),
        recentInsulin(currentTimestamp - 80 * MIN_IN_MS),
        carbs,

        alarms,
      ),
      DEFAULT_STATE,
    );
  });

  it('detects high when suppression window is over', () => {
    assert.deepEqual(
      runAnalysis(
        currentTimestamp,
        activeProfile('night', currentTimestamp),
        entriesHigh(currentTimestamp),
        recentInsulin(currentTimestamp - 140 * MIN_IN_MS),
        carbs,

        alarms,
      ),
      {
        ...DEFAULT_STATE,
        HIGH: true,
      },
    );
  });

  it('does not detect low if there are recent carbs', () => {
    assert.deepEqual(
      runAnalysis(
        currentTimestamp,
        activeProfile('night', currentTimestamp),
        entriesLow(currentTimestamp),
        insulin,
        recentCarbs(currentTimestamp),

        alarms,
      ),
      {
        ...DEFAULT_STATE,
        FALLING: false,
      },
    );
  });
});
