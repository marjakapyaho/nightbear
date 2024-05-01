import { Context } from 'backend/utils/api';
import { Alarm } from 'shared/types/alarms';
import { Situation } from 'shared/types/analyser';
import { ALARM_DEFAULT_LEVEL } from 'shared/utils/alarms';

export const createAlarmWithState = async (situation: Situation, context: Context) => {
  const [alarm] = await context.db.alarms.createAlarm({
    situation,
  });
  await context.db.alarms.createAlarmState({
    alarmId: alarm.id,
    alarmLevel: ALARM_DEFAULT_LEVEL,
    validAfter: context.timestamp(),
  });

  // TODO: CASTING
  const alarms = (await context.db.alarms.getAlarms({ onlyActive: true })) as unknown as Alarm[];
  return alarms[0];
};
