import { runAlarmChecks } from 'backend/cronjobs/alarms/alarms';
import { runAnalysis } from 'backend/cronjobs/analyser/analyser';
import { HOUR_IN_MS } from 'shared/utils/calculations';
import { first, map, identity } from 'lodash';
import { onlyActive } from 'shared/utils/alarms';
import { Cronjob } from 'backend/utils/cronjobs';
import { getTimelineEntries } from 'backend/api/timelineEntries/handler';
import { Context } from 'backend/utils/api';

export const ANALYSIS_RANGE = 3 * HOUR_IN_MS;
export const ALARM_FETCH_RANGE = 12 * HOUR_IN_MS;

// TODO: fix these
/*export const checks: Cronjob = (context: Context, _journal) => {
  const { log } = context;
  log('--- Started checks ---');
  return Promise.all([
    context.storage.loadLatestTimelineModels('ActiveProfile', 1),
    getTimelineEntries(context, ANALYSIS_RANGE),
    context.storage.loadTimelineModels(['Insulin'], ANALYSIS_RANGE, context.timestamp()),
    context.storage.loadTimelineModels(['Carbs'], ANALYSIS_RANGE, context.timestamp()),
    context.storage.loadLatestTimelineModels('DeviceStatus', 1),
    context.storage.loadTimelineModels(['Alarm'], ALARM_FETCH_RANGE, context.timestamp()),
  ]).then(([latestActiveProfile, sensorEntries, insulin, carbs, latestDeviceStatus, alarms]) => {
    const activeProfile = first(latestActiveProfile);
    const deviceStatus = first(latestDeviceStatus);

    if (!activeProfile) throw new Error('Could not find active profile in runChecks()');

    log(`1. Using profile: ${activeProfile?.profileName}`);
    const state = runAnalysis(context.timestamp(), activeProfile, sensorEntries, insulin, carbs, deviceStatus, alarms);

    const situations = map(state, (val, key) => (val ? key : null)).filter(identity);
    log('2. Active situations: ' + (situations.length ? situations.join(', ') : 'n/a'));

    return runAlarmChecks(context, state, activeProfile, onlyActive(alarms)).then(alarms => {
      log(
        `There were changes in ${alarms.length} alarms with types: ${alarms
          .map(alarm => alarm.situationType)
          .join(', ')}`,
      );
    });
  });
};*/
