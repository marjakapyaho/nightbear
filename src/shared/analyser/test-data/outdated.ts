import { MIN_IN_MS } from 'shared/calculations/calculations';
import { DexcomG6SensorEntry } from 'shared/models/model';
import { generateUuid } from 'shared/utils/id';

export function entriesOutdated(currentTimestamp: number): DexcomG6SensorEntry[] {
  return [
    {
      modelType: 'DexcomG6SensorEntry',
      modelUuid: generateUuid(),
      timestamp: currentTimestamp - 45 * MIN_IN_MS,
      bloodGlucose: 6,
      direction: '',
    },
    {
      modelType: 'DexcomG6SensorEntry',
      modelUuid: generateUuid(),
      timestamp: currentTimestamp - 40 * MIN_IN_MS,
      bloodGlucose: 5,
      direction: '',
    },
    {
      modelType: 'DexcomG6SensorEntry',
      modelUuid: generateUuid(),
      timestamp: currentTimestamp - 35 * MIN_IN_MS,
      bloodGlucose: 4.7,
      direction: '',
    },
    {
      modelType: 'DexcomG6SensorEntry',
      modelUuid: generateUuid(),
      timestamp: currentTimestamp - 30 * MIN_IN_MS,
      bloodGlucose: 3.8,
      direction: '',
    },
  ];
}
