import { Alarm, AlarmState } from 'shared/types/alarms';
import { mockNow } from 'shared/mocks/dates';

export const mockAlarmStates: AlarmState[] = [
  {
    id: '1',
    timestamp: mockNow,
    alarmLevel: 0,
    validAfter: mockNow,
  },
];

export const mockAlarms: Alarm[] = [
  {
    id: '1',
    timestamp: mockNow,
    situation: 'LOW',
    isActive: true,
    alarmStates: mockAlarmStates,
  },
];
