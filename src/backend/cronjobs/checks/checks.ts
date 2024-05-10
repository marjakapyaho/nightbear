import { runAlarmChecks } from 'backend/cronjobs/alarms/alarms';
import { runAnalysis } from 'backend/cronjobs/analyser/analyser';
import { Context } from 'backend/utils/api';
import { Cronjob } from 'backend/utils/cronjobs';
import { Alarm } from 'shared/types/alarms';
import { Profile } from 'shared/types/profiles';
import { SensorEntry } from 'shared/types/timelineEntries';
import { getActiveProfile } from 'shared/utils/profiles';
import { getRange } from './utils';

export const checks = (async (context: Context) => {
  const { log } = context;
  const currentTimestamp = context.timestamp();

  log(`----- STARTED CHECKS AT: ${currentTimestamp} -----`);

  const sensorEntries = await context.db.getSensorEntriesByTimestamp(getRange(context, 3));
  const insulinEntries = await context.db.getInsulinEntriesByTimestamp(getRange(context, 24));
  const carbEntries = await context.db.getCarbEntriesByTimestamp(getRange(context, 24));
  const meterEntries = await context.db.getMeterEntriesByTimestamp(getRange(context, 3));
  const activeProfile = await context.db.getActiveProfile();
  const alarms = await context.db.getAlarms(getRange(context, 12));
  const activeAlarm = await context.db.getActiveAlarm();

  log(`1. Using profile: ${activeProfile.profileName}`);

  const situation = runAnalysis({
    currentTimestamp,
    activeProfile,
    sensorEntries,
    meterEntries,
    insulinEntries,
    carbEntries,
    alarms,
  });

  log(`2. Active situation: ${situation || '-'}`);

  const alarmId = await runAlarmChecks(context, situation, activeProfile, activeAlarm);

  log(`3. Active alarm with id: ${alarmId || '-'}`);
}) satisfies Cronjob;
