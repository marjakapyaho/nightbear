import { runAnalysis } from '../analyser'
import { generateSensorEntries, getMockActiveProfile } from '@nightbear/shared'
import { describe, expect, it } from 'vitest'
import { mockNow } from '@nightbear/shared'
import { getTimeMinusMinutes } from '@nightbear/shared'

const persistentHighValues = [
  9.5, 9.5, 9.4, 9.6, 9.6, 9.4, 9.6, 9.6, 9.4, 9.6, 9.6, 9.5, 9.5, 9.5, 9.4, 9.6, 9.6, 9.5, 9.4,
  9.5, 9.5, 9.4, 9.6, 9.6, 9.6, 9.6, 9.6, 9.6, 9.6, 9.6,
]

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
        meterEntries: [],
        insulinEntries: [],
        carbEntries: [],
        alarms: [],
      }),
    ).toEqual('PERSISTENT_HIGH')
  })

  it('detects PERSISTENT_HIGH without caring about values outside PERSISTENT_HIGH_TIME_WINDOW', () => {
    expect(
      runAnalysis({
        currentTimestamp: mockNow,
        activeProfile: getMockActiveProfile('day'),
        sensorEntries: generateSensorEntries({
          currentTimestamp: mockNow,
          bloodGlucoseHistory: [11.4, ...persistentHighValues],
        }),
        meterEntries: [],
        insulinEntries: [],
        carbEntries: [],
        alarms: [],
      }),
    ).toEqual('PERSISTENT_HIGH')
  })

  it('does not detect PERSISTENT_HIGH with too few entries', () => {
    expect(
      runAnalysis({
        currentTimestamp: mockNow,
        activeProfile: getMockActiveProfile('day'),
        sensorEntries: generateSensorEntries({
          currentTimestamp: mockNow,
          bloodGlucoseHistory: [9.5, 9.5, 9.4, 9.6, 9.6, 9.5, 9.4, 9.5],
        }),
        meterEntries: [],
        insulinEntries: [],
        carbEntries: [],
        alarms: [],
      }),
    ).toEqual('NO_SITUATION')
  })

  it('does not detect PERSISTENT_HIGH when there is even one HIGH value', () => {
    expect(
      runAnalysis({
        currentTimestamp: mockNow,
        activeProfile: getMockActiveProfile('day'),
        sensorEntries: generateSensorEntries({
          currentTimestamp: mockNow,
          bloodGlucoseHistory: [...persistentHighValues, 10.1, 9.5],
        }),
        meterEntries: [],
        insulinEntries: [],
        carbEntries: [],
        alarms: [],
      }),
    ).toEqual('NO_SITUATION')
  })

  it('does not detect PERSISTENT_HIGH when there is even one normal value', () => {
    expect(
      runAnalysis({
        currentTimestamp: mockNow,
        activeProfile: getMockActiveProfile('day'),
        sensorEntries: generateSensorEntries({
          currentTimestamp: mockNow,
          bloodGlucoseHistory: [...persistentHighValues, 7.1],
        }),
        meterEntries: [],
        insulinEntries: [],
        carbEntries: [],
        alarms: [],
      }),
    ).toEqual('NO_SITUATION')
  })

  it('does not detect PERSISTENT_HIGH when insulin on board is above RELEVANT_IOB_LIMIT_FOR_HIGH', () => {
    expect(
      runAnalysis({
        currentTimestamp: mockNow,
        activeProfile: getMockActiveProfile('day'),
        sensorEntries: generateSensorEntries({
          currentTimestamp: mockNow,
          bloodGlucoseHistory: persistentHighValues,
        }),
        meterEntries: [],
        insulinEntries: [
          {
            timestamp: getTimeMinusMinutes(mockNow, 50),
            amount: 3,
            type: 'FAST',
          },
        ],
        carbEntries: [],
        alarms: [],
      }),
    ).toEqual('NO_SITUATION')
  })

  it('detects PERSISTENT_HIGH when insulin on board is below RELEVANT_IOB_LIMIT_FOR_HIGH', () => {
    expect(
      runAnalysis({
        currentTimestamp: mockNow,
        activeProfile: getMockActiveProfile('day'),
        sensorEntries: generateSensorEntries({
          currentTimestamp: mockNow,
          bloodGlucoseHistory: persistentHighValues,
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
    ).toEqual('PERSISTENT_HIGH')
  })

  it('does not detect PERSISTENT_HIGH when slope of last value is down', () => {
    expect(
      runAnalysis({
        currentTimestamp: mockNow,
        activeProfile: getMockActiveProfile('day'),
        sensorEntries: generateSensorEntries({
          currentTimestamp: mockNow,
          bloodGlucoseHistory: [...persistentHighValues, 9.4],
        }),
        meterEntries: [],
        insulinEntries: [],
        carbEntries: [],
        alarms: [],
      }),
    ).toEqual('NO_SITUATION')
  })

  it('detects PERSISTENT_HIGH when insulin on board is above RELEVANT_IOB_LIMIT_FOR_HIGH but there is too much carbs', () => {
    expect(
      runAnalysis({
        currentTimestamp: mockNow,
        activeProfile: getMockActiveProfile('day'),
        sensorEntries: generateSensorEntries({
          currentTimestamp: mockNow,
          bloodGlucoseHistory: persistentHighValues,
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
    ).toEqual('PERSISTENT_HIGH')
  })
})
