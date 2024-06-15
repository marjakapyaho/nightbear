import {
  Situation,
  Profile,
  getTimeMinusTimeMs,
  MIN_IN_MS,
  Alarm,
  AlarmState,
  ALARM_FALLBACK_LEVEL,
  getEscalationAfterMinutes,
} from '@nightbear/shared'
import { Context } from '../../utils/api'
import { findIndex, map, sum, take } from 'lodash'

export type AlarmActions = {
  remove?: Alarm
  keep?: Alarm
  create?: Situation
}

export const getNeededAlarmLevel = (
  currentSituation: Situation,
  validAfter: string,
  activeProfile: Profile,
  context: Context,
) => {
  const hasBeenValidForMinutes = Math.round(
    getTimeMinusTimeMs(context.timestamp(), validAfter) / MIN_IN_MS,
  )
  const levelUpTimes = getEscalationAfterMinutes(currentSituation, activeProfile)

  if (!levelUpTimes) {
    return ALARM_FALLBACK_LEVEL
  }

  const accumulatedTimes = map(levelUpTimes, (_x, i) => sum(take(levelUpTimes, i + 1)))

  return (
    findIndex(accumulatedTimes, minutes => minutes > hasBeenValidForMinutes) + 1 ||
    levelUpTimes.length + 1
  )
}

export const getPushoverRecipient = (neededLevel: number, activeProfile: Profile) => {
  const availableTargetsCount = activeProfile.notificationTargets.length

  return neededLevel < availableTargetsCount
    ? activeProfile.notificationTargets[neededLevel]
    : undefined
}

export const retryNotifications = async (
  states: AlarmState[],
  situation: Situation,
  context: Context,
) =>
  Promise.all(
    states.map(async state => {
      const receipt = state.notificationTarget
        ? await context.pushover.sendAlarm(situation, state.notificationTarget)
        : undefined

      // Update alarm state to have receipt if we got it
      if (receipt) {
        return context.db.markAlarmAsProcessed({
          ...state,
          notificationReceipt: receipt,
        })
      }
    }),
  )
