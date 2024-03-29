import { MIN_IN_MS } from 'shared/calculations/calculations';
import { DexcomG6SensorEntry, Carbs } from 'shared/models/model';
import { generateUuid } from 'shared/utils/id';

export function entriesLow(currentTimestamp: number): DexcomG6SensorEntry[] {
  return [
    {
      modelType: 'DexcomG6SensorEntry',
      modelUuid: generateUuid(),
      timestamp: currentTimestamp - 20 * MIN_IN_MS,
      bloodGlucose: 6,
      direction: '',
    },
    {
      modelType: 'DexcomG6SensorEntry',
      modelUuid: generateUuid(),
      timestamp: currentTimestamp - 15 * MIN_IN_MS,
      bloodGlucose: 5,
      direction: '',
    },
    {
      modelType: 'DexcomG6SensorEntry',
      modelUuid: generateUuid(),
      timestamp: currentTimestamp - 10 * MIN_IN_MS,
      bloodGlucose: 4.7,
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

export function recentCarbs(currentTimestamp: number): Carbs[] {
  return [
    {
      modelType: 'Carbs',
      modelUuid: generateUuid(),
      timestamp: currentTimestamp - 15 * MIN_IN_MS,
      amount: 30,
      carbsType: 'normal',
    },
  ];
}
