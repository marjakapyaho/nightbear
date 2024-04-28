import { mapSensorEntriesToAnalyserEntries } from 'backend/cronjobs/analyser/analyserUtils';
import { generateSensorEntries } from 'shared/utils/test';
import { AnalyserEntry } from 'shared/types/analyser';
import { MIN_IN_MS } from 'shared/utils/calculations';
import { describe, expect, it } from 'vitest';
import { mockNow } from 'shared/mocks/dates';
import { getTimeMinusTime } from 'shared/utils/time';

describe('utils/analyser-utils', () => {
  const entriesBefore = generateSensorEntries({
    currentTimestamp: mockNow,
    bloodGlucoseHistory: [6, 8.5, 7, 7, 8],
    latestEntryAge: 5,
  });

  const entriesAfter: AnalyserEntry[] = [
    {
      timestamp: getTimeMinusTime(mockNow, 25 * MIN_IN_MS),
      bloodGlucose: 6,
      slope: null,
      rawSlope: null,
    },
    {
      timestamp: getTimeMinusTime(mockNow, 20 * MIN_IN_MS),
      bloodGlucose: 8.5,
      slope: 0.33,
      rawSlope: 2.5,
    },
    {
      timestamp: getTimeMinusTime(mockNow, 15 * MIN_IN_MS),
      bloodGlucose: 7,
      slope: 0.33,
      rawSlope: -1.5,
    },
    {
      timestamp: getTimeMinusTime(mockNow, 10 * MIN_IN_MS),
      bloodGlucose: 7,
      slope: -0.17,
      rawSlope: 0,
    },
    {
      timestamp: getTimeMinusTime(mockNow, 5 * MIN_IN_MS),
      bloodGlucose: 8,
      slope: 1,
      rawSlope: 1,
    },
  ];

  // Assertions
  it('parses correct slopes for analyser entries', () => {
    expect(mapSensorEntriesToAnalyserEntries(entriesBefore)).toEqual(entriesAfter);
  });
});
