import { Alarm, AlarmState } from 'shared/types/alarms';
import { mockNow } from 'shared/mocks/dates';

export const mockAlarmStates: AlarmState[] = [
  {
    alarmLevel: 1,
    validAfterTimestamp: mockNow,
    ackedBy: null,
    pushoverReceipts: [],
  },
];

export const mockAlarms: Alarm[] = [
  {
    id: '1',
    timestamp: mockNow,
    situation: 'LOW',
    isActive: true,
    deactivatedAt: null,
    alarmStates: mockAlarmStates,
  },
];
