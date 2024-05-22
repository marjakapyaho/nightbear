import { isTimeSmaller } from '@nightbear/shared';
import { getAlarmState, getSnoozeMinutes } from '@nightbear/shared';
import { Alarm } from '@nightbear/shared';
import { Context } from '../../utils/api';

export const isThereNothingToAck = (activeAlarm: Alarm, context: Context) =>
  !activeAlarm || isTimeSmaller(context.timestamp(), getAlarmState(activeAlarm).validAfter);

export const getSnoozeMinutesFromActiveProfile = async (activeAlarm: Alarm, context: Context) => {
  const activeProfile = await context.db.getActiveProfile();
  return getSnoozeMinutes(activeAlarm.situation, activeProfile);
};
