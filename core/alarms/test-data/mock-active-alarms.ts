import { Alarm, Situation } from 'core/models/model';

export function getMockActiveAlarms(currentTimestamp: number, situation?: Situation): Alarm[] {
  if (!situation) {
    return [];
  }

  return [
    {
      modelType: 'Alarm',
      timestamp: currentTimestamp,
      validAfterTimestamp: currentTimestamp,
      alarmLevel: 1,
      situationType: situation,
      isActive: true,
      pushoverReceipts: [],
    },
  ];
}

export function getMockAlarm(currentTimestamp: number, situation: Situation, isActive: boolean = true): Alarm {
  return {
    modelType: 'Alarm',
    timestamp: currentTimestamp,
    validAfterTimestamp: currentTimestamp,
    alarmLevel: 1,
    situationType: situation,
    isActive,
    pushoverReceipts: [],
  };
}
