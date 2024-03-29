import { MIN_IN_MS } from 'core/calculations/calculations';
import { DexcomG6SensorEntry, Insulin } from 'core/models/model';
import { generateUuid } from 'core/utils/id';

export function entriesHigh(currentTimestamp: number): DexcomG6SensorEntry[] {
  return [
    {
      modelType: 'DexcomG6SensorEntry',
      modelUuid: generateUuid(),
      timestamp: currentTimestamp - 20 * MIN_IN_MS,
      bloodGlucose: 14,
      direction: '',
    },
    {
      modelType: 'DexcomG6SensorEntry',
      modelUuid: generateUuid(),
      timestamp: currentTimestamp - 15 * MIN_IN_MS,
      bloodGlucose: 14.8,
      direction: '',
    },
    {
      modelType: 'DexcomG6SensorEntry',
      modelUuid: generateUuid(),
      timestamp: currentTimestamp - 10 * MIN_IN_MS,
      bloodGlucose: 14.9,
      direction: '',
    },
    {
      modelType: 'DexcomG6SensorEntry',
      modelUuid: generateUuid(),
      timestamp: currentTimestamp - 5 * MIN_IN_MS,
      bloodGlucose: 15.9,
      direction: '',
    },
  ];
}

export function recentInsulin(currentTimestamp: number): Insulin[] {
  return [
    {
      modelType: 'Insulin',
      modelUuid: generateUuid(),
      timestamp: currentTimestamp,
      amount: 3,
      insulinType: 'fiasp',
    },
  ];
}
