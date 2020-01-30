import { MIN_IN_MS } from 'core/calculations/calculations';
import { DexcomSensorEntry } from 'core/models/model';
import { range } from 'lodash';
import { generateUuid } from 'core/utils/id';

export function entriesPersistentHigh(currentTimestamp: number): DexcomSensorEntry[] {
  return range(30).map(
    (index): DexcomSensorEntry => {
      return {
        modelType: 'DexcomSensorEntry',
        modelUuid: generateUuid(),
        timestamp: currentTimestamp - index * 5 * MIN_IN_MS,
        bloodGlucose: 11,
        signalStrength: 1,
        noiseLevel: 1,
      };
    },
  );
}
