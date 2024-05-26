import { Context, createResponse, Request } from '../../utils/api'
import { getTimePlusMinutes } from '@nightbear/shared'
import { getSnoozeMinutesFromActiveProfile, isThereNothingToAck } from './utils'

export const getActiveAlarm = async (_request: Request, context: Context) => {
  const activeAlarm = await context.db.getActiveAlarm()
  return createResponse(activeAlarm)
}

export const ackActiveAlarm = async (request: Request, context: Context) => {
  const { ackedBy } = request.requestParams

  // Get active alarm
  const activeAlarm = await context.db.getActiveAlarm()

  // If we have nothing to ack, return
  if (isThereNothingToAck(activeAlarm, context)) {
    return createResponse('Nothing to ack')
  }

  // Get situation's snooze minutes from active profile
  const snoozeMinutes = await getSnoozeMinutesFromActiveProfile(activeAlarm, context)

  // Create new alarm state for active alarm with snooze minutes
  await context.db.createAlarmState(
    activeAlarm.id,
    getTimePlusMinutes(context.timestamp(), snoozeMinutes),
    ackedBy,
  )

  // Mark all alarm states as processed (in case there were any notification receipts missing)
  await context.db.markAllAlarmStatesAsProcessed(activeAlarm.id)

  return createResponse(activeAlarm.id)
}
