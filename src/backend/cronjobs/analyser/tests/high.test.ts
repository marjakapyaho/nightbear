import { runAnalysis } from 'backend/cronjobs/analyser/analyser';
import { generateSensorEntries, getMockActiveProfile } from 'shared/utils/test';
import { describe, expect, it } from 'vitest';
import { mockNow } from 'shared/mocks/dates';
import { getTimeMinusMinutes, getTimeMinusTime } from 'shared/utils/time';
import { MIN_IN_MS } from 'shared/utils/calculations';

describe('analyser/high', () => {
  it('detects HIGH', () => {
    expect(
      runAnalysis({
        currentTimestamp: mockNow,
        activeProfile: getMockActiveProfile('day'),
        sensorEntries: generateSensorEntries({
          currentTimestamp: mockNow,
          bloodGlucoseHistory: [9.0, 9.5, 9.6, 9.8, 10.1],
        }),
        meterEntries: [],
        insulinEntries: [],
        carbEntries: [],
        alarms: [],
      }),
    ).toEqual('HIGH');
  });

  it('does not detect HIGH when insulin on board is above RELEVANT_IOB_LIMIT_FOR_HIGH', () => {
    expect(
      runAnalysis({
        currentTimestamp: mockNow,
        activeProfile: getMockActiveProfile('day'),
        sensorEntries: generateSensorEntries({
          currentTimestamp: mockNow,
          bloodGlucoseHistory: [9.0, 9.5, 9.6, 9.8, 10.1],
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

  it('detects HIGH when insulin on board is below RELEVANT_IOB_LIMIT_FOR_HIGH', () => {
    expect(
      runAnalysis({
        currentTimestamp: mockNow,
        activeProfile: getMockActiveProfile('day'),
        sensorEntries: generateSensorEntries({
          currentTimestamp: mockNow,
          bloodGlucoseHistory: [9.0, 9.5, 9.6, 9.8, 10.1],
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
    ).toEqual('HIGH');
  });

  it('does not detect HIGH when coming down from BAD_HIGH', () => {
    const timestamp30minAgo = getTimeMinusTime(mockNow, 30 * MIN_IN_MS);
    expect(
      runAnalysis({
        currentTimestamp: mockNow,
        activeProfile: getMockActiveProfile('day'),
        sensorEntries: generateSensorEntries({
          currentTimestamp: mockNow,
          bloodGlucoseHistory: [15.5, 14.5, 14.1, 13.5],
        }),
        meterEntries: [],
        insulinEntries: [],
        carbEntries: [],
        alarms: [
          {
            id: '1234',
            situation: 'BAD_HIGH',
            isActive: false,
            deactivatedAt: getTimeMinusTime(mockNow, 5 * MIN_IN_MS),
            alarmStates: [
              {
                id: '1',
                timestamp: timestamp30minAgo,
                alarmLevel: 1,
                validAfter: timestamp30minAgo,
                ackedBy: null,
              },
            ],
          },
        ],
      }),
    ).toEqual('NO_SITUATION');
  });

  it('does not clear HIGH at the limit when there is an active HIGH alarm', () => {
    expect(
      runAnalysis({
        currentTimestamp: mockNow,
        activeProfile: getMockActiveProfile('day'),
        sensorEntries: generateSensorEntries({
          currentTimestamp: mockNow,
          bloodGlucoseHistory: [11.5, 10.5, 9.9],
        }),
        meterEntries: [],
        insulinEntries: [],
        carbEntries: [],
        alarms: [
          {
            id: '1234',
            situation: 'HIGH',
            isActive: true,
            alarmStates: [
              {
                id: '1',
                timestamp: getTimeMinusTime(mockNow, 30 * MIN_IN_MS),
                alarmLevel: 1,
                validAfter: getTimeMinusTime(mockNow, 30 * MIN_IN_MS),
                ackedBy: null,
              },
            ],
          },
        ],
      }),
    ).toEqual('HIGH');
  });
});
