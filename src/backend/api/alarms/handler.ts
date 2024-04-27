import { Context, createResponse, Request } from 'backend/utils/api';
import { MIN_IN_MS } from 'shared/utils/calculations';
import { getTimeAddedWith, getTimeAsISOStr, isTimeBeforeOrEqual } from 'shared/utils/time';
import { mockProfiles } from 'shared/mocks/profiles';
import { getAlarmState } from 'shared/utils/alarms';
import { Alarm } from 'shared/types/alarms';

export const getActiveAlarm = async (request: Request, context: Context) => {
  const [activeAlarm] = await context.db.alarms.getActiveAlarm();
  return createResponse(activeAlarm);
};

export const ackActiveAlarm = async (request: Request, context: Context) => {
  const [activeAlarm] = await context.db.alarms.getActiveAlarm();

  // TODO: who to do the casting to Alarm
  if (
    !activeAlarm ||
    isTimeBeforeOrEqual(context.timestamp(), getAlarmState(activeAlarm as Alarm).validAfter)
  ) {
    return createResponse('Nothing to ack');
  }

  // TODO
  const activeProfile = mockProfiles[0];
  const snoozeMinutes =
    activeProfile.situationSettings.find(settings => settings.situation === activeAlarm.situation)
      ?.snoozeMinutes || 10; // TODO: what to do here

  await context.db.alarms.markAllAlarmStatesAsProcessed({ alarmId: activeAlarm.id });
  // TODO: HANDLE ERROR

  await context.db.alarms.createAlarmState({
    alarmId: activeAlarm.id,
    alarmLevel: 0,
    validAfter: getTimeAsISOStr(getTimeAddedWith(context.timestamp(), snoozeMinutes * MIN_IN_MS)),
  });

  return createResponse(activeAlarm.id);
};
