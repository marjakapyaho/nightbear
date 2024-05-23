import { runAnalysis } from '../analyser';
import { generateSensorEntries, getMockActiveProfile } from 'shared';
import { describe, expect, it } from 'vitest';
import { mockNow } from 'shared';
import { getTimeMinusMinutes, getTimeMinusTime } from 'shared';
import { MIN_IN_MS } from 'shared';

describe('analyser/high', () => {
  it('detects HIGH above high limit', () => {
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

  it('does not clear HIGH above HIGH_CLEARING_THRESHOLD when there is active HIGH alarm', () => {
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
              },
            ],
          },
        ],
      }),
    ).toEqual('HIGH');
  });

  it('clears HIGH below HIGH_CLEARING_THRESHOLD even if there is active HIGH alarm', () => {
    expect(
      runAnalysis({
        currentTimestamp: mockNow,
        activeProfile: getMockActiveProfile('day'),
        sensorEntries: generateSensorEntries({
          currentTimestamp: mockNow,
          bloodGlucoseHistory: [11.5, 10.5, 9.0],
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
              },
            ],
          },
        ],
      }),
    ).toEqual('NO_SITUATION');
  });

  it('does not detect HIGH after BAD_HIGH when we are inside BAD_HIGH_QUARANTINE_WINDOW', () => {
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
              },
            ],
          },
        ],
      }),
    ).toEqual('NO_SITUATION');
  });

  it('detects HIGH after BAD_HIGH when we are outside BAD_HIGH_QUARANTINE_WINDOW', () => {
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
            deactivatedAt: getTimeMinusTime(mockNow, 65 * MIN_IN_MS),
            alarmStates: [
              {
                id: '1',
                timestamp: timestamp30minAgo,
                alarmLevel: 1,
                validAfter: timestamp30minAgo,
              },
            ],
          },
        ],
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

  it('detects HIGH when insulin on board is above RELEVANT_IOB_LIMIT_FOR_HIGH but there is too little insulin for carbs', () => {
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
            amount: 70,
            durationFactor: 1,
          },
        ],
        alarms: [],
      }),
    ).toEqual('HIGH');
  });
});
