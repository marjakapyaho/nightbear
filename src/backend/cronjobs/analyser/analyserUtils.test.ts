import { parseAnalyserEntries } from 'backend/cronjobs/analyser/analyserUtils';
import { generateSensorEntries } from 'backend/utils/test';
import { AnalyserEntry } from 'shared/types/analyser';
import { MIN_IN_MS } from 'shared/utils/calculations';
import { describe, expect, it } from 'vitest';

describe('utils/analyser-utils', () => {
  const currentTimestamp = 1508672249758;

  const entriesBefore = generateSensorEntries({
    currentTimestamp: currentTimestamp,
    bloodGlucoseHistory: [6, 8.5, 7, 7, 8],
    latestEntryAge: 5,
  });

  const entriesAfter: AnalyserEntry[] = [
    {
      timestamp: new Date(currentTimestamp - 25 * MIN_IN_MS).toISOString(),
      bloodGlucose: 6,
      slope: null,
      rawSlope: null,
    },
    {
      timestamp: new Date(currentTimestamp - 20 * MIN_IN_MS).toISOString(),
      bloodGlucose: 8.5,
      slope: 0.33,
      rawSlope: 2.5,
    },
    {
      timestamp: new Date(currentTimestamp - 15 * MIN_IN_MS).toISOString(),
      bloodGlucose: 7,
      slope: 0.33,
      rawSlope: -1.5,
    },
    {
      timestamp: new Date(currentTimestamp - 10 * MIN_IN_MS).toISOString(),
      bloodGlucose: 7,
      slope: -0.17,
      rawSlope: 0,
    },
    {
      timestamp: new Date(currentTimestamp - 5 * MIN_IN_MS).toISOString(),
      bloodGlucose: 8,
      slope: 1,
      rawSlope: 1,
    },
  ];

  // Assertions
  it('parses correct slopes for analyser entries', () => {
    expect(parseAnalyserEntries(entriesBefore)).toEqual(entriesAfter);
  });
});
