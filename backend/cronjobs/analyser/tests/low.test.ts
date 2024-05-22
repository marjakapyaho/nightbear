import { runAnalysis } from '../analyser';
import { generateSensorEntries, getMockActiveProfile } from '@nightbear/shared';
import { describe, expect, it } from 'vitest';
import { mockNow } from '@nightbear/shared';
import { getTimeMinusMinutes } from '@nightbear/shared';

describe('analyser/low', () => {
  it('detects LOW below low limit', () => {
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

  it('does not clear LOW below LOW_CLEARING_THRESHOLD when there is active LOW alarm', () => {
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
              },
            ],
          },
        ],
      }),
    ).toEqual('LOW');
  });

  it('clears LOW after LOW_CLEARING_THRESHOLD even if there is alarm', () => {
    expect(
      runAnalysis({
        currentTimestamp: mockNow,
        activeProfile: getMockActiveProfile('day'),
        sensorEntries: generateSensorEntries({
          currentTimestamp: mockNow,
          bloodGlucoseHistory: [4.5, 3.9, 3.8, 3.9, 4.0, 3.9, 4.6],
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
              },
            ],
          },
        ],
      }),
    ).toEqual('NO_SITUATION');
  });

  it('does not detect LOW after BAD_LOW when we are inside BAD_LOW_QUARANTINE_WINDOW', () => {
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
              },
            ],
          },
        ],
      }),
    ).toEqual('NO_SITUATION');
  });

  it('detects LOW after BAD_LOW when we are outside BAD_LOW_QUARANTINE_WINDOW', () => {
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
            deactivatedAt: getTimeMinusMinutes(mockNow, 20), // Outside window
            alarmStates: [
              {
                id: '1',
                timestamp: getTimeMinusMinutes(mockNow, 40),
                alarmLevel: 1,
                validAfter: getTimeMinusMinutes(mockNow, 40),
              },
            ],
          },
        ],
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
          // To affect currentCarbsToInsulin
          { timestamp: getTimeMinusMinutes(mockNow, 60), amount: 5, type: 'FAST' },
        ],
        carbEntries: [
          // To affect requiredCarbsToInsulin (calculates as 50/5=10)
          {
            timestamp: getTimeMinusMinutes(mockNow, 300),
            amount: 50,
            durationFactor: 1,
          },
          // To affect currentCarbsToInsulin
          {
            timestamp: getTimeMinusMinutes(mockNow, 15),
            amount: 60,
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
});
