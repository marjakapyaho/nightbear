import { runAnalysis } from 'backend/cronjobs/analyser/analyser';
import { generateSensorEntries, getMockActiveProfile } from 'shared/utils/test';
import { describe, expect, it } from 'vitest';
import { mockNow } from 'shared/mocks/dates';
import { getTimeMinusMinutes, getTimeMinusTime } from 'shared/utils/time';
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
        meterEntries: [],
        insulinEntries: [],
        carbEntries: [],
        alarms: [],
      }),
    ).toEqual('RISING');
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
        meterEntries: [],
        insulinEntries: [],
        carbEntries: [],
        alarms: [],
      }),
    ).toEqual('NO_SITUATION');
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
        meterEntries: [],
        insulinEntries: [],
        carbEntries: [],
        alarms: [],
      }),
    ).toEqual('HIGH');
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
        meterEntries: [],
        insulinEntries: [],
        carbEntries: [],
        alarms: [],
      }),
    ).toEqual('NO_SITUATION');
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
        meterEntries: [],
        insulinEntries: [],
        carbEntries: [],
        alarms: [],
      }),
    ).toEqual('NO_SITUATION');
  });

  it('does not detect RISING if insulin on board is above RELEVANT_IOB_LIMIT_FOR_HIGH', () => {
    expect(
      runAnalysis({
        currentTimestamp: mockNow,
        activeProfile: getMockActiveProfile('day'),
        sensorEntries: generateSensorEntries({
          currentTimestamp: mockNow,
          bloodGlucoseHistory: [6.5, 6.8, 7.4, 8.5],
        }),
        meterEntries: [],
        insulinEntries: [
          {
            timestamp: getTimeMinusMinutes(mockNow, 100),
            amount: 3,
            type: 'FAST',
          },
        ],
        carbEntries: [],
        alarms: [],
      }),
    ).toEqual('NO_SITUATION');
  });

  it('detects RISING when insulin on board is below RELEVANT_IOB_LIMIT_FOR_HIGH', () => {
    expect(
      runAnalysis({
        currentTimestamp: mockNow,
        activeProfile: getMockActiveProfile('day'),
        sensorEntries: generateSensorEntries({
          currentTimestamp: mockNow,
          bloodGlucoseHistory: [6.5, 6.8, 7.4, 8.5],
        }),
        meterEntries: [],
        insulinEntries: [
          {
            timestamp: getTimeMinusMinutes(mockNow, 120),
            amount: 3,
            type: 'FAST',
          },
        ],
        carbEntries: [],
        alarms: [],
      }),
    ).toEqual('RISING');
  });
});
