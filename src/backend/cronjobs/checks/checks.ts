import { runAlarmChecks } from 'backend/cronjobs/alarms/alarms';
import { runAnalysis } from 'backend/cronjobs/analyser/analyser';
import { Cronjob } from 'backend/utils/cronjobs';
import { Context } from 'backend/utils/api';
import { getActiveProfile } from 'shared/utils/profiles';
import { Alarm } from 'shared/types/alarms';
import { Profile } from 'shared/types/profiles';
import { SensorEntry } from 'shared/types/timelineEntries';
import { getRange } from './utils';

export const checks: Cronjob = async (context: Context, _journal) => {
  const { log } = context;

  log('--- STARTED CHECKS ---');

  const sensorEntriesArray = await context.db.sensorEntries.byTimestamp(getRange(context));
  const insulinEntries = await context.db.insulinEntries.byTimestamp(getRange(context));
  const carbEntries = await context.db.carbEntries.byTimestamp(getRange(context));
  const meterEntries = await context.db.meterEntries.byTimestamp(getRange(context));
  const profilesArray = await context.db.profiles.getProfiles();
  const alarmsArray = await context.db.alarms.getAlarms(getRange(context));
  const [activeAlarmObj] = await context.db.alarms.getAlarms({ onlyActive: true });

  // TODO: FIX THESE
  const sensorEntries = sensorEntriesArray as SensorEntry[];
  const alarms = alarmsArray as unknown as Alarm[];
  const activeAlarm = activeAlarmObj as unknown as Alarm;
  const profiles = profilesArray as Profile[];

  const activeProfile = getActiveProfile(profiles);

  // TODO: MOVE THIS
  if (!activeProfile) throw new Error('Could not find active profile in runChecks()');

  log(`1. Using profile: ${activeProfile?.profileName}`);

  const situation = runAnalysis({
    currentTimestamp: context.timestamp(),
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
};
