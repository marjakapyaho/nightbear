import { runAnalysis } from 'backend/cronjobs/analyser/analyser';
import { generateSensorEntries, getMockActiveProfile } from 'shared/utils/test';
import { describe, expect, it } from 'vitest';
import { mockNow } from 'shared/mocks/dates';
import { getTimeAsISOStr, getTimeSubtractedFrom } from 'shared/utils/time';
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
        insulinEntries: [],
        carbEntries: [],
        alarms: [],
      }),
    ).toEqual('LOW');
  });

  it('does not detect LOW when there are correction carbs near enough', () => {
    expect(
      runAnalysis({
        currentTimestamp: mockNow,
        activeProfile: getMockActiveProfile('day'),
        sensorEntries: generateSensorEntries({
          currentTimestamp: mockNow,
          bloodGlucoseHistory: [6, 5, 4.7, 3.8],
        }),
        insulinEntries: [],
        carbEntries: [
          {
            timestamp: getTimeAsISOStr(getTimeSubtractedFrom(mockNow, 15 * MIN_IN_MS)),
            amount: 30,
            speedFactor: 1,
          },
        ],
        alarms: [],
      }),
    ).toEqual(null);
  });

  it('detects LOW when low correction suppression window is over', () => {
    expect(
      runAnalysis({
        currentTimestamp: mockNow,
        activeProfile: getMockActiveProfile('day'),
        sensorEntries: generateSensorEntries({
          currentTimestamp: mockNow,
          bloodGlucoseHistory: [6, 5, 4.7, 3.8],
        }),
        insulinEntries: [],
        carbEntries: [
          {
            timestamp: getTimeAsISOStr(getTimeSubtractedFrom(mockNow, 35 * MIN_IN_MS)),
            amount: 30,
            speedFactor: 1,
          },
        ],
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
        insulinEntries: [],
        carbEntries: [],
        alarms: [
          {
            id: '123',
            situation: 'BAD_LOW',
            isActive: false,
            deactivatedAt: getTimeAsISOStr(getTimeSubtractedFrom(mockNow, 10 * MIN_IN_MS)),
            alarmStates: [
              {
                id: '1',
                timestamp: getTimeAsISOStr(getTimeSubtractedFrom(mockNow, 40 * MIN_IN_MS)),
                alarmLevel: 1,
                validAfter: getTimeAsISOStr(getTimeSubtractedFrom(mockNow, 40 * MIN_IN_MS)),
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
                timestamp: getTimeAsISOStr(getTimeSubtractedFrom(mockNow, 30 * MIN_IN_MS)),
                alarmLevel: 1,
                validAfter: getTimeAsISOStr(getTimeSubtractedFrom(mockNow, 30 * MIN_IN_MS)),
                ackedBy: null,
              },
            ],
          },
        ],
      }),
    ).toEqual('LOW');
  });
});
