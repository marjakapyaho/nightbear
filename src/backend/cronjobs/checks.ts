import { runAlarmChecks } from 'backend/cronjobs/alarms/alarms';
import { runAnalysis } from 'backend/cronjobs/analyser/analyser';
import { HOUR_IN_MS } from 'shared/utils/calculations';
import { map, identity } from 'lodash';
import { onlyActive } from 'shared/utils/alarms';
import { Cronjob } from 'backend/utils/cronjobs';
import { Context } from 'backend/utils/api';
import { mockTimelineEntries } from 'shared/mocks/timelineEntries';
import { mockProfiles } from 'shared/mocks/profiles';
import { mockAlarms } from 'shared/mocks/alarms';
import { getActiveProfile } from 'shared/utils/profiles';
import { Alarm } from 'shared/types/alarms';
import { Profile } from 'shared/types/profiles';
import { getTimeAsISOStr, getTimeSubtractedFrom } from 'shared/utils/time';
import { SensorEntry } from 'shared/types/timelineEntries';

export const ANALYSIS_RANGE = 3 * HOUR_IN_MS;
export const ALARM_FETCH_RANGE = 12 * HOUR_IN_MS;

const getRange = (context: Context) => ({
  from: getTimeAsISOStr(getTimeSubtractedFrom(context.timestamp(), ANALYSIS_RANGE)),
  to: context.timestamp(),
});

export const checks: Cronjob = async (context: Context, _journal) => {
  const { log } = context;

  log('--- Started checks ---');

  // TODO: get this better
  const sensorEntries = (await context.db.sensorEntries.byTimestamp(
    getRange(context),
  )) as SensorEntry[];
  const insulinEntries = await context.db.insulinEntries.byTimestamp(getRange(context));
  const carbEntries = await context.db.carbEntries.byTimestamp(getRange(context));
  const meterEntries = await context.db.meterEntries.byTimestamp(getRange(context));
  const profiles = await context.db.profiles.getProfiles();
  const alarms = mockAlarms;
  const [activeAlarm] = await context.db.alarms.getActiveAlarm();

  // TODO: get this better
  const activeProfile = getActiveProfile(profiles as Profile[]);

  if (!activeProfile) throw new Error('Could not find active profile in runChecks()');

  log(`1. Using profile: ${activeProfile?.profileName}`);
  // TODO: merge sensor entries and meter entries

  const situation = runAnalysis({
    currentTimestamp: context.timestamp(),
    activeProfile,
    sensorEntries,
    insulinEntries,
    carbEntries,
    alarms,
  });

  log(`2. Active situation: ${situation || '-'}`);

  // TODO: get this better
  runAlarmChecks(context, situation, activeProfile, activeAlarm as Alarm);
};
