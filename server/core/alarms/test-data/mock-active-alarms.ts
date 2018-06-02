import { Alarm, Situation } from 'server/models/model';

export function getMockActiveAlarms(currentTimestamp: number, situation?: Situation): Alarm[] {
  if (!situation) {
    return [];
  }

  return [{
    modelType: 'Alarm',
    creationTimestamp: currentTimestamp,
    validAfterTimestamp: currentTimestamp,
    alarmLevel: 1,
    situationType: situation,
    isActive: true,
    pushoverReceipts: [],
  }];
}

export function getMockAlarm(currentTimestamp: number, situation: Situation): Alarm {
  return {
    modelType: 'Alarm',
    creationTimestamp: currentTimestamp,
    validAfterTimestamp: currentTimestamp,
    alarmLevel: 1,
    situationType: situation,
    isActive: true,
    pushoverReceipts: [],
  };
}
