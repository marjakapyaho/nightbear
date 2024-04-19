import { parseAnalyserEntries } from 'backend/cronjobs/analyser/analyserUtils';
import { AnalyserEntry } from 'shared/types/analyser';
import { SensorEntry } from 'shared/types/timelineEntries';
import { MIN_IN_MS } from 'shared/utils/calculations';

describe('utils/analyser-utils', () => {
  const currentTimestamp = 1508672249758;

  const entriesBefore: SensorEntry[] = [
    {
      timestamp: currentTimestamp - 25 * MIN_IN_MS,
      bloodGlucose: 6,
    },
    {
      timestamp: currentTimestamp - 20 * MIN_IN_MS,
      bloodGlucose: 8.5,
    },
    {
      timestamp: currentTimestamp - 15 * MIN_IN_MS,
      bloodGlucose: 7,
    },
    {
      timestamp: currentTimestamp - 10 * MIN_IN_MS,
      bloodGlucose: 7,
    },
    {
      timestamp: currentTimestamp - 5 * MIN_IN_MS,
      bloodGlucose: 8,
    },
  ];

  const entriesAfter: AnalyserEntry[] = [
    {
      timestamp: currentTimestamp - 25 * MIN_IN_MS,
      bloodGlucose: 6,
      slope: null,
      rawSlope: null,
    },
    {
      timestamp: currentTimestamp - 20 * MIN_IN_MS,
      bloodGlucose: 8.5,
      slope: 0.33,
      rawSlope: 2.5,
    },
    {
      timestamp: currentTimestamp - 15 * MIN_IN_MS,
      bloodGlucose: 7,
      slope: 0.33,
      rawSlope: -1.5,
    },
    {
      timestamp: currentTimestamp - 10 * MIN_IN_MS,
      bloodGlucose: 7,
      slope: -0.17,
      rawSlope: 0,
    },
    {
      timestamp: currentTimestamp - 5 * MIN_IN_MS,
      bloodGlucose: 8,
      slope: 1,
      rawSlope: 1,
    },
  ];

  // Assertions
  it('parses correct slopes for analyser entries', () => {
    assert.deepEqual(parseAnalyserEntries(entriesBefore), entriesAfter);
  });
});
