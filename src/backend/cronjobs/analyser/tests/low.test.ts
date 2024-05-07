import { runAnalysis } from 'backend/cronjobs/analyser/analyser';
import { generateSensorEntries, getMockActiveProfile } from 'shared/utils/test';
import { describe, expect, it } from 'vitest';
import { mockNow } from 'shared/mocks/dates';
import { getTimeMinusMinutes, getTimeMinusTime } from 'shared/utils/time';
import { MIN_IN_MS } from 'shared/utils/calculations';

describe('analyser/low', () => {
  it('detects LOW', () => {
    expect(
      runAnalysis({
        currentTimestamp: mockNow,
        activeProfile: getMockActiveProfile('day'),
        sensorEntries: generateSensorEntries({
          currentTimestamp: mockNow,
          bloodGlucoseHistory: [6, 5, 4.7, 3.8],
        }),
        meterEntries: [],
        insulinEntries: [],
        carbEntries: [],
        alarms: [],
      }),
    ).toEqual('LOW');
  });

  it('does not detect LOW when there are carbs taken within LOW_CORRECTION_SUPPRESSION_WINDOW', () => {
    expect(
      runAnalysis({
        currentTimestamp: mockNow,
        activeProfile: getMockActiveProfile('day'),
        sensorEntries: generateSensorEntries({
          currentTimestamp: mockNow,
          bloodGlucoseHistory: [6, 5, 4.7, 3.8],
        }),
        meterEntries: [],
        insulinEntries: [],
        carbEntries: [
          {
            timestamp: getTimeMinusMinutes(mockNow, 15),
            amount: 20,
            durationFactor: 1,
          },
        ],
        alarms: [],
      }),
    ).toEqual('NO_SITUATION');
  });

  it('detects LOW when there are carbs taken outside LOW_CORRECTION_SUPPRESSION_WINDOW', () => {
    expect(
      runAnalysis({
        currentTimestamp: mockNow,
        activeProfile: getMockActiveProfile('day'),
        sensorEntries: generateSensorEntries({
          currentTimestamp: mockNow,
          bloodGlucoseHistory: [6, 5, 4.7, 3.8],
        }),
        meterEntries: [],
        insulinEntries: [],
        carbEntries: [
          {
            timestamp: getTimeMinusMinutes(mockNow, 30),
            amount: 50,
            durationFactor: 1,
          },
        ],
        alarms: [],
      }),
    ).toEqual('LOW');
  });

  it('detects LOW even if taken carbs are inside LOW_CORRECTION_SUPPRESSION_WINDOW if there is too much insulin', () => {
    expect(
      runAnalysis({
        currentTimestamp: mockNow,
        activeProfile: getMockActiveProfile('day'),
        sensorEntries: generateSensorEntries({
          currentTimestamp: mockNow,
          bloodGlucoseHistory: [6, 5, 4.7, 3.8],
        }),
        meterEntries: [],
        insulinEntries: [
          // To affect requiredCarbsToInsulin (calculates as 50/5=10)
          { timestamp: getTimeMinusMinutes(mockNow, 300), amount: 5, type: 'FAST' },
          // To affect currentCarbsToInsulin (calculates as 40/5=8)
          { timestamp: getTimeMinusMinutes(mockNow, 60), amount: 5, type: 'FAST' },
        ],
        carbEntries: [
          // To affect requiredCarbsToInsulin (calculates as 50/5=10)
          {
            timestamp: getTimeMinusMinutes(mockNow, 300),
            amount: 50,
            durationFactor: 1,
          },
          // To affect currentCarbsToInsulin (calculates as 40/5=8)
          {
            timestamp: getTimeMinusMinutes(mockNow, 15),
            amount: 40,
            durationFactor: 1,
          },
        ],
        alarms: [],
      }),
    ).toEqual('LOW');
  });

  it('detects LOW when could not calculate insulin to carbs ratio', () => {
    expect(
      runAnalysis({
        currentTimestamp: mockNow,
        activeProfile: getMockActiveProfile('day'),
        sensorEntries: generateSensorEntries({
          currentTimestamp: mockNow,
          bloodGlucoseHistory: [6, 5, 4.7, 3.8],
        }),
        meterEntries: [],
        insulinEntries: [{ timestamp: getTimeMinusMinutes(mockNow, 60), amount: 1, type: 'FAST' }],
        carbEntries: [], // Divider is zero
        alarms: [],
      }),
    ).toEqual('LOW');
  });

  it('does not detect LOW right after BAD_LOW', () => {
    expect(
      runAnalysis({
        currentTimestamp: mockNow,
        activeProfile: getMockActiveProfile('day'),
        sensorEntries: generateSensorEntries({
          currentTimestamp: mockNow,
          bloodGlucoseHistory: [2.4, 2.8, 2.9, 3.4],
        }),
        meterEntries: [],
        insulinEntries: [],
        carbEntries: [],
        alarms: [
          {
            id: '123',
            situation: 'BAD_LOW',
            isActive: false,
            deactivatedAt: getTimeMinusMinutes(mockNow, 10),
            alarmStates: [
              {
                id: '1',
                timestamp: getTimeMinusMinutes(mockNow, 40),
                alarmLevel: 1,
                validAfter: getTimeMinusMinutes(mockNow, 40),
                ackedBy: null,
              },
            ],
          },
        ],
      }),
    ).toEqual('NO_SITUATION');
  });

  it('does not clear LOW at the limit when predicted situation is still indicating low', () => {
    expect(
      runAnalysis({
        currentTimestamp: mockNow,
        activeProfile: getMockActiveProfile('day'),
        sensorEntries: generateSensorEntries({
          currentTimestamp: mockNow,
          bloodGlucoseHistory: [4.5, 3.9, 3.8, 3.9, 4.0, 3.9, 4.1],
        }),
        meterEntries: [],
        insulinEntries: [],
        carbEntries: [],
        alarms: [
          {
            id: '123',
            situation: 'LOW',
            isActive: true,
            alarmStates: [
              {
                id: '1',
                timestamp: getTimeMinusMinutes(mockNow, 30),
                alarmLevel: 1,
                validAfter: getTimeMinusMinutes(mockNow, 30),
                ackedBy: null,
              },
            ],
          },
        ],
      }),
    ).toEqual('LOW');
  });

  it('clears LOW at the limit even when there is an active LOW alarm if predicted situation is indicating rise', () => {
    expect(
      runAnalysis({
        currentTimestamp: mockNow,
        activeProfile: getMockActiveProfile('day'),
        sensorEntries: generateSensorEntries({
          currentTimestamp: mockNow,
          bloodGlucoseHistory: [3.4, 3.6, 3.8, 4.3],
        }),
        meterEntries: [],
        insulinEntries: [],
        carbEntries: [],
        alarms: [
          {
            id: '123',
            situation: 'LOW',
            isActive: true,
            alarmStates: [
              {
                id: '1',
                timestamp: getTimeMinusMinutes(mockNow, 30),
                alarmLevel: 1,
                validAfter: getTimeMinusMinutes(mockNow, 30),
                ackedBy: null,
              },
            ],
          },
        ],
      }),
    ).toEqual('NO_SITUATION');
  });
});
