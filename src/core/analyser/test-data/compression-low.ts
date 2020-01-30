import { MIN_IN_MS } from 'core/calculations/calculations';
import { DexcomSensorEntry } from 'core/models/model';
import { generateUuid } from 'core/utils/id';

export function entriesCompressionLow(currentTimestamp: number): DexcomSensorEntry[] {
  return [
    {
      modelType: 'DexcomSensorEntry',
      modelUuid: generateUuid(),
      timestamp: currentTimestamp - 40 * MIN_IN_MS,
      bloodGlucose: 10,
      signalStrength: 1,
      noiseLevel: 1,
    },
    {
      modelType: 'DexcomSensorEntry',
      modelUuid: generateUuid(),
      timestamp: currentTimestamp - 35 * MIN_IN_MS,
      bloodGlucose: 10.4,
      signalStrength: 1,
      noiseLevel: 1,
    },
    {
      modelType: 'DexcomSensorEntry',
      modelUuid: generateUuid(),
      timestamp: currentTimestamp - 30 * MIN_IN_MS,
      bloodGlucose: 9.9,
      signalStrength: 1,
      noiseLevel: 1,
    },
    {
      modelType: 'DexcomSensorEntry',
      modelUuid: generateUuid(),
      timestamp: currentTimestamp - 25 * MIN_IN_MS,
      bloodGlucose: 7,
      signalStrength: 1,
      noiseLevel: 1,
    },
    {
      modelType: 'DexcomSensorEntry',
      modelUuid: generateUuid(),
      timestamp: currentTimestamp - 20 * MIN_IN_MS,
      bloodGlucose: 3.8,
      signalStrength: 1,
      noiseLevel: 1,
    },
    {
      modelType: 'DexcomSensorEntry',
      modelUuid: generateUuid(),
      timestamp: currentTimestamp - 15 * MIN_IN_MS,
      bloodGlucose: 2.0,
      signalStrength: 1,
      noiseLevel: 1,
    },
    {
      modelType: 'DexcomSensorEntry',
      modelUuid: generateUuid(),
      timestamp: currentTimestamp - 10 * MIN_IN_MS,
      bloodGlucose: 6.0,
      signalStrength: 1,
      noiseLevel: 1,
    },
    {
      modelType: 'DexcomSensorEntry',
      modelUuid: generateUuid(),
      timestamp: currentTimestamp - 5 * MIN_IN_MS,
      bloodGlucose: 9.9,
      signalStrength: 1,
      noiseLevel: 1,
    },
  ];
}
