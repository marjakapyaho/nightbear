import { runAnalysis } from 'backend/cronjobs/analyser/analyser';
import { generateSensorEntries, getMockActiveProfile } from 'shared/utils/test';
import { DEFAULT_STATE } from 'shared/utils/analyser';
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
    ).toEqual({
      ...DEFAULT_STATE,
      OUTDATED: true,
    });
  });

  it('detects OUTDATED when data is inside timeSinceBgLimit but predicted state is bad', () => {
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
    ).toEqual({
      ...DEFAULT_STATE,
      OUTDATED: true,
    });
  });

  it('detects OUTDATED when there is no data', () => {
    expect(
      runAnalysis({
        currentTimestamp: mockNow,
        activeProfile: getMockActiveProfile('day'),
        sensorEntries: [],
        insulinEntries: [],
        carbEntries: [],
        alarms: [],
      }),
    ).toEqual({
      ...DEFAULT_STATE,
      OUTDATED: true,
    });
  });
});
