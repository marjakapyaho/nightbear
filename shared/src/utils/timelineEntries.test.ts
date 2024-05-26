import { MeterEntry, SensorEntry } from '../types'
import { generateSensorEntries } from './test'
import { mockNow, mockNowSlot } from '../mocks'
import { getTimeInMillis, getTimeMinusMinutes, getTimeMinusTime } from './time'
import { HOUR_IN_MS, MIN_IN_MS } from './calculations'
import { getMergedBgEntries, mapTimelineEntriesToGraphPoints } from './timelineEntries'
import { describe, expect, it } from 'vitest'
import { sortBy } from 'lodash'
import { mockTimelineEntries } from '../mocks'

describe('../calculations', () => {
  it('getMergedBgEntries', () => {
    const sensorEntries: SensorEntry[] = generateSensorEntries({
      currentTimestamp: mockNow,
      bloodGlucoseHistory: [4.6, 4.3, 3.8, 4.0, 4.4, 4.8, 5.2, 5.3, 5.5],
    })

    // Preparing for Libre entries
    const extraSensorEntries: SensorEntry[] = [
      {
        timestamp: getTimeMinusTime(mockNow, 17 * MIN_IN_MS),
        bloodGlucose: 5.0,
        type: 'LIBRE_3_LINK',
      },
      {
        timestamp: getTimeMinusTime(mockNow, 22 * MIN_IN_MS),
        bloodGlucose: 4.5,
        type: 'LIBRE_3_LINK',
      },
    ]

    const allEntries = sortBy([...sensorEntries, ...extraSensorEntries], 'timestamp')

    const meterEntries: MeterEntry[] = [
      {
        timestamp: mockNow,
        bloodGlucose: 6.5,
      },
      {
        timestamp: getTimeMinusTime(mockNow, 10 * MIN_IN_MS),
        bloodGlucose: 6.5,
      },
    ]

    expect(getMergedBgEntries(allEntries, meterEntries)).toEqual([
      { bloodGlucose: 4.6, timestamp: '2024-04-27T13:35:00.000Z' },
      { bloodGlucose: 4.3, timestamp: '2024-04-27T13:40:00.000Z' },
      { bloodGlucose: 3.8, timestamp: '2024-04-27T13:45:00.000Z' },
      { bloodGlucose: 4.3, timestamp: '2024-04-27T13:50:00.000Z' }, // Average of 4.0 and 4.5
      { bloodGlucose: 4.7, timestamp: '2024-04-27T13:55:00.000Z' }, // Average of 4.4 and 5.0
      { bloodGlucose: 4.8, timestamp: '2024-04-27T14:00:00.000Z' },
      { bloodGlucose: 5.9, timestamp: '2024-04-27T14:05:00.000Z' }, // Average of 5.2 and 6.5 (rounded)
      { bloodGlucose: 5.3, timestamp: '2024-04-27T14:10:00.000Z' },
      { bloodGlucose: 6, timestamp: '2024-04-27T14:15:00.000Z' }, // Average of 5.5 and 6.5
    ])
    expect(getMergedBgEntries([], [])).toEqual([])
  })

  it('mapTimelineEntriesToGraphPoints', () => {
    expect(mapTimelineEntriesToGraphPoints(mockTimelineEntries, HOUR_IN_MS, mockNow)).toEqual([
      {
        isoTimestamp: getTimeMinusMinutes(mockNowSlot, 55),
        timestamp: getTimeInMillis(getTimeMinusMinutes(mockNowSlot, 55)),
        val: null,
        color: 'white',
        alarms: [],
        profileActivations: [],
      },
      {
        isoTimestamp: getTimeMinusMinutes(mockNowSlot, 50),
        timestamp: getTimeInMillis(getTimeMinusMinutes(mockNowSlot, 50)),
        val: null,
        color: 'white',
        alarms: [],
        profileActivations: [],
      },
      {
        isoTimestamp: getTimeMinusMinutes(mockNowSlot, 45),
        timestamp: getTimeInMillis(getTimeMinusMinutes(mockNowSlot, 45)),
        val: null,
        color: 'white',
        alarms: [],
        profileActivations: [],
      },
      {
        isoTimestamp: getTimeMinusMinutes(mockNowSlot, 40),
        timestamp: getTimeInMillis(getTimeMinusMinutes(mockNowSlot, 40)),
        val: 4.6,
        color: '#54c87e',
        alarms: [],
        profileActivations: [],
      },
      {
        isoTimestamp: getTimeMinusMinutes(mockNowSlot, 35),
        timestamp: getTimeInMillis(getTimeMinusMinutes(mockNowSlot, 35)),
        val: 4.3,
        color: '#54c87e',
        alarms: [],
        profileActivations: [],
      },
      {
        isoTimestamp: getTimeMinusMinutes(mockNowSlot, 30),
        timestamp: getTimeInMillis(getTimeMinusMinutes(mockNowSlot, 30)),
        val: 3.8,
        color: '#ee5a36',
        alarms: [],
        profileActivations: [],
      },
      {
        isoTimestamp: getTimeMinusMinutes(mockNowSlot, 25),
        timestamp: getTimeInMillis(getTimeMinusMinutes(mockNowSlot, 25)),
        val: 4.3,
        color: '#54c87e',
        meterEntry: {
          timestamp: getTimeMinusMinutes(mockNowSlot, 25),
          bloodGlucose: 6.5,
        },
        alarms: [],
        profileActivations: [],
      },
      {
        isoTimestamp: getTimeMinusMinutes(mockNowSlot, 20),
        timestamp: getTimeInMillis(getTimeMinusMinutes(mockNowSlot, 20)),
        val: 4.7,
        color: '#54c87e',
        alarms: [],
        profileActivations: [],
      },
      {
        isoTimestamp: getTimeMinusMinutes(mockNowSlot, 15),
        timestamp: getTimeInMillis(getTimeMinusMinutes(mockNowSlot, 15)),
        val: 4.8,
        color: '#54c87e',
        carbEntry: {
          timestamp: getTimeMinusMinutes(mockNowSlot, 15),
          amount: 40,
          durationFactor: 1,
        },
        alarms: [],
        profileActivations: [],
      },
      {
        isoTimestamp: getTimeMinusMinutes(mockNowSlot, 10),
        timestamp: getTimeInMillis(getTimeMinusMinutes(mockNowSlot, 10)),
        val: 5.9,
        color: '#54c87e',
        alarms: [],
        profileActivations: [],
      },
      {
        isoTimestamp: getTimeMinusMinutes(mockNowSlot, 5),
        timestamp: getTimeInMillis(getTimeMinusMinutes(mockNowSlot, 5)),
        val: 5.3,
        color: '#54c87e',
        alarms: [],
        profileActivations: [],
      },
      {
        isoTimestamp: mockNowSlot,
        timestamp: getTimeInMillis(mockNowSlot),
        val: 6,
        color: '#54c87e',
        insulinEntry: { timestamp: mockNowSlot, amount: 7, type: 'FAST' },
        alarms: [
          {
            id: '1',
            isActive: true,
            situation: 'LOW',
            alarmStates: [
              {
                id: '1',
                alarmLevel: 0,
                timestamp: '2024-04-27T14:16:26.317Z',
                validAfter: '2024-04-27T14:16:26.317Z',
              },
            ],
          },
        ],
        profileActivations: [],
      },
    ])
  })
})
