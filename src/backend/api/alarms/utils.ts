import { isTimeSmaller } from 'shared/utils/time';
import { getAlarmState, getSnoozeMinutes } from 'shared/utils/alarms';
import { Alarm } from 'shared/types/alarms';
import { Context } from 'backend/utils/api';

export const isThereNothingToAck = (activeAlarm: Alarm, context: Context) =>
  !activeAlarm || isTimeSmaller(context.timestamp(), getAlarmState(activeAlarm).validAfter);

export const getSnoozeMinutesFromActiveProfile = async (activeAlarm: Alarm, context: Context) => {
  const activeProfile = await context.db.getActiveProfile();
  return getSnoozeMinutes(activeAlarm.situation, activeProfile);
};
