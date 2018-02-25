import 'mocha';
import { assert } from 'chai';
import { MIN_IN_MS, parseAnalyserEntries } from './calculations';
import { AnalyserEntry, SensorEntry } from '../model';

describe('utils/calculations', () => {

  // Mock objects
  const currentTimestamp = 1508672249758;

  const entriesBefore: SensorEntry[] = [
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
      timestamp: currentTimestamp - 20 * MIN_IN_MS,
      bloodGlucose: 8.5,
      slope: 0,
    },
    {
      timestamp: currentTimestamp - 15 * MIN_IN_MS,
      bloodGlucose: 7,
      slope: -1.5,
    },
    {
      timestamp: currentTimestamp - 10 * MIN_IN_MS,
      bloodGlucose: 7,
      slope: 0,
    },
    {
      timestamp: currentTimestamp - 5 * MIN_IN_MS,
      bloodGlucose: 8,
      slope: 1,
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