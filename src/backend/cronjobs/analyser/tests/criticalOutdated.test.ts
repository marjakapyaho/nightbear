import { runAnalysis } from 'backend/cronjobs/analyser/analyser';
import { generateSensorEntries, getMockActiveProfile } from 'shared/utils/test';
import { describe, expect, it } from 'vitest';
import { mockNow } from 'shared/mocks/dates';

describe('analyser/criticalOutdated', () => {
  it('detects CRITICAL_OUTDATED when data is inside timeSinceBgLimit but predicted state is bad', () => {
    expect(
      runAnalysis({
        currentTimestamp: mockNow,
        activeProfile: getMockActiveProfile('day'),
        sensorEntries: generateSensorEntries({
          currentTimestamp: mockNow,
          bloodGlucoseHistory: [7.0, 6.0, 5.0, 4.7, 4.4], // Predicted low
          latestEntryAge: 25,
        }),
        insulinEntries: [],
        carbEntries: [],
        alarms: [],
      }),
    ).toEqual('CRITICAL_OUTDATED');
  });

  it('does not detect CRITICAL_OUTDATED when predicted state is not bad', () => {
    expect(
      runAnalysis({
        currentTimestamp: mockNow,
        activeProfile: getMockActiveProfile('day'),
        sensorEntries: generateSensorEntries({
          currentTimestamp: mockNow,
          bloodGlucoseHistory: [7.0, 6.0, 6.1, 6.5, 6.4],
          latestEntryAge: 25,
        }),
        insulinEntries: [],
        carbEntries: [],
        alarms: [],
      }),
    ).toEqual(null);
  });

  it('detects CRITICAL_OUTDATED when there is no data', () => {
    expect(
      runAnalysis({
        currentTimestamp: mockNow,
        activeProfile: getMockActiveProfile('day'),
        sensorEntries: [],
        insulinEntries: [],
        carbEntries: [],
        alarms: [],
      }),
    ).toEqual('CRITICAL_OUTDATED');
  });
});
