import { runAlarmChecks } from '../alarms/alarms'
import { runAnalysis } from '../analyser/analyser'
import { Context } from '../../utils/api'
import { Cronjob } from '../../utils/cronjobs'
import { getRange } from './utils'

export const checks = (async (context: Context) => {
  const { log } = context
  const currentTimestamp = context.timestamp()

  log(`----- STARTED CHECKS AT: ${currentTimestamp} -----`)

  const sensorEntries = await context.db.getSensorEntriesByTimestamp(getRange(context, 3))
  const insulinEntries = await context.db.getInsulinEntriesByTimestamp(getRange(context, 24))
  const carbEntries = await context.db.getCarbEntriesByTimestamp(getRange(context, 24))
  const meterEntries = await context.db.getMeterEntriesByTimestamp(getRange(context, 3))
  const activeProfile = await context.db.getActiveProfile()
  const alarms = await context.db.getAlarms(getRange(context, 12))
  const activeAlarm = await context.db.getActiveAlarm()

  log(`1. Using profile: ${activeProfile.profileName}`)

  const situation = runAnalysis({
    currentTimestamp,
    activeProfile,
    sensorEntries,
    meterEntries,
    insulinEntries,
    carbEntries,
    alarms,
  })

  log(`2. Active situation: ${situation || '-'}`)

  const alarmId = await runAlarmChecks(context, situation, activeProfile, activeAlarm)

  log(`3. Active alarm with id: ${alarmId || '-'}`)
}) satisfies Cronjob
