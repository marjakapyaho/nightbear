import 'mocha';
import { assert } from 'chai';
import { parseAnalyserEntries } from './analyser-utils';
import { MIN_IN_MS } from '../calculations/calculations';
import { AnalyserEntry, SensorEntry } from 'nightbear/core/models/model';

describe('utils/analyser-utils', () => {

  // Mock objects
  const currentTimestamp = 1508672249758;

  const entriesBefore: SensorEntry[] = [
    {
      modelType: 'DexcomSensorEntry',
      timestamp: currentTimestamp - 25 * MIN_IN_MS,
      bloodGlucose: 6,
      signalStrength: 1,
      noiseLevel: 1,
    },
    {
      modelType: 'DexcomSensorEntry',
      timestamp: currentTimestamp - 20 * MIN_IN_MS,
      bloodGlucose: 8.5,
      signalStrength: 1,
      noiseLevel: 1,
    },
    {
      modelType: 'DexcomSensorEntry',
      timestamp: currentTimestamp - 15 * MIN_IN_MS,
      bloodGlucose: 7,
      signalStrength: 1,
      noiseLevel: 1,
    },
    {
      modelType: 'DexcomSensorEntry',
      timestamp: currentTimestamp - 10 * MIN_IN_MS,
      bloodGlucose: 7,
      signalStrength: 1,
      noiseLevel: 1,
    },
    {
      modelType: 'DexcomSensorEntry',
      timestamp: currentTimestamp - 5 * MIN_IN_MS,
      bloodGlucose: 8,
      signalStrength: 1,
      noiseLevel: 1,
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

  // Assertations
  it('parses correct slopes for analyser entries', () => {
    assert.deepEqual(
      parseAnalyserEntries(entriesBefore),
      entriesAfter,
    );
  });

});
