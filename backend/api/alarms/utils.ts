import { Alarm, getAlarmState, getSnoozeMinutes, isTimeSmaller } from '@nightbear/shared'
import { Context } from '../../utils/api'

export const nothingToAck = (activeAlarm: Alarm, context: Context) =>
  isTimeSmaller(context.timestamp(), getAlarmState(activeAlarm).validAfter)

export const getSnoozeMinutesFromActiveProfile = async (activeAlarm: Alarm, context: Context) => {
  const activeProfile = await context.db.getActiveProfile()
  return getSnoozeMinutes(activeAlarm.situation, activeProfile)
}
