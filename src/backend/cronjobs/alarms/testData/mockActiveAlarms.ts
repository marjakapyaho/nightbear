import { Alarm } from 'shared/types/alarms';
import { Situation } from 'shared/types/analyser';
import { generateUuid } from 'shared/utils/id';

export function getMockActiveAlarms(currentTimestamp: number, situation?: Situation): Alarm[] {
  if (!situation) {
    return [];
  }

  return [
    {
      id: generateUuid(),
      timestamp: currentTimestamp,
      situation: situation,
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
  deactivatedAt: number | null = null,
): Alarm {
  return {
    id: generateUuid(),
    timestamp: currentTimestamp,
    situation: situation,
    isActive,
    deactivatedAt,
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
