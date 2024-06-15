import { runAnalysis } from '../analyser'
import { generateSensorEntries, getMockActiveProfile, mockNow } from '@nightbear/shared'
import { describe, expect, it } from 'vitest'

describe('analyser/noSituation', () => {
  it('detects no situation', () => {
    expect(
      runAnalysis({
        currentTimestamp: mockNow,
        activeProfile: getMockActiveProfile('day'),
        sensorEntries: generateSensorEntries({
          currentTimestamp: mockNow,
          bloodGlucoseHistory: [8.5, 7, 7, 8],
        }),
        meterEntries: [],
        insulinEntries: [],
        carbEntries: [],
        alarms: [],
      }),
    ).toEqual('NO_SITUATION')
  })
})
