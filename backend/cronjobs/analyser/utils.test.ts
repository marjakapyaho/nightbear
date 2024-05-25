import {
  getRelevantEntries,
  mapSensorAndMeterEntriesToAnalyserEntries,
} from '../../cronjobs/analyser/utils';
import { generateSensorEntries } from '@nightbear/shared';
import { MIN_IN_MS } from '@nightbear/shared';
import { describe, expect, it } from 'vitest';
import { mockNow } from '@nightbear/shared';
import { getTimeMinusTime } from '@nightbear/shared';

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
