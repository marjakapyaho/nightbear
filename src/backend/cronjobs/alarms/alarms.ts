import { MIN_IN_MS } from 'shared/utils/calculations';
import { findIndex, map, sum, take } from 'lodash';
import { Alarm, AlarmState } from 'shared/types/alarms';
import { Situation } from 'shared/types/analyser';
import { getAlarmState } from 'shared/utils/alarms';
import { Context } from 'backend/utils/api';
import { Profile } from 'shared/types/profiles';
import { getTimeSubtractedFrom, isTimeBeforeOrEqual } from 'shared/utils/time';
import { isNotNull } from 'shared/utils/helpers';

const INITIAL_ALARM_LEVEL = 0;

export const runAlarmChecks = async (
  context: Context,
  situation: Situation | null,
  activeProfile: Profile,
  activeAlarm?: Alarm,
): Promise<string | null> => {
  const { log } = context;

  // If alarms are disabled, and we have an active alarm,
  // deactivate it otherwise just return
  if (!activeProfile.alarmsEnabled) {
    return activeAlarm ? deactivateAlarm(activeAlarm, context) : null;
  }

  if (activeAlarm) {
    if (activeAlarm.situation === situation) {
      return updateAlarm(activeAlarm, activeProfile, context);
    } else {
      return deactivateAlarm(activeAlarm, context);
    }
  }

  if (situation) {
    return createAlarm(situation, context);
  }

  return null;
};

const deactivateAlarm = async (alarm: Alarm, context: Context) => {
  // TODO: Let's not wait for these?
  context.pushover.ackAlarms(
    alarm.alarmStates.map(state => state.notificationReceipt).filter(isNotNull),
  );

  const [deactivatedAlarm] = await context.db.alarms.deactivateAlarm(alarm);

  return deactivatedAlarm.id;
};

const getNeededAlarmLevel = (
  currentSituation: Situation,
  validAfterTimestamp: string,
  activeProfile: Profile,
  context: Context,
) => {
  const hasBeenValidForMinutes = Math.round(
    getTimeSubtractedFrom(context.timestamp(), validAfterTimestamp) / MIN_IN_MS,
  );
  const levelUpTimes = activeProfile.situationSettings.find(
    situation => situation.situation === currentSituation,
  )?.escalationAfterMinutes;

  if (!levelUpTimes) {
    // TODO: what should we return
    return 2;
  }

  const accumulatedTimes = map(levelUpTimes, (_x, i) => sum(take(levelUpTimes, i + 1)));

  return (
    findIndex(accumulatedTimes, minutes => minutes > hasBeenValidForMinutes) + 1 ||
    levelUpTimes.length + 1
  );
};

const getPushoverRecipient = (neededLevel: number, activeProfile: Profile) => {
  const availableTargetsCount = activeProfile.notificationTargets.length;

  return neededLevel < availableTargetsCount
    ? activeProfile.notificationTargets[neededLevel]
    : null;
};

const retryNotifications = async (
  states: AlarmState[],
  situation: Situation,
  context: Context,
): Promise<AlarmState[]> => {
  const updatedStates = await Promise.all(
    states.map(async state => {
      const receipt = await context.pushover.sendAlarm(situation, state.notificationTarget);

      // Update alarm state to have receipt if we got it
      if (receipt) {
        const [updatedState] = await context.db.alarms.markAlarmAsProcessed({
          ...state,
          notificationReceipt: receipt,
        });

        return updatedState;
      }
    }),
  );
  return updatedStates.filter(isNotNull);
};

const updateAlarm = async (
  activeAlarm: Alarm,
  activeProfile: Profile,
  context: Context,
): Promise<AlarmState[]> => {
  const { log } = context;
  const { situation } = activeAlarm;
  const currentAlarmState = getAlarmState(activeAlarm);
  const { alarmLevel, validAfter } = currentAlarmState;

  // Alarm is not yet valid
  if (isTimeBeforeOrEqual(context.timestamp(), validAfter)) {
    return [currentAlarmState];
  }

  // Retry all notifications that are missing receipts
  const statesMissingReceipts = activeAlarm.alarmStates.filter(
    state => !state.notificationProcessedAt,
  );

  const neededLevel = getNeededAlarmLevel(situation, validAfter, activeProfile, context);

  // No need to escalate yet, just retry notifications that are missing receipts and return
  if (neededLevel === alarmLevel) {
    return retryNotifications(statesMissingReceipts, situation, context);
  }

  const pushoverRecipient = getPushoverRecipient(neededLevel, activeProfile);

  // Send new pushover if there is recipient
  const receipt = pushoverRecipient
    ? await context.pushover.sendAlarm(situation, pushoverRecipient)
    : null;

  // Escalate and create new alarm state
  return context.db.alarms.createAlarmState({
    alarmId: activeAlarm.id,
    alarmLevel: neededLevel,
    validAfter: context.timestamp(),
    notificationTarget: pushoverRecipient,
    notificationReceipt: receipt,
    notificationProcessedAt: receipt ? context.timestamp() : null,
  });
};

export const createAlarm = async (
  situation: Situation,
  context: Context,
): Promise<AlarmState[] | null> => {
  const [createdAlarm] = await context.db.alarms.createAlarm({
    situation,
  });

  if (!createdAlarm) {
    // TODO: handle errors
    console.log('HANDLE ERROR');
    return null;
  }

  return context.db.alarms.createAlarmState({
    alarmId: createdAlarm.id,
    alarmLevel: INITIAL_ALARM_LEVEL,
    validAfter: context.timestamp(),
  });
};
