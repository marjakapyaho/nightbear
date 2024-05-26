import { runAnalysis } from '../analyser'
import { generateSensorEntries, getMockActiveProfile } from '@nightbear/shared'
import { describe, expect, it } from 'vitest'
import { mockNow } from '@nightbear/shared'
import { getTimeMinusMinutes } from '@nightbear/shared'

describe('analyser/badLow', () => {
  it('detects BAD_LOW', () => {
    expect(
      runAnalysis({
        currentTimestamp: mockNow,
        activeProfile: getMockActiveProfile('day'),
        sensorEntries: generateSensorEntries({
          currentTimestamp: mockNow,
          bloodGlucoseHistory: [4, 4.5, 3.5, 2.9],
        }),
        meterEntries: [],
        insulinEntries: [],
        carbEntries: [],
        alarms: [],
      }),
    ).toEqual('BAD_LOW')
  })

  it('detects BAD_LOW even when data is outdated if there was no critical outdated', () => {
    expect(
      runAnalysis({
        currentTimestamp: mockNow,
        activeProfile: getMockActiveProfile('day'),
        sensorEntries: generateSensorEntries({
          currentTimestamp: getTimeMinusMinutes(mockNow, 120),
          bloodGlucoseHistory: [2.0, 1.9, 2.2, 2.5, 2.9],
        }),
        meterEntries: [],
        insulinEntries: [],
        carbEntries: [],
        alarms: [],
      }),
    ).toEqual('BAD_LOW')
  })
})
