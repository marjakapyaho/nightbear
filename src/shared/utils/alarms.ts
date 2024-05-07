import { last } from 'lodash';
import { Alarm, AlarmState } from 'shared/types/alarms';

export const ALARM_START_LEVEL = 0;
export const ALARM_FALLBACK_LEVEL = 1;

export const onlyActive = (alarms: Alarm[]) => alarms.filter(alarm => alarm.isActive);

export const getAlarmState = (alarm: Alarm): AlarmState => {
  const latest = last(alarm.alarmStates);
  if (!latest) throw new Error(`Couldn't get latest AlarmState from Alarm "${alarm.id}"`);
  return latest;
};
