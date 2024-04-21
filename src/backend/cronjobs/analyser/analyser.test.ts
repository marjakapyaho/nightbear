import { runAnalysis } from 'backend/cronjobs/analyser/analyser';
import { entriesBadHigh } from 'backend/cronjobs/analyser/testData/bad-high';
import {
  alarmsWithInactiveBadHigh,
  entriesBadHighToHigh,
} from 'backend/cronjobs/analyser/testData/bad-high-to-high';
import { entriesFalling } from 'backend/cronjobs/analyser/testData/falling';
import { entriesHigh, recentInsulin } from 'backend/cronjobs/analyser/testData/high';
import { entriesHighFluctuations } from 'backend/cronjobs/analyser/testData/high-fluctuations';
import { entriesLowFluctuations } from 'backend/cronjobs/analyser/testData/low-fluctuations';
import { entriesPersistentHigh } from 'backend/cronjobs/analyser/testData/persistent-high';
import { entriesRising } from 'backend/cronjobs/analyser/testData/rising';
import { getMockActiveProfile } from 'shared/utils/test';
import { Alarm } from 'shared/types/alarms';
import { CarbEntry, InsulinEntry } from 'shared/types/timelineEntries';
import { DEFAULT_STATE } from 'shared/utils/analyser';
import { MIN_IN_MS } from 'shared/utils/calculations';
import { describe, expect, it } from 'vitest';

describe('utils/analyser', () => {
  const currentTimestamp = 1508672249758;
  const insulin: InsulinEntry[] = [];
  const carbs: CarbEntry[] = [];
  const alarms: Alarm[] = [];

  it('detects falling', () => {
    expect(
      runAnalysis(
        currentTimestamp,
        getMockActiveProfile('day'),
        entriesFalling(currentTimestamp),
        insulin,
        carbs,
        alarms,
      ),
    ).toEqual({
      ...DEFAULT_STATE,
      FALLING: true,
    });
  });

  it('detects high', () => {
    expect(
      runAnalysis(
        currentTimestamp,
        getMockActiveProfile('night'),
        entriesHigh(currentTimestamp),
        insulin,
        carbs,
        alarms,
      ),
    ).toEqual({
      ...DEFAULT_STATE,
      HIGH: true,
    });
  });

  it('detects bad high', () => {
    expect(
      runAnalysis(
        currentTimestamp,
        getMockActiveProfile('night'),
        entriesBadHigh(currentTimestamp),
        insulin,
        carbs,
        alarms,
      ),
    ).toEqual({
      ...DEFAULT_STATE,
      BAD_HIGH: true,
    });
  });

  it('detects rising', () => {
    expect(
      runAnalysis(
        currentTimestamp,
        getMockActiveProfile('night'),
        entriesRising(currentTimestamp),
        insulin,
        carbs,
        alarms,
      ),
    ).toEqual({
      ...DEFAULT_STATE,
      RISING: true,
    });
  });

  it('detects persistent high', () => {
    expect(
      runAnalysis(
        currentTimestamp,
        getMockActiveProfile('night'),
        entriesPersistentHigh(currentTimestamp),
        insulin,
        carbs,
        alarms,
      ),
    ).toEqual({
      ...DEFAULT_STATE,
      PERSISTENT_HIGH: true,
    });
  });

  it('does not detect high when coming down from bad high', () => {
    expect(
      runAnalysis(
        currentTimestamp,
        getMockActiveProfile('night'),
        entriesBadHighToHigh(currentTimestamp),
        insulin,
        carbs,
        alarmsWithInactiveBadHigh(currentTimestamp),
      ),
    ).toEqual(DEFAULT_STATE);
  });

  it('keeps high alarm regardless of fluctuations', () => {
    expect(
      runAnalysis(
        currentTimestamp,
        getMockActiveProfile('night'),
        entriesHighFluctuations(currentTimestamp),
        insulin,
        carbs,
        alarms,
      ),
    ).toEqual({
      ...DEFAULT_STATE,
      HIGH: true,
    });
  });

  it('keeps low alarm regardless of fluctuations', () => {
    expect(
      runAnalysis(
        currentTimestamp,
        getMockActiveProfile('night'),
        entriesLowFluctuations(currentTimestamp),
        insulin,
        carbs,
        alarms,
      ),
    ).toEqual({
      ...DEFAULT_STATE,
      LOW: true,
    });
  });

  it('does not detect high or rising if there is recent insulin', () => {
    expect(
      runAnalysis(
        currentTimestamp,
        getMockActiveProfile('night'),
        entriesHigh(currentTimestamp),
        recentInsulin(currentTimestamp - 80 * MIN_IN_MS),
        carbs,
        alarms,
      ),
    ).toEqual(DEFAULT_STATE);
  });

  it('detects high when suppression window is over', () => {
    expect(
      runAnalysis(
        currentTimestamp,
        getMockActiveProfile('night'),
        entriesHigh(currentTimestamp),
        recentInsulin(currentTimestamp - 140 * MIN_IN_MS),
        carbs,
        alarms,
      ),
    ).toEqual({
      ...DEFAULT_STATE,
      HIGH: true,
    });
  });
});
