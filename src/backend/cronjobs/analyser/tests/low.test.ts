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

  it('does not detect LOW when carbs on board is over 10', () => {
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
            timestamp: getTimeMinusMinutes(mockNow, 20),
            amount: 20,
            durationFactor: 1,
          },
        ],
        alarms: [],
      }),
    ).toEqual(null);
  });

  it('detects LOW when carbs on board is less than 10 and there is no insulin', () => {
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
            timestamp: getTimeMinusMinutes(mockNow, 35),
            amount: 30,
            durationFactor: 1,
          },
        ],
        alarms: [],
      }),
    ).toEqual('LOW');
  });

  it('detects LOW when carbs on board is more than 10 and there is insulin', () => {
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
        carbEntries: [
          {
            timestamp: getTimeMinusMinutes(mockNow, 35),
            amount: 50,
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
    ).toEqual(null);
  });

  it('does not clear LOW at the limit when there is an active LOW alarm', () => {
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
    ).toEqual('LOW');
  });
});
