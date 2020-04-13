import { MIN_IN_MS } from 'core/calculations/calculations';
import { DexcomG6SensorEntry } from 'core/models/model';
import { generateUuid } from 'core/utils/id';

export function entriesHighFluctuations(currentTimestamp: number): DexcomG6SensorEntry[] {
  return [
    {
      modelType: 'DexcomG6SensorEntry',
      modelUuid: generateUuid(),
      timestamp: currentTimestamp - 35 * MIN_IN_MS,
      bloodGlucose: 14.5,
      direction: '',
    },
    {
      modelType: 'DexcomG6SensorEntry',
      modelUuid: generateUuid(),
      timestamp: currentTimestamp - 30 * MIN_IN_MS,
      bloodGlucose: 15.3,
      direction: '',
    },
    {
      modelType: 'DexcomG6SensorEntry',
      modelUuid: generateUuid(),
      timestamp: currentTimestamp - 25 * MIN_IN_MS,
      bloodGlucose: 15.6,
      direction: '',
    },
    {
      modelType: 'DexcomG6SensorEntry',
      modelUuid: generateUuid(),
      timestamp: currentTimestamp - 20 * MIN_IN_MS,
      bloodGlucose: 16.5,
      direction: '',
    },
    {
      modelType: 'DexcomG6SensorEntry',
      modelUuid: generateUuid(),
      timestamp: currentTimestamp - 15 * MIN_IN_MS,
      bloodGlucose: 15.9,
      direction: '',
    },
    {
      modelType: 'DexcomG6SensorEntry',
      modelUuid: generateUuid(),
      timestamp: currentTimestamp - 10 * MIN_IN_MS,
      bloodGlucose: 15.5,
      direction: '',
    },
    {
      modelType: 'DexcomG6SensorEntry',
      modelUuid: generateUuid(),
      timestamp: currentTimestamp - 5 * MIN_IN_MS,
      bloodGlucose: 15.1,
      direction: '',
    },
  ];
}
