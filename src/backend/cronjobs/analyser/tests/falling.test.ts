import { runAnalysis } from 'backend/cronjobs/analyser/analyser';
import { generateSensorEntries, getMockActiveProfile } from 'shared/utils/test';
import { DEFAULT_STATE } from 'shared/utils/analyser';
import { describe, expect, it } from 'vitest';
import { mockNow } from 'shared/mocks/dates';

describe('analyser/falling', () => {
  it('detects FALLING', () => {
    expect(
      runAnalysis({
        currentTimestamp: mockNow,
        activeProfile: getMockActiveProfile('day'),
        sensorEntries: generateSensorEntries({
          currentTimestamp: mockNow,
          bloodGlucoseHistory: [9, 8.5, 8.2, 7.3, 6.5, 5.8],
        }),
        insulinEntries: [],
        carbEntries: [],
        alarms: [],
      }),
    ).toEqual({
      ...DEFAULT_STATE,
      FALLING: true,
    });
  });

  it('does not detect FALLING if slope is too small', () => {
    expect(
      runAnalysis({
        currentTimestamp: mockNow,
        activeProfile: getMockActiveProfile('day'),
        sensorEntries: generateSensorEntries({
          currentTimestamp: mockNow,
          bloodGlucoseHistory: [7, 6.7, 6.5, 6.3, 6.1, 5.8],
        }),
        insulinEntries: [],
        carbEntries: [],
        alarms: [],
      }),
    ).toEqual(DEFAULT_STATE);
  });

  it('does not detect FALLING above relative low limit', () => {
    expect(
      runAnalysis({
        currentTimestamp: mockNow,
        activeProfile: getMockActiveProfile('day'),
        sensorEntries: generateSensorEntries({
          currentTimestamp: mockNow,
          bloodGlucoseHistory: [9, 8.5, 7.6, 6.8, 6.1],
        }),
        insulinEntries: [],
        carbEntries: [],
        alarms: [],
      }),
    ).toEqual(DEFAULT_STATE);
  });

  it('does not detect FALLING below absolute low limit (detects LOW)', () => {
    expect(
      runAnalysis({
        currentTimestamp: mockNow,
        activeProfile: getMockActiveProfile('day'),
        sensorEntries: generateSensorEntries({
          currentTimestamp: mockNow,
          bloodGlucoseHistory: [8.2, 7.3, 6.5, 5.8, 5.4, 4.7, 4.2, 3.5],
        }),
        insulinEntries: [],
        carbEntries: [],
        alarms: [],
      }),
    ).toEqual({
      ...DEFAULT_STATE,
      LOW: true,
    });
  });
});
