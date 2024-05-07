import { runAnalysis } from 'backend/cronjobs/analyser/analyser';
import { generateSensorEntries, getMockActiveProfile } from 'shared/utils/test';
import { describe, expect, it } from 'vitest';
import { mockNow } from 'shared/mocks/dates';
import { getTimeMinusMinutes } from 'shared/utils/time';

describe('analyser/criticalOutdated', () => {
  it('detects CRITICAL_OUTDATED when there is no data', () => {
    expect(
      runAnalysis({
        currentTimestamp: mockNow,
        activeProfile: getMockActiveProfile('day'),
        sensorEntries: [],
        meterEntries: [],
        insulinEntries: [],
        carbEntries: [],
        alarms: [],
      }),
    ).toEqual('CRITICAL_OUTDATED');
  });

  it('detects CRITICAL_OUTDATED when data is inside timeSinceBgLimit but predicted state is FALLING', () => {
    expect(
      runAnalysis({
        currentTimestamp: mockNow,
        activeProfile: getMockActiveProfile('day'),
        sensorEntries: generateSensorEntries({
          currentTimestamp: mockNow,
          bloodGlucoseHistory: [10.3, 9.4, 8.5, 7.8, 7.0], // Predicted FALLING
          latestEntryAge: 25,
        }),
        meterEntries: [],
        insulinEntries: [],
        carbEntries: [],
        alarms: [],
      }),
    ).toEqual('CRITICAL_OUTDATED');
  });

  it('detects CRITICAL_OUTDATED when data is inside timeSinceBgLimit but predicted state is LOW', () => {
    expect(
      runAnalysis({
        currentTimestamp: mockNow,
        activeProfile: getMockActiveProfile('day'),
        sensorEntries: generateSensorEntries({
          currentTimestamp: mockNow,
          bloodGlucoseHistory: [10.3, 9.4, 8.5, 7.8, 7.0, 6.5], // Predicted LOW
          latestEntryAge: 25,
        }),
        meterEntries: [],
        insulinEntries: [],
        carbEntries: [],
        alarms: [],
      }),
    ).toEqual('CRITICAL_OUTDATED');
  });

  it('detects CRITICAL_OUTDATED when data is inside timeSinceBgLimit but predicted state is BAD_LOW', () => {
    expect(
      runAnalysis({
        currentTimestamp: mockNow,
        activeProfile: getMockActiveProfile('day'),
        sensorEntries: generateSensorEntries({
          currentTimestamp: mockNow,
          bloodGlucoseHistory: [10.3, 9.4, 8.5, 7.8, 7.0, 6.4, 5.0], // Predicted BAD_LOW
          latestEntryAge: 25,
        }),
        meterEntries: [],
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
        meterEntries: [],
        insulinEntries: [],
        carbEntries: [],
        alarms: [],
      }),
    ).toEqual('NO_SITUATION');
  });

  it('detects CRITICAL_OUTDATED when predicted state is not bad but there is insulin on board', () => {
    expect(
      runAnalysis({
        currentTimestamp: mockNow,
        activeProfile: getMockActiveProfile('day'),
        sensorEntries: generateSensorEntries({
          currentTimestamp: mockNow,
          bloodGlucoseHistory: [7.0, 6.0, 6.1, 6.5, 6.4],
          latestEntryAge: 25,
        }),
        meterEntries: [],
        insulinEntries: [
          {
            timestamp: getTimeMinusMinutes(mockNow, 60),
            amount: 3,
            type: 'FAST',
          },
        ],
        carbEntries: [],
        alarms: [],
      }),
    ).toEqual('CRITICAL_OUTDATED');
  });
});
