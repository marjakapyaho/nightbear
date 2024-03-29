import { assert } from 'chai';
import { parseAnalyserEntries } from 'shared/analyser/analyser-utils';
import { MIN_IN_MS } from 'shared/calculations/calculations';
import { AnalyserEntry, SensorEntry } from 'shared/models/model';
import 'mocha';
import { generateUuid } from 'shared/utils/id';

describe('utils/analyser-utils', () => {
  // Mock objects
  const currentTimestamp = 1508672249758;

  const entriesBefore: SensorEntry[] = [
    {
      modelType: 'DexcomG6SensorEntry',
      modelUuid: generateUuid(),
      timestamp: currentTimestamp - 25 * MIN_IN_MS,
      bloodGlucose: 6,
      direction: '',
    },
    {
      modelType: 'DexcomG6SensorEntry',
      modelUuid: generateUuid(),
      timestamp: currentTimestamp - 20 * MIN_IN_MS,
      bloodGlucose: 8.5,
      direction: '',
    },
    {
      modelType: 'DexcomG6SensorEntry',
      modelUuid: generateUuid(),
      timestamp: currentTimestamp - 15 * MIN_IN_MS,
      bloodGlucose: 7,
      direction: '',
    },
    {
      modelType: 'DexcomG6SensorEntry',
      modelUuid: generateUuid(),
      timestamp: currentTimestamp - 10 * MIN_IN_MS,
      bloodGlucose: 7,
      direction: '',
    },
    {
      modelType: 'DexcomG6SensorEntry',
      modelUuid: generateUuid(),
      timestamp: currentTimestamp - 5 * MIN_IN_MS,
      bloodGlucose: 8,
      direction: '',
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
