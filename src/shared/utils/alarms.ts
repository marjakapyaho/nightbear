import { first, last } from 'lodash';
import { Alarm, AlarmState } from 'shared/types/alarms';
import { Situation } from 'shared/types/analyser';
import { Profile, SituationSettings } from 'shared/types/profiles';

export const ALARM_START_LEVEL = 0;
export const ALARM_FALLBACK_LEVEL = 1;

export const situationsToSituationSettings: Record<Situation, keyof SituationSettings> = {
  OUTDATED: 'outdated',
  CRITICAL_OUTDATED: 'criticalOutdated',
  FALLING: 'falling',
  RISING: 'rising',
  LOW: 'low',
  BAD_LOW: 'badLow',
  COMPRESSION_LOW: 'compressionLow',
  HIGH: 'high',
  BAD_HIGH: 'badHigh',
  PERSISTENT_HIGH: 'persistentHigh',
  MISSING_DAY_INSULIN: 'missingDayInsulin',
};

export const onlyActive = (alarms: Alarm[]) => alarms.filter(alarm => alarm.isActive);

export const getAlarmState = (alarm: Alarm): AlarmState => {
  const latest = last(alarm.alarmStates);
  if (!latest) throw new Error(`Couldn't get latest AlarmState from Alarm "${alarm.id}"`);
  return latest;
};

export const getFirstAlarmState = (alarm: Alarm): AlarmState => {
  const firstState = first(alarm.alarmStates);
  if (!firstState) throw new Error(`Couldn't get first AlarmState from Alarm "${alarm.id}"`);
  return firstState;
};

export const getSnoozeMinutes = (situation: Situation, profile: Profile) => {
  return profile.situationSettings[situationsToSituationSettings[situation]].snoozeMinutes | 0;
};

export const getEscalationAfterMinutes = (situation: Situation, profile: Profile) => {
  return profile.situationSettings[situationsToSituationSettings[situation]].escalationAfterMinutes;
};
