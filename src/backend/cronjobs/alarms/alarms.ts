import { Alarm } from 'shared/types/alarms';
import { Situation } from 'shared/types/analyser';
import { getAlarmState } from 'shared/utils/alarms';
import { Context } from 'backend/utils/api';
import { Profile } from 'shared/types/profiles';
import { isTimeBefore } from 'shared/utils/time';
import { isNotNull } from 'shared/utils/helpers';
import { getNeededAlarmLevel, getPushoverRecipient, retryNotifications } from './utils';

const INITIAL_ALARM_LEVEL = 0;

type AlarmActions = {
  remove?: Alarm;
  keep?: Alarm;
  create?: Situation;
};

export const runAlarmChecks = async (
  context: Context,
  situation: Situation | null,
  activeProfile: Profile,
  activeAlarm?: Alarm,
): Promise<string | null> => {
  const { log } = context;

  const { remove, keep, create } = detectAlarmActions(situation, activeProfile, activeAlarm);

  if (remove) {
    await deactivateAlarm(remove, context);
  }

  if (keep) {
    return updateAlarm(keep, activeProfile, context);
  }

  if (create) {
    return createAlarm(create, context);
  }

  return null;
};

export const detectAlarmActions = (
  situation: Situation | null,
  activeProfile: Profile,
  activeAlarm?: Alarm,
): AlarmActions => {
  // If there is no situation or alarms are disabled, remove active alarm
  if (!situation || !activeProfile.alarmsEnabled) {
    return {
      remove: activeAlarm,
    };
  }

  // If there is already alarm of correct type, keep it
  if (activeAlarm && activeAlarm.situation === situation) {
    return {
      keep: activeAlarm,
    };
  }

  // If there is alarm of wrong type, remove it and create new one
  if (activeAlarm && activeAlarm.situation !== situation) {
    return {
      remove: activeAlarm,
      create: situation,
    };
  }

  // There was no previous alarm and there is a situation so create new alarm
  if (situation) {
    return {
      create: situation,
    };
  }

  // Do nothing
  return {};
};

const deactivateAlarm = async (alarm: Alarm, context: Context) => {
  // TODO: Let's not wait for these?
  context.pushover.ackAlarms(
    alarm.alarmStates.map(state => state.notificationReceipt).filter(isNotNull),
  );

  await context.db.alarms.deactivateAlarm(alarm);

  return alarm.id;
};

const updateAlarm = async (
  activeAlarm: Alarm,
  activeProfile: Profile,
  context: Context,
): Promise<string> => {
  const { log } = context;
  const { situation } = activeAlarm;
  const currentAlarmState = getAlarmState(activeAlarm);
  const { alarmLevel, validAfter } = currentAlarmState;

  // Alarm is not yet valid
  if (isTimeBefore(context.timestamp(), validAfter)) {
    return activeAlarm.id;
  }

  // Retry all notifications that are missing receipts
  const statesMissingReceipts = activeAlarm.alarmStates.filter(
    state => !state.notificationProcessedAt,
  );

  const neededLevel = getNeededAlarmLevel(situation, validAfter, activeProfile, context);

  // No need to escalate yet, just retry notifications that are missing receipts and return
  if (neededLevel === alarmLevel) {
    await retryNotifications(statesMissingReceipts, situation, context);
    return activeAlarm.id;
  }

  const pushoverRecipient = getPushoverRecipient(neededLevel, activeProfile);

  // Send new pushover if there is recipient
  const receipt = pushoverRecipient
    ? await context.pushover.sendAlarm(situation, pushoverRecipient)
    : null;

  // Escalate and create new alarm state
  await context.db.alarms.createAlarmState({
    alarmId: activeAlarm.id,
    alarmLevel: neededLevel,
    validAfter: context.timestamp(),
    notificationTarget: pushoverRecipient,
    notificationReceipt: receipt,
    notificationProcessedAt: receipt ? context.timestamp() : null,
  });

  return activeAlarm.id;
};

export const createAlarm = async (
  situation: Situation,
  context: Context,
): Promise<string | null> => {
  const [createdAlarm] = await context.db.alarms.createAlarm({
    situation,
  });

  if (!createdAlarm) {
    // TODO: handle errors
    console.log('HANDLE ERROR');
    return null;
  }

  await context.db.alarms.createAlarmState({
    alarmId: createdAlarm.id,
    alarmLevel: INITIAL_ALARM_LEVEL,
    validAfter: context.timestamp(),
  });

  return createdAlarm.id;
};
