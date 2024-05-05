import {
  getMergedBgEntries,
  getRelevantEntries,
  mapSensorAndMeterEntriesToAnalyserEntries,
} from 'backend/cronjobs/analyser/utils';
import { generateSensorEntries } from 'shared/utils/test';
import { MIN_IN_MS } from 'shared/utils/calculations';
import { describe, expect, it } from 'vitest';
import { mockNow } from 'shared/mocks/dates';
import { getTimeMinusTime } from 'shared/utils/time';
import { MeterEntry, SensorEntry } from 'shared/types/timelineEntries';
import { sortBy } from 'lodash';

describe('utils/analyser-utils', () => {
  it('calculates correct slopes for analyser entries', () => {
    const entriesBefore = generateSensorEntries({
      currentTimestamp: mockNow,
      bloodGlucoseHistory: [6, 8.5, 7, 7, 8],
      latestEntryAge: 5,
    });

    // Mapping function also changes entry timestamps to 5 minutes slots
    const timestamp = '2024-04-27T14:15:00.000Z';
    expect(mapSensorAndMeterEntriesToAnalyserEntries(entriesBefore)).toEqual([
      {
        timestamp: getTimeMinusTime(timestamp, 25 * MIN_IN_MS),
        bloodGlucose: 6,
        slope: null,
        rawSlope: null,
      },
      {
        timestamp: getTimeMinusTime(timestamp, 20 * MIN_IN_MS),
        bloodGlucose: 8.5,
        slope: 0.33,
        rawSlope: 2.5,
      },
      {
        timestamp: getTimeMinusTime(timestamp, 15 * MIN_IN_MS),
        bloodGlucose: 7,
        slope: 0.33,
        rawSlope: -1.5,
      },
      {
        timestamp: getTimeMinusTime(timestamp, 10 * MIN_IN_MS),
        bloodGlucose: 7,
        slope: -0.17,
        rawSlope: 0,
      },
      {
        timestamp: getTimeMinusTime(timestamp, 5 * MIN_IN_MS),
        bloodGlucose: 8,
        slope: 1,
        rawSlope: 1,
      },
    ]);
  });

  it('getMergedBgEntries', () => {
    const sensorEntries: SensorEntry[] = generateSensorEntries({
      currentTimestamp: mockNow,
      bloodGlucoseHistory: [4.6, 4.3, 3.8, 4.0, 4.4, 4.8, 5.2, 5.3, 5.5],
    });

    // Preparing for Libre entries
    const extraSensorEntries: SensorEntry[] = [
      {
        timestamp: getTimeMinusTime(mockNow, 17 * MIN_IN_MS),
        bloodGlucose: 5.0,
        type: 'DEXCOM_G6_SHARE',
      },
      {
        timestamp: getTimeMinusTime(mockNow, 22 * MIN_IN_MS),
        bloodGlucose: 4.5,
        type: 'DEXCOM_G6_SHARE',
      },
    ];

    const allEntries = sortBy([...sensorEntries, ...extraSensorEntries], 'timestamp');

    const meterEntries: MeterEntry[] = [
      {
        timestamp: mockNow,
        bloodGlucose: 6.5,
      },
      {
        timestamp: getTimeMinusTime(mockNow, 10 * MIN_IN_MS),
        bloodGlucose: 6.5,
      },
    ];

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
    ]);
  });

  it('hasEnoughData', () => {
    expect(
      getRelevantEntries(
        mockNow,
        mapSensorAndMeterEntriesToAnalyserEntries(
          generateSensorEntries({
            currentTimestamp: mockNow,
            bloodGlucoseHistory: [4.6, 4.3, 3.8, 4.0, 4.4, 4.8, 5.2, 5.3, 5.5],
          }),
        ),
        30,
      ).hasEnoughData,
    ).toBeTruthy();

    expect(
      getRelevantEntries(
        mockNow,
        mapSensorAndMeterEntriesToAnalyserEntries(
          generateSensorEntries({
            currentTimestamp: mockNow,
            bloodGlucoseHistory: [4.6, 4.3, 3.8, 4.4],
          }),
        ),
        30,
      ).hasEnoughData,
    ).toBeFalsy();

    expect(
      getRelevantEntries(
        mockNow,
        mapSensorAndMeterEntriesToAnalyserEntries(
          generateSensorEntries({
            currentTimestamp: mockNow,
            bloodGlucoseHistory: [4.6, 4.3, 5.5, null, null, null, 3.8, 4.0],
          }),
        ),
        30,
      ).hasEnoughData,
    ).toBeFalsy();
  });
});
