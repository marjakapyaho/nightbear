import { Situation } from 'shared/types/analyser';
import { Profile } from 'shared/types/profiles';
import { Context } from 'backend/utils/api';
import { getTimeSubtractedFrom } from 'shared/utils/time';
import { MIN_IN_MS } from 'shared/utils/calculations';
import { AlarmState } from 'shared/types/alarms';
import { findIndex, map, sum, take } from 'lodash';

export const getNeededAlarmLevel = (
  currentSituation: Situation,
  validAfter: string,
  activeProfile: Profile,
  context: Context,
) => {
  const hasBeenValidForMinutes = Math.round(
    getTimeSubtractedFrom(context.timestamp(), validAfter) / MIN_IN_MS,
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
