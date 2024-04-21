import { runAnalysis } from 'backend/cronjobs/analyser/analyser';
import { generateSensorEntries, getMockActiveProfile } from 'shared/utils/test';
import { DEFAULT_STATE } from 'shared/utils/analyser';
import { describe, expect, it } from 'vitest';
import { mockNow } from 'shared/mocks/dates';
import { getTimeAsISOStr, getTimeSubtractedFrom } from 'shared/utils/time';
import { MIN_IN_MS } from 'shared/utils/calculations';

describe('analyser/compressionLow', () => {
  it('detects COMPRESSION_LOW', () => {
    expect(
      runAnalysis({
        currentTimestamp: mockNow,
        activeProfile: getMockActiveProfile('night'),
        sensorEntries: generateSensorEntries({
          currentTimestamp: mockNow,
          bloodGlucoseHistory: [10, 10.4, 9.9, 7, 3.8],
        }),
        insulinEntries: [],
        carbEntries: [],
        alarms: [],
      }),
    ).toEqual({
      ...DEFAULT_STATE,
      COMPRESSION_LOW: true,
    });
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
        insulinEntries: [],
        carbEntries: [],
        alarms: [],
      }),
    ).toEqual({
      ...DEFAULT_STATE,
      LOW: true,
    });
  });

  it('does not detect COMPRESSION_LOW with too old entries', () => {
    expect(
      runAnalysis({
        currentTimestamp: mockNow,
        activeProfile: getMockActiveProfile('night'),
        sensorEntries: generateSensorEntries({
          currentTimestamp: getTimeAsISOStr(getTimeSubtractedFrom(mockNow, 10 * MIN_IN_MS)),
          bloodGlucoseHistory: [10, 10.4, 9.9, 7, 3.8],
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
