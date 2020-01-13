import { Alarm, Situation } from 'core/models/model';

export function getMockActiveAlarms(currentTimestamp: number, situation?: Situation): Alarm[] {
  if (!situation) {
    return [];
  }

  return [
    {
      modelType: 'Alarm',
      timestamp: currentTimestamp,
      situationType: situation,
      isActive: true,
      deactivationTimestamp: null,
      alarmStates: [
        {
          alarmLevel: 1,
          validAfterTimestamp: currentTimestamp,
          ackedBy: null,
          pushoverReceipts: [],
        },
      ],
    },
  ];
}

export function getMockAlarm(
  currentTimestamp: number,
  situation: Situation,
  isActive: boolean = true,
  deactivationTimestamp: number | null = null,
): Alarm {
  return {
    modelType: 'Alarm',
    timestamp: currentTimestamp,
    situationType: situation,
    isActive,
    deactivationTimestamp,
    alarmStates: [
      {
        alarmLevel: 1,
        validAfterTimestamp: currentTimestamp,
        ackedBy: null,
        pushoverReceipts: [],
      },
    ],
  };
}
