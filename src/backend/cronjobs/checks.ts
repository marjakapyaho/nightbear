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

export const ANALYSIS_RANGE = 3 * HOUR_IN_MS;
export const ALARM_FETCH_RANGE = 12 * HOUR_IN_MS;

// TODO: fix these
export const checks: Cronjob = (context: Context, _journal) => {
  const { log } = context;
  log('--- Started checks ---');
  return Promise.all([
    mockTimelineEntries,
    mockProfiles,
    mockAlarms,
    /*    context.storage.loadLatestTimelineModels('ActiveProfile', 1),
    getTimelineEntries(context, ANALYSIS_RANGE),
    context.storage.loadTimelineModels(['Insulin'], ANALYSIS_RANGE, context.timestamp()),
    context.storage.loadTimelineModels(['Carbs'], ANALYSIS_RANGE, context.timestamp()),
    context.storage.loadLatestTimelineModels('DeviceStatus', 1),
    context.storage.loadTimelineModels(['Alarm'], ALARM_FETCH_RANGE, context.timestamp()),*/
  ]).then(([timelineEntries, profiles, alarms]) => {
    const activeProfile = getActiveProfile(profiles);
    const { sensorEntries, insulinEntries, carbEntries, meterEntries } = timelineEntries;

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

    // TODO
    /*    return runAlarmChecks(context, state, activeProfile, onlyActive(alarms)).then(alarms => {
      log(
        `There were changes in ${alarms.length} alarms with types: ${alarms
          .map(alarm => alarm.situation)
          .join(', ')}`,
      );
    });*/
  });
};
