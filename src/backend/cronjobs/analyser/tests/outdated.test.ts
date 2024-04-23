import { runAnalysis } from 'backend/cronjobs/analyser/analyser';
import { generateSensorEntries, getMockActiveProfile } from 'shared/utils/test';
import { describe, expect, it } from 'vitest';
import { mockNow } from 'shared/mocks/dates';

describe('analyser/outdated', () => {
  it('detects OUTDATED when data is outside timeSinceBgLimit', () => {
    expect(
      runAnalysis({
        currentTimestamp: mockNow,
        activeProfile: getMockActiveProfile('day'),
        sensorEntries: generateSensorEntries({
          currentTimestamp: mockNow,
          bloodGlucoseHistory: [6.2, 6.0, 6.1, 6.0, 5.9], // No predicted low
          latestEntryAge: 35,
        }),
        insulinEntries: [],
        carbEntries: [],
        alarms: [],
      }),
    ).toEqual('OUTDATED');
  });

  it('does not detect OUTDATED when data is inside timeSinceBgLimit', () => {
    expect(
      runAnalysis({
        currentTimestamp: mockNow,
        activeProfile: getMockActiveProfile('day'),
        sensorEntries: generateSensorEntries({
          currentTimestamp: mockNow,
          bloodGlucoseHistory: [6.2, 6.0, 6.1, 6.0, 5.9], // No predicted low
          latestEntryAge: 25,
        }),
        insulinEntries: [],
        carbEntries: [],
        alarms: [],
      }),
    ).toEqual(null);
  });
});
