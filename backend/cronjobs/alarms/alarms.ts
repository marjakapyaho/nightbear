import { Context } from '../../utils/api'
import { Alarm, Situation, Profile } from '@nightbear/shared'
import { getAlarmState, isNotNullish, isTimeSmaller } from '@nightbear/shared'
import {
  AlarmActions,
  getNeededAlarmLevel,
  getPushoverRecipient,
  retryNotifications,
} from './utils'

export const runAlarmChecks = async (
  context: Context,
  situation: Situation | 'NO_SITUATION',
  activeProfile: Profile,
  activeAlarm?: Alarm,
): Promise<string | null> => {
  const { log } = context

  const { remove, keep, create } = detectAlarmActions(situation, activeProfile, activeAlarm)

  if (remove) {
    log(`Removing alarm with situation: ${remove.situation}`)
    await deactivateAlarm(remove, context)
  }

  if (keep) {
    log(`Keeping alarm with situation: ${keep.situation}`)
    return updateAlarm(keep, activeProfile, context)
  }

  if (create) {
    log(`Creating alarm with situation: ${create}`)
    return createAlarm(create, context)
  }

  return null
}

export const detectAlarmActions = (
  situation: Situation | 'NO_SITUATION',
  activeProfile: Profile,
  activeAlarm?: Alarm,
): AlarmActions => {
  // If there is no situation or alarms are disabled, remove active alarm
  if (situation === 'NO_SITUATION' || !activeProfile.alarmsEnabled) {
    return {
      remove: activeAlarm,
    }
  }

  // If there is already alarm of correct type, keep it
  if (activeAlarm && activeAlarm.situation === situation) {
    return {
      keep: activeAlarm,
    }
  }

  // If there is alarm of wrong type, remove it and create new one
  if (activeAlarm && activeAlarm.situation !== situation) {
    return {
      remove: activeAlarm,
      create: situation,
    }
  }

  // There was no previous alarm and there is a situation so create new alarm
  return {
    create: situation,
  }
}

const deactivateAlarm = async (alarm: Alarm, context: Context) => {
  // TODO: Let's not wait for these?
  context.pushover.ackAlarms(
    alarm.alarmStates.map(state => state.notificationReceipt).filter(isNotNullish),
  )

  await context.db.deactivateAlarm(alarm.id, context.timestamp())

  return alarm.id
}

const updateAlarm = async (
  activeAlarm: Alarm,
  activeProfile: Profile,
  context: Context,
): Promise<string> => {
  const { situation } = activeAlarm
  const currentAlarmState = getAlarmState(activeAlarm)
  const { alarmLevel, validAfter } = currentAlarmState

  // Alarm is not yet valid
  if (isTimeSmaller(context.timestamp(), validAfter)) {
    return activeAlarm.id
  }

  // Retry all notifications that are missing receipts
  const statesMissingReceipts = activeAlarm.alarmStates.filter(
    state => !state.notificationProcessedAt,
  )

  const neededLevel = getNeededAlarmLevel(situation, validAfter, activeProfile, context)

  // No need to escalate yet, just retry notifications that are missing receipts and return
  if (neededLevel === alarmLevel) {
    await retryNotifications(statesMissingReceipts, situation, context)
    return activeAlarm.id
  }

  const pushoverRecipient = getPushoverRecipient(neededLevel, activeProfile)

  // Send new pushover if there is recipient
  const receipt = pushoverRecipient
    ? await context.pushover.sendAlarm(situation, pushoverRecipient)
    : undefined

  // Escalate and create new alarm state
  await context.db.createAlarmState(
    activeAlarm.id,
    context.timestamp(),
    undefined,
    neededLevel,
    pushoverRecipient,
    receipt,
    receipt && context.timestamp(),
  )

  return activeAlarm.id
}

export const createAlarm = async (
  situation: Situation,
  context: Context,
): Promise<string | null> => {
  const alarm = await context.db.createAlarmWithState(situation)
  return alarm.id
}
