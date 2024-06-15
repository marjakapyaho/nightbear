import { SensorEntry } from '../types'
import {
  calculateHba1c,
  calculateRaw,
  calculateTimeHigh,
  calculateTimeInRange,
  calculateTimeLow,
  changeBloodGlucoseUnitToMgdl,
  changeBloodGlucoseUnitToMmoll,
  countSituations,
  getBgAverage,
  isDexcomEntryValid,
  roundTo2Decimals,
  getPercentOfInsulinRemaining,
  getInsulinOnBoard,
  getPercentOfCarbsRemaining,
  getCarbsOnBoard,
  calculateCurrentCarbsToInsulinRatio,
  calculateRequiredCarbsToInsulinRatio,
  HOUR_IN_MS,
  calculateDailyAmounts,
  calculateDailyAverageBgs,
} from './calculations'
import {
  getDateWithoutTime,
  getDateWithoutTimeMs,
  getTimeInMillis,
  getTimeMinusHours,
  getTimeMinusMinutes,
  getTimeMinusTime,
} from './time'
import { describe, expect, it } from 'vitest'
import { mockNow, mockBloodGlucoseEntries, mockCarbEntries } from '../mocks'

const currentTimestamp = 1508672249758

export const sensorEntries1: SensorEntry[] = [
  {
    timestamp: getTimeMinusTime(currentTimestamp, 35),
    bloodGlucose: 6,
    type: 'DEXCOM_G6_SHARE',
  },
  {
    timestamp: getTimeMinusTime(currentTimestamp, 30),
    bloodGlucose: 6,
    type: 'DEXCOM_G6_SHARE',
  },
  {
    timestamp: getTimeMinusTime(currentTimestamp, 25),
    bloodGlucose: 6,
    type: 'DEXCOM_G6_SHARE',
  },
  {
    timestamp: getTimeMinusTime(currentTimestamp, 20),
    bloodGlucose: 8,
    type: 'DEXCOM_G6_SHARE',
  },
  {
    timestamp: getTimeMinusTime(currentTimestamp, 15),
    bloodGlucose: 7,
    type: 'DEXCOM_G6_SHARE',
  },
  {
    timestamp: getTimeMinusTime(currentTimestamp, 10),
    bloodGlucose: 7,
    type: 'DEXCOM_G6_SHARE',
  },
  {
    timestamp: getTimeMinusTime(currentTimestamp, 5),
    bloodGlucose: 8,
    type: 'DEXCOM_G6_SHARE',
  },
]

export const sensorEntries2: SensorEntry[] = [
  {
    timestamp: getTimeMinusTime(currentTimestamp, 35),
    bloodGlucose: 14,
    type: 'DEXCOM_G6_SHARE',
  },
  {
    timestamp: getTimeMinusTime(currentTimestamp, 30),
    bloodGlucose: 11,
    type: 'DEXCOM_G6_SHARE',
  },
  {
    timestamp: getTimeMinusTime(currentTimestamp, 25),
    bloodGlucose: 11.5,
    type: 'DEXCOM_G6_SHARE',
  },
  {
    timestamp: getTimeMinusTime(currentTimestamp, 20),
    bloodGlucose: 12.5,
    type: 'DEXCOM_G6_SHARE',
  },
  {
    timestamp: getTimeMinusTime(currentTimestamp, 15),
    bloodGlucose: 13.1,
    type: 'DEXCOM_G6_SHARE',
  },
  {
    timestamp: getTimeMinusTime(currentTimestamp, 10),
    bloodGlucose: 12,
    type: 'DEXCOM_G6_SHARE',
  },
  {
    timestamp: getTimeMinusTime(currentTimestamp, 5),
    bloodGlucose: 10,
    type: 'DEXCOM_G6_SHARE',
  },
]

describe('@nightbear/shared/calculations', () => {
  it('changeBloodGlucoseUnitToMmoll', () => {
    expect(changeBloodGlucoseUnitToMmoll(160)).toEqual(8.9)
    expect(changeBloodGlucoseUnitToMmoll(60)).toEqual(3.3)
    expect(changeBloodGlucoseUnitToMmoll(450)).toEqual(25.0)
  })

  it('changeBloodGlucoseUnitToMgdl', () => {
    expect(changeBloodGlucoseUnitToMgdl(2.8)).toEqual(50)
    expect(changeBloodGlucoseUnitToMgdl(11.0)).toEqual(198)
    expect(changeBloodGlucoseUnitToMgdl(20.8)).toEqual(374)
  })

  it('calculateRaw', () => {
    const testObj1 = {
      unfiltered: 204960,
      slope: 681.4329083181542,
      intercept: 30000,
      scale: 0.9977203313342593,
    }

    expect(
      calculateRaw(testObj1.unfiltered, testObj1.slope, testObj1.intercept, testObj1.scale),
    ).toEqual(
      14.2, // Dexcom 14.2, old raw 13.3
    )

    const testObj2 = {
      unfiltered: 148224,
      slope: 645.2005532503458,
      intercept: 30000,
      scale: 1,
    }

    expect(
      calculateRaw(testObj2.unfiltered, testObj2.slope, testObj2.intercept, testObj2.scale),
    ).toEqual(
      10.2, // Dexcom 9.8, old raw 9.3
    )

    const testObj3 = {
      unfiltered: 213408,
      slope: 0,
      intercept: 30000,
      scale: 0.9977203313342593,
    }

    expect(
      calculateRaw(testObj3.unfiltered, testObj3.slope, testObj3.intercept, testObj3.scale),
    ).toBeNull()
  })

  it('isDexcomEntryValid', () => {
    expect(isDexcomEntryValid(4, 10)).toEqual(false) // Too much noise, too low bg
    expect(isDexcomEntryValid(2, 10)).toEqual(false) // Too low bg
    expect(isDexcomEntryValid(5, 100)).toEqual(false) // Too much noise
    expect(isDexcomEntryValid(3, 80)).toEqual(true)
  })

  it('roundTo2Decimals', () => {
    expect(roundTo2Decimals(34.0879)).toEqual(34.09)
    expect(roundTo2Decimals(5.9999)).toEqual(6.0)
    expect(roundTo2Decimals(2.457)).toEqual(2.46)
  })

  it('calculateHba1c', () => {
    expect(calculateHba1c(sensorEntries1)).toEqual(5.3278247884519665)
    expect(calculateHba1c(sensorEntries2)).toEqual(8.56326530612245)
  })

  it('calculateTimeInRange', () => {
    expect(calculateTimeInRange(sensorEntries1)).toEqual(100)
    expect(calculateTimeInRange(sensorEntries2)).toEqual(14)
  })

  it('calculateTimeLow', () => {
    expect(calculateTimeLow(sensorEntries1)).toEqual(0)
    expect(calculateTimeLow(sensorEntries2)).toEqual(0)
  })

  it('calculateTimeHigh', () => {
    expect(calculateTimeHigh(sensorEntries1)).toEqual(0)
    expect(calculateTimeHigh(sensorEntries2)).toEqual(86)
  })

  it('countSituations', () => {
    expect(countSituations(sensorEntries1, 7.5, true)).toEqual(2)
    expect(countSituations(sensorEntries2, 13, false)).toEqual(2)
  })

  it('getBgAverage', () => {
    expect(getBgAverage(sensorEntries1)).toEqual('6.9')
    expect(getBgAverage(sensorEntries2)).toEqual('12.0')
  })

  // TODO: check these
  it('calculateDailyAmounts', () => {
    expect(calculateDailyAmounts(mockCarbEntries, 2, getTimeInMillis(mockNow))).toEqual([
      { timestamp: getDateWithoutTimeMs(getTimeInMillis(mockNow) - 24 * HOUR_IN_MS), total: null },
      { timestamp: getDateWithoutTime(mockNow), total: 40 },
    ])
  })

  // TODO: check these
  it('calculateDailyAverageBgs', () => {
    expect(calculateDailyAverageBgs(mockBloodGlucoseEntries, 2, getTimeInMillis(mockNow))).toEqual([
      {
        timestamp: getDateWithoutTimeMs(getTimeInMillis(mockNow) - 24 * HOUR_IN_MS),
        average: null,
      },
      { timestamp: getDateWithoutTime(mockNow), average: 4.855555555555555 },
    ])
  })

  it('getPercentOfInsulinRemaining', () => {
    expect(getPercentOfInsulinRemaining(mockNow, mockNow)).toEqual(1)
    expect(getPercentOfInsulinRemaining(getTimeMinusMinutes(mockNow, 10), mockNow)).toEqual(
      0.984412149586579,
    )
    expect(getPercentOfInsulinRemaining(getTimeMinusMinutes(mockNow, 30), mockNow)).toEqual(
      0.8885478448395222,
    )
    expect(getPercentOfInsulinRemaining(getTimeMinusMinutes(mockNow, 60), mockNow)).toEqual(
      0.6807104906555019,
    )
    expect(getPercentOfInsulinRemaining(getTimeMinusMinutes(mockNow, 120), mockNow)).toEqual(
      0.3143821335622309,
    )
    expect(getPercentOfInsulinRemaining(getTimeMinusMinutes(mockNow, 150), mockNow)).toEqual(
      0.19543068101103533,
    )
    expect(getPercentOfInsulinRemaining(getTimeMinusMinutes(mockNow, 180), mockNow)).toEqual(
      0.11466084114529174,
    )
    expect(getPercentOfInsulinRemaining(getTimeMinusMinutes(mockNow, 240), mockNow)).toEqual(
      0.03158858427303446,
    )
    expect(getPercentOfInsulinRemaining(getTimeMinusMinutes(mockNow, 360), mockNow)).toEqual(0)
    expect(getPercentOfInsulinRemaining(getTimeMinusMinutes(mockNow, 400), mockNow)).toEqual(0)
    expect(getPercentOfInsulinRemaining(getTimeMinusMinutes(mockNow, 800), mockNow)).toEqual(0)
  })

  it('getInsulinOnBoard', () => {
    expect(
      getInsulinOnBoard(mockNow, [
        {
          timestamp: mockNow,
          amount: 7,
          type: 'FAST',
        },
      ]),
    ).toEqual(7)
    expect(
      getInsulinOnBoard(mockNow, [
        {
          timestamp: getTimeMinusMinutes(mockNow, 60),
          amount: 7,
          type: 'FAST',
        },
      ]),
    ).toEqual(4.764973434588514)
    expect(
      getInsulinOnBoard(mockNow, [
        {
          timestamp: getTimeMinusMinutes(mockNow, 120),
          amount: 4,
          type: 'FAST',
        },
      ]),
    ).toEqual(1.2575285342489235)
    expect(
      getInsulinOnBoard(mockNow, [
        {
          timestamp: getTimeMinusMinutes(mockNow, 120),
          amount: 4,
          type: 'FAST',
        },
        {
          timestamp: getTimeMinusMinutes(mockNow, 60),
          amount: 2,
          type: 'FAST',
        },
      ]),
    ).toEqual(2.6189495155599274)
    expect(
      getInsulinOnBoard(mockNow, [
        {
          timestamp: getTimeMinusMinutes(mockNow, 120),
          amount: 4,
          type: 'FAST',
        },
        {
          timestamp: getTimeMinusMinutes(mockNow, 60),
          amount: 2,
          type: 'FAST',
        },
      ]),
    ).toEqual(2.6189495155599274)
    expect(
      getInsulinOnBoard(mockNow, [
        {
          timestamp: getTimeMinusMinutes(mockNow, 180),
          amount: 8,
          type: 'FAST',
        },
        {
          timestamp: getTimeMinusMinutes(mockNow, 120),
          amount: 5,
          type: 'FAST',
        },
        {
          timestamp: getTimeMinusMinutes(mockNow, 60),
          amount: 3,
          type: 'FAST',
        },
      ]),
    ).toEqual(4.531328868939994)
    expect(
      getInsulinOnBoard(mockNow, [
        {
          timestamp: getTimeMinusMinutes(mockNow, 130),
          amount: 23,
          type: 'LONG', // Not counted
        },
        {
          timestamp: getTimeMinusMinutes(mockNow, 120),
          amount: 5,
          type: 'FAST',
        },
        {
          timestamp: getTimeMinusMinutes(mockNow, 60),
          amount: 3,
          type: 'FAST',
        },
      ]),
    ).toEqual(3.61404213977766)
    expect(
      getInsulinOnBoard(mockNow, [
        {
          timestamp: getTimeMinusMinutes(mockNow, 400),
          amount: 9,
          type: 'FAST',
        },
        {
          timestamp: getTimeMinusMinutes(mockNow, 360),
          amount: 9,
          type: 'FAST',
        },
      ]),
    ).toEqual(0)
  })

  it('getPercentOfCarbsRemaining', () => {
    // Different duration factors at 0 hours
    expect(getPercentOfCarbsRemaining(mockNow, mockNow, 1)).toEqual(1)
    expect(getPercentOfCarbsRemaining(mockNow, mockNow, 2)).toEqual(1)
    expect(getPercentOfCarbsRemaining(mockNow, mockNow, 3)).toEqual(1)
    expect(getPercentOfCarbsRemaining(mockNow, mockNow, 4)).toEqual(1)

    // Different duration factors at 1 hour
    expect(getPercentOfCarbsRemaining(getTimeMinusMinutes(mockNow, 60), mockNow, 1)).toEqual(0)
    expect(getPercentOfCarbsRemaining(getTimeMinusMinutes(mockNow, 60), mockNow, 2)).toEqual(
      0.3627927518708771,
    )
    expect(getPercentOfCarbsRemaining(getTimeMinusMinutes(mockNow, 60), mockNow, 3)).toEqual(
      0.6208273667349686,
    )
    expect(getPercentOfCarbsRemaining(getTimeMinusMinutes(mockNow, 60), mockNow, 4)).toEqual(
      0.75383496994724,
    )

    // Different duration factors at 2 hours
    expect(getPercentOfCarbsRemaining(getTimeMinusMinutes(mockNow, 120), mockNow, 1)).toEqual(0)
    expect(getPercentOfCarbsRemaining(getTimeMinusMinutes(mockNow, 120), mockNow, 2)).toEqual(0)
    expect(getPercentOfCarbsRemaining(getTimeMinusMinutes(mockNow, 120), mockNow, 3)).toEqual(
      0.1608677119365367,
    )
    expect(getPercentOfCarbsRemaining(getTimeMinusMinutes(mockNow, 120), mockNow, 4)).toEqual(
      0.3627927518708771,
    )

    // Different duration factors at 3 hours
    expect(getPercentOfCarbsRemaining(getTimeMinusMinutes(mockNow, 180), mockNow, 1)).toEqual(0)
    expect(getPercentOfCarbsRemaining(getTimeMinusMinutes(mockNow, 180), mockNow, 2)).toEqual(0)
    expect(getPercentOfCarbsRemaining(getTimeMinusMinutes(mockNow, 180), mockNow, 3)).toEqual(0)
    expect(getPercentOfCarbsRemaining(getTimeMinusMinutes(mockNow, 180), mockNow, 4)).toEqual(
      0.08942351916577251,
    )

    // Different duration factors at 4 hours
    expect(getPercentOfCarbsRemaining(getTimeMinusMinutes(mockNow, 240), mockNow, 1)).toEqual(0)
    expect(getPercentOfCarbsRemaining(getTimeMinusMinutes(mockNow, 240), mockNow, 2)).toEqual(0)
    expect(getPercentOfCarbsRemaining(getTimeMinusMinutes(mockNow, 240), mockNow, 3)).toEqual(0)
    expect(getPercentOfCarbsRemaining(getTimeMinusMinutes(mockNow, 240), mockNow, 4)).toEqual(0)
  })

  it('getCarbsOnBoard', () => {
    expect(
      getCarbsOnBoard(mockNow, [
        {
          timestamp: mockNow,
          amount: 60,
          durationFactor: 1,
        },
      ]),
    ).toEqual(60)
    expect(
      getCarbsOnBoard(mockNow, [
        {
          timestamp: getTimeMinusMinutes(mockNow, 60),
          amount: 60,
          durationFactor: 1,
        },
      ]),
    ).toEqual(0)
    expect(
      getCarbsOnBoard(mockNow, [
        {
          timestamp: getTimeMinusMinutes(mockNow, 120),
          amount: 60,
          durationFactor: 4,
        },
        {
          timestamp: getTimeMinusMinutes(mockNow, 60),
          amount: 30,
          durationFactor: 2,
        },
      ]),
    ).toEqual(32.65134766837894)
  })

  it('calculateCurrentCarbsToInsulinRatio', () => {
    expect(calculateCurrentCarbsToInsulinRatio(50, 5)).toEqual(10)
    expect(calculateCurrentCarbsToInsulinRatio(50, 10)).toEqual(5)
    expect(calculateCurrentCarbsToInsulinRatio(40, 2)).toEqual(20)
    expect(calculateCurrentCarbsToInsulinRatio(40, 1)).toEqual(40)
    expect(calculateCurrentCarbsToInsulinRatio(80, 2)).toEqual(40)
  })

  it('calculateRequiredCarbsToInsulinRatio', () => {
    expect(calculateRequiredCarbsToInsulinRatio(getTimeMinusHours(mockNow, 3), [], [])).toEqual(
      null,
    )
    // Only entries over 2 hours old are considered
    expect(
      calculateRequiredCarbsToInsulinRatio(
        mockNow,
        [{ timestamp: getTimeMinusHours(mockNow, 1), amount: 70, durationFactor: 4 }],
        [{ timestamp: getTimeMinusHours(mockNow, 1), amount: 7, type: 'FAST' }],
      ),
    ).toEqual(null)
    expect(
      calculateRequiredCarbsToInsulinRatio(
        mockNow,
        [],
        [{ timestamp: getTimeMinusHours(mockNow, 3), amount: 5, type: 'FAST' }],
      ),
    ).toEqual(0)
    expect(
      calculateRequiredCarbsToInsulinRatio(
        mockNow,
        [{ timestamp: getTimeMinusHours(mockNow, 3), amount: 70, durationFactor: 4 }],
        [{ timestamp: getTimeMinusHours(mockNow, 3), amount: 7, type: 'FAST' }],
      ),
    ).toEqual(10)
    expect(
      calculateRequiredCarbsToInsulinRatio(
        mockNow,
        [
          { timestamp: getTimeMinusHours(mockNow, 8), amount: 70, durationFactor: 4 },
          { timestamp: getTimeMinusHours(mockNow, 5), amount: 80, durationFactor: 4 },
          { timestamp: getTimeMinusHours(mockNow, 3), amount: 40, durationFactor: 1 },
        ],
        [
          { timestamp: getTimeMinusHours(mockNow, 8), amount: 3, type: 'FAST' },
          { timestamp: getTimeMinusHours(mockNow, 5), amount: 4, type: 'FAST' },
          { timestamp: getTimeMinusHours(mockNow, 3), amount: 1, type: 'FAST' },
        ],
      ),
    ).toEqual(23.75)
    expect(
      calculateRequiredCarbsToInsulinRatio(
        mockNow,
        [
          { timestamp: getTimeMinusHours(mockNow, 8), amount: 30, durationFactor: 4 },
          { timestamp: getTimeMinusHours(mockNow, 5), amount: 50, durationFactor: 4 },
          { timestamp: getTimeMinusHours(mockNow, 3), amount: 40, durationFactor: 1 },
        ],
        [
          { timestamp: getTimeMinusHours(mockNow, 8), amount: 9, type: 'FAST' },
          { timestamp: getTimeMinusHours(mockNow, 5), amount: 10, type: 'FAST' },
          { timestamp: getTimeMinusHours(mockNow, 3), amount: 6, type: 'FAST' },
        ],
      ),
    ).toEqual(4.8)
  })
})
