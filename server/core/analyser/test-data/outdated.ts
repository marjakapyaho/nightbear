import { MIN_IN_MS } from '../../calculations/calculations';
import { DexcomSensorEntry } from 'server/models/model';

export function entriesOutdated(currentTimestamp: number): DexcomSensorEntry[] {
  return [
    {
      modelType: 'DexcomSensorEntry',
      timestamp: currentTimestamp - 45 * MIN_IN_MS,
      bloodGlucose: 6,
      signalStrength: 1,
      noiseLevel: 1,
    },
    {
      modelType: 'DexcomSensorEntry',
      timestamp: currentTimestamp - 40 * MIN_IN_MS,
      bloodGlucose: 5,
      signalStrength: 1,
      noiseLevel: 1,
    },
    {
      modelType: 'DexcomSensorEntry',
      timestamp: currentTimestamp - 35 * MIN_IN_MS,
      bloodGlucose: 4.7,
      signalStrength: 1,
      noiseLevel: 1,
    },
    {
      modelType: 'DexcomSensorEntry',
      timestamp: currentTimestamp - 30 * MIN_IN_MS,
      bloodGlucose: 3.8,
      signalStrength: 1,
      noiseLevel: 1,
    },
  ];
}
