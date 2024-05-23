import { Alarm, AlarmState } from '../types';
import { mockNow } from './dates';

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
    situation: 'LOW',
    isActive: true,
    alarmStates: mockAlarmStates,
  },
];
