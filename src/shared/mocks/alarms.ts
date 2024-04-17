import { Alarm, AlarmState } from 'shared/types/alarms';

export const mockAlarmStates: AlarmState[] = [
  {
    alarmLevel: 1,
    validAfterTimestamp: Date.now(),
    ackedBy: null,
    pushoverReceipts: [],
  },
];

export const mockAlarms: Alarm[] = [
  {
    id: '1',
    timestamp: Date.now(),
    situationType: 'LOW',
    isActive: true,
    deactivatedAt: null,
    alarmStates: mockAlarmStates,
  },
];
