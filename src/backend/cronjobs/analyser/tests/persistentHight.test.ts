import { runAnalysis } from 'backend/cronjobs/analyser/analyser';
import { generateSensorEntries, getMockActiveProfile } from 'shared/utils/test';
import { describe, expect, it } from 'vitest';
import { mockNow } from 'shared/mocks/dates';
import { getTimeMinusTime } from 'shared/utils/time';
import { MIN_IN_MS } from 'shared/utils/calculations';

const persistentHighValues = [
  9.5, 9.5, 9.4, 9.6, 9.6, 9.4, 9.6, 9.6, 9.4, 9.6, 9.6, 9.5, 9.5, 9.5, 9.4, 9.6, 9.6, 9.5, 9.4,
  9.5, 9.5, 9.4, 9.6, 9.6, 9.6, 9.6, 9.6, 9.6, 9.6, 9.6,
];

describe('analyser/persistentHigh', () => {
  it('detects PERSISTENT_HIGH', () => {
    expect(
      runAnalysis({
        currentTimestamp: mockNow,
        activeProfile: getMockActiveProfile('day'),
        sensorEntries: generateSensorEntries({
          currentTimestamp: mockNow,
          bloodGlucoseHistory: persistentHighValues,
        }),
        insulinEntries: [],
        carbEntries: [],
        alarms: [],
      }),
    ).toEqual('PERSISTENT_HIGH');
  });

  it('detects PERSISTENT_HIGH without caring about values outside PERSISTENT_HIGH_TIME_WINDOW', () => {
    expect(
      runAnalysis({
        currentTimestamp: mockNow,
        activeProfile: getMockActiveProfile('day'),
        sensorEntries: generateSensorEntries({
          currentTimestamp: mockNow,
          bloodGlucoseHistory: [11.4, ...persistentHighValues],
        }),
        insulinEntries: [],
        carbEntries: [],
        alarms: [],
      }),
    ).toEqual('PERSISTENT_HIGH');
  });

  it('does not detect PERSISTENT_HIGH with too few entries', () => {
    expect(
      runAnalysis({
        currentTimestamp: mockNow,
        activeProfile: getMockActiveProfile('day'),
        sensorEntries: generateSensorEntries({
          currentTimestamp: mockNow,
          bloodGlucoseHistory: [9.5, 9.5, 9.4, 9.6, 9.6, 9.5, 9.4, 9.5],
        }),
        insulinEntries: [],
        carbEntries: [],
        alarms: [],
      }),
    ).toEqual(null);
  });

  it('does not detect PERSISTENT_HIGH when there is even one HIGH value', () => {
    expect(
      runAnalysis({
        currentTimestamp: mockNow,
        activeProfile: getMockActiveProfile('day'),
        sensorEntries: generateSensorEntries({
          currentTimestamp: mockNow,
          bloodGlucoseHistory: [...persistentHighValues, 10.1, 9.5],
        }),
        insulinEntries: [],
        carbEntries: [],
        alarms: [],
      }),
    ).toEqual(null);
  });

  it('does not detect PERSISTENT_HIGH when there is even one normal value', () => {
    expect(
      runAnalysis({
        currentTimestamp: mockNow,
        activeProfile: getMockActiveProfile('day'),
        sensorEntries: generateSensorEntries({
          currentTimestamp: mockNow,
          bloodGlucoseHistory: [...persistentHighValues, 7.1],
        }),
        insulinEntries: [],
        carbEntries: [],
        alarms: [],
      }),
    ).toEqual(null);
  });

  it('does not detect PERSISTENT_HIGH with recent insulin', () => {
    expect(
      runAnalysis({
        currentTimestamp: mockNow,
        activeProfile: getMockActiveProfile('day'),
        sensorEntries: generateSensorEntries({
          currentTimestamp: mockNow,
          bloodGlucoseHistory: persistentHighValues,
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
    ).toEqual(null);
  });

  it('detects PERSISTENT_HIGH when insulin suppression window is over', () => {
    expect(
      runAnalysis({
        currentTimestamp: mockNow,
        activeProfile: getMockActiveProfile('day'),
        sensorEntries: generateSensorEntries({
          currentTimestamp: mockNow,
          bloodGlucoseHistory: persistentHighValues,
        }),
        insulinEntries: [
          {
            timestamp: getTimeMinusTime(mockNow, 65 * MIN_IN_MS),
            amount: 3,
            type: 'FAST',
          },
        ],
        carbEntries: [],
        alarms: [],
      }),
    ).toEqual('PERSISTENT_HIGH');
  });

  it('does not detect PERSISTENT_HIGH when slope of last value is down', () => {
    expect(
      runAnalysis({
        currentTimestamp: mockNow,
        activeProfile: getMockActiveProfile('day'),
        sensorEntries: generateSensorEntries({
          currentTimestamp: mockNow,
          bloodGlucoseHistory: [...persistentHighValues, 9.4],
        }),
        insulinEntries: [],
        carbEntries: [],
        alarms: [],
      }),
    ).toEqual(null);
  });
});
