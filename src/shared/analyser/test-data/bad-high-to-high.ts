import { MIN_IN_MS } from 'shared/calculations/calculations';
import { Alarm, DexcomG6SensorEntry } from 'shared/models/model';
import { generateUuid } from 'shared/utils/id';

export function entriesBadHighToHigh(currentTimestamp: number): DexcomG6SensorEntry[] {
  return [
    {
      modelType: 'DexcomG6SensorEntry',
      modelUuid: generateUuid(),
      timestamp: currentTimestamp - 20 * MIN_IN_MS,
      bloodGlucose: 18.5,
      direction: '',
    },
    {
      modelType: 'DexcomG6SensorEntry',
      modelUuid: generateUuid(),
      timestamp: currentTimestamp - 15 * MIN_IN_MS,
      bloodGlucose: 17.5,
      direction: '',
    },
    {
      modelType: 'DexcomG6SensorEntry',
      modelUuid: generateUuid(),
      timestamp: currentTimestamp - 10 * MIN_IN_MS,
      bloodGlucose: 16.5,
      direction: '',
    },
    {
      modelType: 'DexcomG6SensorEntry',
      modelUuid: generateUuid(),
      timestamp: currentTimestamp - 5 * MIN_IN_MS,
      bloodGlucose: 15.5,
      direction: '',
    },
  ];
}

export function alarmsWithInactiveBadHigh(currentTimestamp: number): Alarm[] {
  return [
    {
      modelType: 'Alarm',
      modelUuid: generateUuid(),
      timestamp: currentTimestamp - 40 * MIN_IN_MS,
      situationType: 'BAD_HIGH',
      isActive: false,
      deactivationTimestamp: currentTimestamp - 15 * MIN_IN_MS,
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
