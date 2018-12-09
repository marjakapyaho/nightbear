import { DexcomSensorEntry } from 'core/models/model';
import { MIN_IN_MS } from 'core/calculations/calculations';

export function entriesRising(currentTimestamp: number): DexcomSensorEntry[] {
  return [
    {
      modelType: 'DexcomSensorEntry',
      timestamp: currentTimestamp - 20 * MIN_IN_MS,
      bloodGlucose: 11,
      signalStrength: 1,
      noiseLevel: 1,
    },
    {
      modelType: 'DexcomSensorEntry',
      timestamp: currentTimestamp - 15 * MIN_IN_MS,
      bloodGlucose: 12.4,
      signalStrength: 1,
      noiseLevel: 1,
    },
    {
      modelType: 'DexcomSensorEntry',
      timestamp: currentTimestamp - 10 * MIN_IN_MS,
      bloodGlucose: 14.0,
      signalStrength: 1,
      noiseLevel: 1,
    },
    {
      modelType: 'DexcomSensorEntry',
      timestamp: currentTimestamp - 5 * MIN_IN_MS,
      bloodGlucose: 14.9,
      signalStrength: 1,
      noiseLevel: 1,
    },
  ];
}
