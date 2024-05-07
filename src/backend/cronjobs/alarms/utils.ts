import { Situation } from 'shared/types/analyser';
import { Profile } from 'shared/types/profiles';
import { Context } from 'backend/utils/api';
import { getTimeMinusTimeMs } from 'shared/utils/time';
import { MIN_IN_MS } from 'shared/utils/calculations';
import { Alarm, AlarmState } from 'shared/types/alarms';
import { findIndex, map, sum, take } from 'lodash';
import { ALARM_FALLBACK_LEVEL } from 'shared/utils/alarms';

export type AlarmActions = {
  remove?: Alarm;
  keep?: Alarm;
  create?: Situation;
};

export const getNeededAlarmLevel = (
  currentSituation: Situation,
  validAfter: string,
  activeProfile: Profile,
  context: Context,
) => {
  const hasBeenValidForMinutes = Math.round(
    getTimeMinusTimeMs(context.timestamp(), validAfter) / MIN_IN_MS,
  );
  const levelUpTimes = activeProfile.situationSettings.find(
    situation => situation.situation === currentSituation,
  )?.escalationAfterMinutes;

  if (!levelUpTimes) {
    return ALARM_FALLBACK_LEVEL;
  }

  const accumulatedTimes = map(levelUpTimes, (_x, i) => sum(take(levelUpTimes, i + 1)));

  return (
    findIndex(accumulatedTimes, minutes => minutes > hasBeenValidForMinutes) + 1 ||
    levelUpTimes.length + 1
  );
};

export const getPushoverRecipient = (neededLevel: number, activeProfile: Profile) => {
  const availableTargetsCount = activeProfile.notificationTargets.length;

  return neededLevel < availableTargetsCount
    ? activeProfile.notificationTargets[neededLevel]
    : null;
};

export const retryNotifications = async (
  states: AlarmState[],
  situation: Situation,
  context: Context,
) =>
  Promise.all(
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
