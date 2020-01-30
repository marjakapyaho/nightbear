import { MIN_IN_MS } from 'core/calculations/calculations';
import { DexcomSensorEntry } from 'core/models/model';
import { generateUuid } from 'core/utils/id';

export function entriesOutdated(currentTimestamp: number): DexcomSensorEntry[] {
  return [
    {
      modelType: 'DexcomSensorEntry',
      modelUuid: generateUuid(),
      timestamp: currentTimestamp - 45 * MIN_IN_MS,
      bloodGlucose: 6,
      signalStrength: 1,
      noiseLevel: 1,
    },
    {
      modelType: 'DexcomSensorEntry',
      modelUuid: generateUuid(),
      timestamp: currentTimestamp - 40 * MIN_IN_MS,
      bloodGlucose: 5,
      signalStrength: 1,
      noiseLevel: 1,
    },
    {
      modelType: 'DexcomSensorEntry',
      modelUuid: generateUuid(),
      timestamp: currentTimestamp - 35 * MIN_IN_MS,
      bloodGlucose: 4.7,
      signalStrength: 1,
      noiseLevel: 1,
    },
    {
      modelType: 'DexcomSensorEntry',
      modelUuid: generateUuid(),
      timestamp: currentTimestamp - 30 * MIN_IN_MS,
      bloodGlucose: 3.8,
      signalStrength: 1,
      noiseLevel: 1,
    },
  ];
}
