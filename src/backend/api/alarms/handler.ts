import { Context, createResponse, Request } from 'backend/utils/api';
import { getTimePlusMinutes } from 'shared/utils/time';
import { getSnoozeMinutesFromActiveProfile, isThereNothingToAck } from 'backend/api/alarms/utils';
import { Alarm } from 'shared/types/alarms';
import { ALARM_START_LEVEL } from 'shared/utils/alarms';

export const getActiveAlarm = async (request: Request, context: Context) => {
  const [activeAlarm] = await context.db.alarms.getAlarms({ onlyActive: true });
  return createResponse(activeAlarm);
};

export const ackActiveAlarm = async (request: Request, context: Context) => {
  // Get active alarm
  const [alarm] = await context.db.alarms.getAlarms({ onlyActive: true });
  // TODO: HANDLE ERROR + BETTER CASTING
  const activeAlarm = alarm as unknown as Alarm;

  // If we have nothing to ack, return
  if (isThereNothingToAck(activeAlarm, context)) {
    return createResponse('Nothing to ack');
  }

  // Get situation's snooze minutes from active profile
  const snoozeMinutes = await getSnoozeMinutesFromActiveProfile(activeAlarm, context);

  // Create new alarm state with snooze minutes and reset level
  await context.db.alarms.createAlarmState({
    alarmId: activeAlarm.id,
    alarmLevel: ALARM_START_LEVEL,
    validAfter: getTimePlusMinutes(context.timestamp(), snoozeMinutes),
  });
  // TODO: HANDLE ERROR

  // Mark all alarm states as processed (in case there were any notification receipts missing)
  await context.db.alarms.markAllAlarmStatesAsProcessed({ alarmId: activeAlarm.id });
  // TODO: HANDLE ERROR

  return createResponse(activeAlarm.id);
};
