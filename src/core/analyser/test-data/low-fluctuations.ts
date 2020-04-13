import { MIN_IN_MS } from 'core/calculations/calculations';
import { DexcomG6SensorEntry } from 'core/models/model';
import { generateUuid } from 'core/utils/id';

export function entriesLowFluctuations(currentTimestamp: number): DexcomG6SensorEntry[] {
  return [
    {
      modelType: 'DexcomG6SensorEntry',
      modelUuid: generateUuid(),
      timestamp: currentTimestamp - 20 * MIN_IN_MS,
      bloodGlucose: 4,
      direction: '',
    },
    {
      modelType: 'DexcomG6SensorEntry',
      modelUuid: generateUuid(),
      timestamp: currentTimestamp - 15 * MIN_IN_MS,
      bloodGlucose: 3.8,
      direction: '',
    },
    {
      modelType: 'DexcomG6SensorEntry',
      modelUuid: generateUuid(),
      timestamp: currentTimestamp - 10 * MIN_IN_MS,
      bloodGlucose: 3.5,
      direction: '',
    },
    {
      modelType: 'DexcomG6SensorEntry',
      modelUuid: generateUuid(),
      timestamp: currentTimestamp - 5 * MIN_IN_MS,
      bloodGlucose: 3.4,
      direction: '',
    },
    {
      modelType: 'DexcomG6SensorEntry',
      modelUuid: generateUuid(),
      timestamp: currentTimestamp - 10 * MIN_IN_MS,
      bloodGlucose: 3.6,
      direction: '',
    },
    {
      modelType: 'DexcomG6SensorEntry',
      modelUuid: generateUuid(),
      timestamp: currentTimestamp - 5 * MIN_IN_MS,
      bloodGlucose: 3.8,
      direction: '',
    },
  ];
}
