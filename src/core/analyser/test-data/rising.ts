import { MIN_IN_MS } from 'core/calculations/calculations';
import { DexcomG6SensorEntry } from 'core/models/model';
import { generateUuid } from 'core/utils/id';

export function entriesRising(currentTimestamp: number): DexcomG6SensorEntry[] {
  return [
    {
      modelType: 'DexcomG6SensorEntry',
      modelUuid: generateUuid(),
      timestamp: currentTimestamp - 20 * MIN_IN_MS,
      bloodGlucose: 11,
      direction: '',
    },
    {
      modelType: 'DexcomG6SensorEntry',
      modelUuid: generateUuid(),
      timestamp: currentTimestamp - 15 * MIN_IN_MS,
      bloodGlucose: 12.4,
      direction: '',
    },
    {
      modelType: 'DexcomG6SensorEntry',
      modelUuid: generateUuid(),
      timestamp: currentTimestamp - 10 * MIN_IN_MS,
      bloodGlucose: 14.0,
      direction: '',
    },
    {
      modelType: 'DexcomG6SensorEntry',
      modelUuid: generateUuid(),
      timestamp: currentTimestamp - 5 * MIN_IN_MS,
      bloodGlucose: 14.9,
      direction: '',
    },
  ];
}
