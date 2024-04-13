import { assert } from 'chai';
import { runAnalysis } from 'backend/cronjobs/analyser/analyser';
import { entriesCompressionLow } from 'backend/cronjobs/analyser/testData/compression-low';
import { entriesFalling } from 'backend/cronjobs/analyser/testData/falling';
import { entriesHigh, recentInsulin } from 'backend/cronjobs/analyser/testData/high';
import { entriesLow, recentCarbs } from 'backend/cronjobs/analyser/testData/low';
import { entriesNoSituation } from 'backend/cronjobs/analyser/testData/no-situation';
import { entriesOutdated } from 'backend/cronjobs/analyser/testData/outdated';
import { entriesPersistentHigh } from 'backend/cronjobs/analyser/testData/persistent-high';
import { entriesRising } from 'backend/cronjobs/analyser/testData/rising';
import 'mocha';
import { entriesBadLow } from 'backend/cronjobs/analyser/testData/bad-low';
import { entriesBadHigh } from 'backend/cronjobs/analyser/testData/bad-high';
import { alarmsWithInactiveBadHigh, entriesBadHighToHigh } from 'backend/cronjobs/analyser/testData/bad-high-to-high';
import { alarmsWithInactiveBadLow, entriesBadLowToLow } from 'backend/cronjobs/analyser/testData/bad-low-to-low';
import { entriesHighFluctuations } from 'backend/cronjobs/analyser/testData/high-fluctuations';
import { entriesLowFluctuations } from 'backend/cronjobs/analyser/testData/low-fluctuations';
import { MIN_IN_MS } from 'shared/utils/calculations';
import { CarbEntry, InsulinEntry } from 'shared/types/timelineEntries';
import { Alarm } from 'shared/types/alarms';
import { DEFAULT_STATE } from 'shared/utils/analyser';
import { mockProfiles } from 'shared/mocks/profiles';

const getMockActiveProfile = (profileName: string) => ({
  ...mockProfiles[0],
  profileName,
});

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
        getMockActiveProfile('day'),
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
        getMockActiveProfile('day'),
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
      runAnalysis(currentTimestamp, getMockActiveProfile('day'), entriesLow(currentTimestamp), insulin, carbs, alarms),
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
        getMockActiveProfile('day'),
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
        getMockActiveProfile('day'),
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
        getMockActiveProfile('night'),
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
        getMockActiveProfile('night'),
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
        getMockActiveProfile('night'),
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
        getMockActiveProfile('night'),
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
        getMockActiveProfile('night'),
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
        getMockActiveProfile('night'),
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
        getMockActiveProfile('night'),
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
        getMockActiveProfile('night'),
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
        getMockActiveProfile('night'),
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
        getMockActiveProfile('night'),
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
        getMockActiveProfile('night'),
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
        getMockActiveProfile('night'),
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
