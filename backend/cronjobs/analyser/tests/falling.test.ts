import { runAnalysis } from '../analyser';
import { generateSensorEntries, getMockActiveProfile } from 'shared';
import { describe, expect, it } from 'vitest';
import { mockNow } from 'shared';
import { getTimeMinusMinutes } from 'shared';

describe('analyser/falling', () => {
  it('detects FALLING', () => {
    expect(
      runAnalysis({
        currentTimestamp: mockNow,
        activeProfile: getMockActiveProfile('day'),
        sensorEntries: generateSensorEntries({
          currentTimestamp: mockNow,
          bloodGlucoseHistory: [9, 8.5, 8.2, 7.3, 6.5, 5.8],
        }),
        meterEntries: [],
        insulinEntries: [],
        carbEntries: [],
        alarms: [],
      }),
    ).toEqual('FALLING');
  });

  it('does not detect FALLING above relative low limit', () => {
    expect(
      runAnalysis({
        currentTimestamp: mockNow,
        activeProfile: getMockActiveProfile('day'),
        sensorEntries: generateSensorEntries({
          currentTimestamp: mockNow,
          bloodGlucoseHistory: [9, 8.5, 7.6, 6.8, 6.1],
        }),
        meterEntries: [],
        insulinEntries: [],
        carbEntries: [],
        alarms: [],
      }),
    ).toEqual('NO_SITUATION');
  });

  it('does not detect FALLING below absolute low limit (detects LOW)', () => {
    expect(
      runAnalysis({
        currentTimestamp: mockNow,
        activeProfile: getMockActiveProfile('day'),
        sensorEntries: generateSensorEntries({
          currentTimestamp: mockNow,
          bloodGlucoseHistory: [8.2, 7.3, 6.5, 5.8, 5.4, 4.7, 4.2, 3.5],
        }),
        meterEntries: [],
        insulinEntries: [],
        carbEntries: [],
        alarms: [],
      }),
    ).toEqual('LOW');
  });

  it('does not detect FALLING if slope is too small and predicted situation is not bad', () => {
    expect(
      runAnalysis({
        currentTimestamp: mockNow,
        activeProfile: getMockActiveProfile('day'),
        sensorEntries: generateSensorEntries({
          currentTimestamp: mockNow,
          bloodGlucoseHistory: [6.5, 6.3, 6.1, 5.8, 5.5, 5.2],
        }),
        meterEntries: [],
        insulinEntries: [],
        carbEntries: [],
        alarms: [],
      }),
    ).toEqual('NO_SITUATION');
  });

  it('detects FALLING if slope is too small but predicted situation is bad', () => {
    expect(
      runAnalysis({
        currentTimestamp: mockNow,
        activeProfile: getMockActiveProfile('day'),
        sensorEntries: generateSensorEntries({
          currentTimestamp: mockNow,
          bloodGlucoseHistory: [6.5, 6.3, 6.1, 5.8, 5.5, 5.2, 4.9],
        }),
        meterEntries: [],
        insulinEntries: [],
        carbEntries: [],
        alarms: [],
      }),
    ).toEqual('FALLING');
  });

  it('does not detect FALLING if slope is too small and predicted situation is bad but latest entry slope is not negative', () => {
    expect(
      runAnalysis({
        currentTimestamp: mockNow,
        activeProfile: getMockActiveProfile('day'),
        sensorEntries: generateSensorEntries({
          currentTimestamp: mockNow,
          bloodGlucoseHistory: [6.5, 6.3, 6.1, 5.8, 5.5, 5.2, 4.9, 4.9],
        }),
        meterEntries: [],
        insulinEntries: [],
        carbEntries: [],
        alarms: [],
      }),
    ).toEqual('NO_SITUATION');
  });

  it('does not detect FALLING if there are correction carbs within LOW_CORRECTION_SUPPRESSION_WINDOW', () => {
    expect(
      runAnalysis({
        currentTimestamp: mockNow,
        activeProfile: getMockActiveProfile('day'),
        sensorEntries: generateSensorEntries({
          currentTimestamp: mockNow,
          bloodGlucoseHistory: [9, 8.5, 8.2, 7.3, 6.5, 5.8],
        }),
        meterEntries: [],
        insulinEntries: [],
        carbEntries: [
          {
            timestamp: getTimeMinusMinutes(mockNow, 15),
            amount: 30,
            durationFactor: 1,
          },
        ],
        alarms: [],
      }),
    ).toEqual('NO_SITUATION');
  });

  it('detects FALLING if there are correction carbs outside LOW_CORRECTION_SUPPRESSION_WINDOW', () => {
    expect(
      runAnalysis({
        currentTimestamp: mockNow,
        activeProfile: getMockActiveProfile('day'),
        sensorEntries: generateSensorEntries({
          currentTimestamp: mockNow,
          bloodGlucoseHistory: [9, 8.5, 8.2, 7.3, 6.5, 5.8],
        }),
        meterEntries: [],
        insulinEntries: [],
        carbEntries: [
          {
            timestamp: getTimeMinusMinutes(mockNow, 30),
            amount: 30,
            durationFactor: 1,
          },
        ],
        alarms: [],
      }),
    ).toEqual('FALLING');
  });

  it('detects FALLING if there are correction carbs inside LOW_CORRECTION_SUPPRESSION_WINDOW but too much insulin', () => {
    expect(
      runAnalysis({
        currentTimestamp: mockNow,
        activeProfile: getMockActiveProfile('day'),
        sensorEntries: generateSensorEntries({
          currentTimestamp: mockNow,
          bloodGlucoseHistory: [9, 8.5, 8.2, 7.3, 6.5, 5.8],
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
    ).toEqual('FALLING');
  });
});
