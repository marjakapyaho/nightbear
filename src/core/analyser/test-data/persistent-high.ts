import { MIN_IN_MS } from 'core/calculations/calculations';
import { DexcomG6SensorEntry } from 'core/models/model';
import { range } from 'lodash';
import { generateUuid } from 'core/utils/id';

export function entriesPersistentHigh(currentTimestamp: number): DexcomG6SensorEntry[] {
  return range(30).map((index): DexcomG6SensorEntry => {
    return {
      modelType: 'DexcomG6SensorEntry',
      modelUuid: generateUuid(),
      timestamp: currentTimestamp - index * 5 * MIN_IN_MS,
      bloodGlucose: 11,
      direction: '',
    };
  });
}
