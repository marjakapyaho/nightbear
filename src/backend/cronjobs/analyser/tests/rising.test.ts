import { runAnalysis } from 'backend/cronjobs/analyser/analyser';
import { generateSensorEntries, getMockActiveProfile } from 'shared/utils/test';
import { DEFAULT_STATE } from 'shared/utils/analyser';
import { describe, expect, it } from 'vitest';
import { mockNow } from 'shared/mocks/dates';
import { getTimeAsISOStr, getTimeSubtractedFrom } from 'shared/utils/time';
import { MIN_IN_MS } from 'shared/utils/calculations';

describe('analyser/rising', () => {
  it('detects RISING', () => {
    expect(
      runAnalysis({
        currentTimestamp: mockNow,
        activeProfile: getMockActiveProfile('day'),
        sensorEntries: generateSensorEntries({
          currentTimestamp: mockNow,
          bloodGlucoseHistory: [6.5, 6.8, 7.4, 8.5],
        }),
        insulinEntries: [],
        carbEntries: [],
        alarms: [],
      }),
    ).toEqual({
      ...DEFAULT_STATE,
      RISING: true,
    });
  });

  it('does not detect RISING when below relative high', () => {
    expect(
      runAnalysis({
        currentTimestamp: mockNow,
        activeProfile: getMockActiveProfile('day'),
        sensorEntries: generateSensorEntries({
          currentTimestamp: mockNow,
          bloodGlucoseHistory: [5.5, 6.8, 7.6],
        }),
        insulinEntries: [],
        carbEntries: [],
        alarms: [],
      }),
    ).toEqual(DEFAULT_STATE);
  });

  it('does not detect RISING when above absolute high (detects HIGH)', () => {
    expect(
      runAnalysis({
        currentTimestamp: mockNow,
        activeProfile: getMockActiveProfile('day'),
        sensorEntries: generateSensorEntries({
          currentTimestamp: mockNow,
          bloodGlucoseHistory: [5.5, 6.8, 7.6, 8.8, 9.5, 10.1],
        }),
        insulinEntries: [],
        carbEntries: [],
        alarms: [],
      }),
    ).toEqual({
      ...DEFAULT_STATE,
      HIGH: true,
    });
  });

  it('does not detect RISING when slope is too small', () => {
    expect(
      runAnalysis({
        currentTimestamp: mockNow,
        activeProfile: getMockActiveProfile('day'),
        sensorEntries: generateSensorEntries({
          currentTimestamp: mockNow,
          bloodGlucoseHistory: [5.5, 6.8, 7.6, 8.1],
        }),
        insulinEntries: [],
        carbEntries: [],
        alarms: [],
      }),
    ).toEqual(DEFAULT_STATE);
  });

  it('does not detect RISING when you can not calculate slope', () => {
    expect(
      runAnalysis({
        currentTimestamp: mockNow,
        activeProfile: getMockActiveProfile('day'),
        sensorEntries: generateSensorEntries({
          currentTimestamp: mockNow,
          bloodGlucoseHistory: [8.1],
        }),
        insulinEntries: [],
        carbEntries: [],
        alarms: [],
      }),
    ).toEqual(DEFAULT_STATE);
  });

  it('does not detect RISING if there is correction insulin', () => {
    expect(
      runAnalysis({
        currentTimestamp: mockNow,
        activeProfile: getMockActiveProfile('day'),
        sensorEntries: generateSensorEntries({
          currentTimestamp: mockNow,
          bloodGlucoseHistory: [6.5, 6.8, 7.4, 8.5],
        }),
        insulinEntries: [
          {
            timestamp: mockNow,
            amount: 3,
            type: 'FAST',
          },
        ],
        carbEntries: [],
        alarms: [],
      }),
    ).toEqual(DEFAULT_STATE);
  });

  it('detects RISING when insulin suppression window is over', () => {
    expect(
      runAnalysis({
        currentTimestamp: mockNow,
        activeProfile: getMockActiveProfile('day'),
        sensorEntries: generateSensorEntries({
          currentTimestamp: mockNow,
          bloodGlucoseHistory: [6.5, 6.8, 7.4, 8.5],
        }),
        insulinEntries: [
          {
            timestamp: getTimeAsISOStr(getTimeSubtractedFrom(mockNow, 65 * MIN_IN_MS)),
            amount: 3,
            type: 'FAST',
          },
        ],
        carbEntries: [],
        alarms: [],
      }),
    ).toEqual({
      ...DEFAULT_STATE,
      RISING: true,
    });
  });
});
