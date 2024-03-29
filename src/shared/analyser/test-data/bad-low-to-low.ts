import { MIN_IN_MS } from 'shared/calculations/calculations';
import { Alarm, DexcomG6SensorEntry } from 'shared/models/model';
import { generateUuid } from 'shared/utils/id';

export function entriesBadLowToLow(currentTimestamp: number): DexcomG6SensorEntry[] {
  return [
    {
      modelType: 'DexcomG6SensorEntry',
      modelUuid: generateUuid(),
      timestamp: currentTimestamp - 20 * MIN_IN_MS,
      bloodGlucose: 2.9,
      direction: '',
    },
    {
      modelType: 'DexcomG6SensorEntry',
      modelUuid: generateUuid(),
      timestamp: currentTimestamp - 15 * MIN_IN_MS,
      bloodGlucose: 3.3,
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

export function alarmsWithInactiveBadLow(currentTimestamp: number): Alarm[] {
  return [
    {
      modelType: 'Alarm',
      modelUuid: generateUuid(),
      timestamp: currentTimestamp - 40 * MIN_IN_MS,
      situationType: 'BAD_LOW',
      isActive: false,
      deactivationTimestamp: currentTimestamp - 10 * MIN_IN_MS,
      alarmStates: [
        {
          alarmLevel: 1,
          validAfterTimestamp: currentTimestamp - 40 * MIN_IN_MS,
          ackedBy: null,
          pushoverReceipts: [],
        },
      ],
    },
  ];
}
