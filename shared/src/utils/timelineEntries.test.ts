import { sortBy } from 'lodash'
import { HOUR_IN_MS, MIN_IN_MS } from './const'
import { describe, expect, it } from 'vitest'
import { mockNow, mockTimelineEntries } from '../mocks'
import { MeterEntry, SensorEntry } from '../types'
import { generateSensorEntries } from './test'
import { getTimeMinusTime } from './time'
import { getMergedBgEntries, mapTimelineEntriesToGraphPoints } from './timelineEntries'

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
    expect(mapTimelineEntriesToGraphPoints(mockTimelineEntries(), HOUR_IN_MS, mockNow)).toEqual([
      {
        isoTimestamp: '2024-04-27T13:20:00.000Z',
        timestamp: 1714224000000,
        val: null,
        color: 'white',
        sensorEntries: [],
        profileActivations: [],
        alarms: [],
      },
      {
        isoTimestamp: '2024-04-27T13:25:00.000Z',
        timestamp: 1714224300000,
        val: null,
        color: 'white',
        sensorEntries: [],
        profileActivations: [],
        alarms: [],
      },
      {
        isoTimestamp: '2024-04-27T13:30:00.000Z',
        timestamp: 1714224600000,
        val: null,
        color: 'white',
        sensorEntries: [],
        profileActivations: [],
        alarms: [],
      },
      {
        isoTimestamp: '2024-04-27T13:35:00.000Z',
        timestamp: 1714224900000,
        val: 4.6,
        color: '#54c87e',
        sensorEntries: [
          {
            bloodGlucose: 4.6,
            timestamp: '2024-04-27T13:35:00.000Z',
            type: 'DEXCOM_G6_SHARE',
          },
        ],
        profileActivations: [],
        alarms: [],
      },
      {
        isoTimestamp: '2024-04-27T13:40:00.000Z',
        timestamp: 1714225200000,
        val: 4.3,
        color: '#54c87e',
        sensorEntries: [
          {
            bloodGlucose: 4.3,
            timestamp: '2024-04-27T13:40:00.000Z',
            type: 'DEXCOM_G6_SHARE',
          },
        ],
        profileActivations: [],
        alarms: [],
      },
      {
        isoTimestamp: '2024-04-27T13:45:00.000Z',
        timestamp: 1714225500000,
        val: 3.8,
        color: '#ee5a36',
        sensorEntries: [
          {
            bloodGlucose: 3.8,
            timestamp: '2024-04-27T13:45:00.000Z',
            type: 'DEXCOM_G6_SHARE',
          },
        ],
        profileActivations: [],
        alarms: [],
      },
      {
        isoTimestamp: '2024-04-27T13:50:00.000Z',
        timestamp: 1714225800000,
        val: 4.3,
        color: '#54c87e',
        sensorEntries: [
          {
            bloodGlucose: 2.1,
            timestamp: '2024-04-27T13:50:00.000Z',
            type: 'DEXCOM_G6_SHARE',
          },
        ],
        meterEntry: { timestamp: '2024-04-27T13:50:00.000Z', bloodGlucose: 6.5 },
        profileActivations: [],
        alarms: [],
      },
      {
        isoTimestamp: '2024-04-27T13:55:00.000Z',
        timestamp: 1714226100000,
        val: 4.7,
        color: '#54c87e',
        sensorEntries: [
          {
            bloodGlucose: 4.7,
            timestamp: '2024-04-27T13:55:00.000Z',
            type: 'DEXCOM_G6_SHARE',
          },
        ],
        profileActivations: [],
        alarms: [],
      },
      {
        isoTimestamp: '2024-04-27T14:00:00.000Z',
        timestamp: 1714226400000,
        val: 4.8,
        color: '#54c87e',
        sensorEntries: [
          {
            bloodGlucose: 4.8,
            timestamp: '2024-04-27T14:00:00.000Z',
            type: 'DEXCOM_G6_SHARE',
          },
        ],
        carbEntry: {
          timestamp: '2024-04-27T14:00:00.000Z',
          amount: 40,
          durationFactor: 1,
        },
        profileActivations: [],
        alarms: [],
      },
      {
        isoTimestamp: '2024-04-27T14:05:00.000Z',
        timestamp: 1714226700000,
        val: 5.9,
        color: '#54c87e',
        sensorEntries: [
          {
            bloodGlucose: 5.9,
            timestamp: '2024-04-27T14:05:00.000Z',
            type: 'DEXCOM_G6_SHARE',
          },
        ],
        profileActivations: [],
        alarms: [],
      },
      {
        isoTimestamp: '2024-04-27T14:10:00.000Z',
        timestamp: 1714227000000,
        val: 5.3,
        color: '#54c87e',
        sensorEntries: [
          {
            bloodGlucose: 5.3,
            timestamp: '2024-04-27T14:10:00.000Z',
            type: 'DEXCOM_G6_SHARE',
          },
        ],
        profileActivations: [],
        alarms: [],
      },
      {
        isoTimestamp: '2024-04-27T14:15:00.000Z',
        timestamp: 1714227300000,
        val: 6,
        color: '#54c87e',
        sensorEntries: [
          {
            bloodGlucose: 6,
            timestamp: '2024-04-27T14:15:00.000Z',
            type: 'DEXCOM_G6_SHARE',
          },
        ],
        insulinEntry: { timestamp: '2024-04-27T14:15:00.000Z', amount: 7, type: 'FAST' },
        profileActivations: [],
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
      },
    ])
  })
})
