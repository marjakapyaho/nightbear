import { DexcomSensorEntry } from 'core/models/model';
import { range } from 'lodash';
import { MIN_IN_MS } from 'core/calculations/calculations';

export function entriesPersistentHigh(currentTimestamp: number): DexcomSensorEntry[] {
  return range(30).map(index => {
    return {
      modelType: 'DexcomSensorEntry',
      timestamp: currentTimestamp - index * 5 * MIN_IN_MS,
      bloodGlucose: 11,
      signalStrength: 1,
      noiseLevel: 1,
    };
  }) as DexcomSensorEntry[];
}
