import { MIN_IN_MS } from '../../calculations/calculations';
import { DexcomSensorEntry } from 'nightbear/core/models/model';

export function entriesHigh(currentTimestamp: number): DexcomSensorEntry[] {
  return [
    {
      modelType: 'DexcomSensorEntry',
      timestamp: currentTimestamp - 20 * MIN_IN_MS,
      bloodGlucose: 14,
      signalStrength: 1,
      noiseLevel: 1,
    },
    {
      modelType: 'DexcomSensorEntry',
      timestamp: currentTimestamp - 15 * MIN_IN_MS,
      bloodGlucose: 14.8,
      signalStrength: 1,
      noiseLevel: 1,
    },
    {
      modelType: 'DexcomSensorEntry',
      timestamp: currentTimestamp - 10 * MIN_IN_MS,
      bloodGlucose: 14.9,
      signalStrength: 1,
      noiseLevel: 1,
    },
    {
      modelType: 'DexcomSensorEntry',
      timestamp: currentTimestamp - 5 * MIN_IN_MS,
      bloodGlucose: 15.9,
      signalStrength: 1,
      noiseLevel: 1,
    },
  ];
}
