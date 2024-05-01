import { runAnalysis } from 'backend/cronjobs/analyser/analyser';
import { generateSensorEntries, getMockActiveProfile } from 'shared/utils/test';
import { describe, expect, it } from 'vitest';
import { mockNow } from 'shared/mocks/dates';
import { getTimeMinusTime } from 'shared/utils/time';
import { MIN_IN_MS } from 'shared/utils/calculations';

describe('analyser/compressionLow', () => {
  it('detects COMPRESSION_LOW with sudden abnormal drop during night', () => {
    expect(
      runAnalysis({
        currentTimestamp: mockNow,
        activeProfile: getMockActiveProfile('night'),
        sensorEntries: generateSensorEntries({
          currentTimestamp: mockNow,
          bloodGlucoseHistory: [10, 10.4, 9.9, 7, 3.8],
        }),
        meterEntries: [],
        insulinEntries: [],
        carbEntries: [],
        alarms: [],
      }),
    ).toEqual('COMPRESSION_LOW');
  });

  it('does not detect COMPRESSION_LOW during day', () => {
    expect(
      runAnalysis({
        currentTimestamp: mockNow,
        activeProfile: getMockActiveProfile('day'),
        sensorEntries: generateSensorEntries({
          currentTimestamp: mockNow,
          bloodGlucoseHistory: [10, 10.4, 9.9, 7, 3.8],
        }),
        meterEntries: [],
        insulinEntries: [],
        carbEntries: [],
        alarms: [],
      }),
    ).toEqual('LOW');
  });

  it('does not detect COMPRESSION_LOW with too old entries', () => {
    expect(
      runAnalysis({
        currentTimestamp: mockNow,
        activeProfile: getMockActiveProfile('night'),
        sensorEntries: generateSensorEntries({
          currentTimestamp: getTimeMinusTime(mockNow, 10 * MIN_IN_MS),
          bloodGlucoseHistory: [10, 10.4, 9.9, 7, 3.8],
        }),
        meterEntries: [],
        insulinEntries: [],
        carbEntries: [],
        alarms: [],
      }),
    ).toEqual('LOW');
  });
});
