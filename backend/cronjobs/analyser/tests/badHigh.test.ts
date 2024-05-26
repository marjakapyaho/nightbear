import { runAnalysis } from '../analyser'
import { generateSensorEntries, getMockActiveProfile } from '@nightbear/shared'
import { describe, expect, it } from 'vitest'
import { mockNow } from '@nightbear/shared'
import { getTimeMinusMinutes } from '@nightbear/shared'

describe('analyser/badHigh', () => {
  it('detects BAD_HIGH', () => {
    expect(
      runAnalysis({
        currentTimestamp: mockNow,
        activeProfile: getMockActiveProfile('day'),
        sensorEntries: generateSensorEntries({
          currentTimestamp: mockNow,
          bloodGlucoseHistory: [13.5, 13.7, 13.9, 14.2],
        }),
        meterEntries: [],
        insulinEntries: [],
        carbEntries: [],
        alarms: [],
      }),
    ).toEqual('BAD_HIGH')
  })

  it('detects BAD_HIGH even when data is outdated if there was no critical outdated', () => {
    expect(
      runAnalysis({
        currentTimestamp: mockNow,
        activeProfile: getMockActiveProfile('day'),
        sensorEntries: generateSensorEntries({
          currentTimestamp: getTimeMinusMinutes(mockNow, 120),
          bloodGlucoseHistory: [20.5, 18.7, 17.5, 15.6],
        }),
        meterEntries: [],
        insulinEntries: [],
        carbEntries: [],
        alarms: [],
      }),
    ).toEqual('BAD_HIGH')
  })
})
