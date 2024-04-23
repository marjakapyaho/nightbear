import { runAnalysis } from 'backend/cronjobs/analyser/analyser';
import { generateSensorEntries, getMockActiveProfile } from 'shared/utils/test';
import { describe, expect, it } from 'vitest';
import { mockNow } from 'shared/mocks/dates';
import { getTimeAsISOStr, getTimeSubtractedFrom } from 'shared/utils/time';
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
        insulinEntries: [],
        carbEntries: [],
        alarms: [],
      }),
    ).toEqual('HIGH');
  });

  it('does not detect HIGH with recent insulin', () => {
    expect(
      runAnalysis({
        currentTimestamp: mockNow,
        activeProfile: getMockActiveProfile('day'),
        sensorEntries: generateSensorEntries({
          currentTimestamp: mockNow,
          bloodGlucoseHistory: [9.0, 9.5, 9.6, 9.8, 10.1],
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

  it('detects HIGH when insulin suppression window is over', () => {
    expect(
      runAnalysis({
        currentTimestamp: mockNow,
        activeProfile: getMockActiveProfile('day'),
        sensorEntries: generateSensorEntries({
          currentTimestamp: mockNow,
          bloodGlucoseHistory: [9.0, 9.5, 9.6, 9.8, 10.1],
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
    ).toEqual('HIGH');
  });

  it('does not detect HIGH when coming down from BAD_HIGH', () => {
    expect(
      runAnalysis({
        currentTimestamp: mockNow,
        activeProfile: getMockActiveProfile('day'),
        sensorEntries: generateSensorEntries({
          currentTimestamp: mockNow,
          bloodGlucoseHistory: [15.5, 14.5, 14.1, 13.5],
        }),
        insulinEntries: [],
        carbEntries: [],
        alarms: [
          {
            id: '1234',
            timestamp: getTimeAsISOStr(getTimeSubtractedFrom(mockNow, 30 * MIN_IN_MS)),
            situation: 'BAD_HIGH',
            isActive: false,
            deactivatedAt: getTimeAsISOStr(getTimeSubtractedFrom(mockNow, 5 * MIN_IN_MS)),
            alarmStates: [
              {
                alarmLevel: 1,
                validAfterTimestamp: getTimeAsISOStr(
                  getTimeSubtractedFrom(mockNow, 30 * MIN_IN_MS),
                ),
                ackedBy: null,
                pushoverReceipts: [],
              },
            ],
          },
        ],
      }),
    ).toEqual(null);
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
        insulinEntries: [],
        carbEntries: [],
        alarms: [
          {
            id: '1234',
            timestamp: getTimeAsISOStr(getTimeSubtractedFrom(mockNow, 30 * MIN_IN_MS)),
            situation: 'HIGH',
            isActive: true,
            deactivatedAt: null,
            alarmStates: [
              {
                alarmLevel: 1,
                validAfterTimestamp: getTimeAsISOStr(
                  getTimeSubtractedFrom(mockNow, 30 * MIN_IN_MS),
                ),
                ackedBy: null,
                pushoverReceipts: [],
              },
            ],
          },
        ],
      }),
    ).toEqual('HIGH');
  });
});
