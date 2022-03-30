import { runAlarmChecks } from 'core/alarms/alarms';
import { runAnalysis } from 'core/analyser/analyser';
import { HOUR_IN_MS } from 'core/calculations/calculations';
import { getMergedEntriesFeed } from 'core/entries/entries';
import { first, map, identity } from 'lodash';
import { onlyActive } from 'server/utils/data';
import { Cronjob } from 'server/main/cronjobs';

export const ANALYSIS_RANGE = 3 * HOUR_IN_MS;
export const ALARM_FETCH_RANGE = 12 * HOUR_IN_MS;

export const checks: Cronjob = (context, _journal) => {
  const { log } = context;
  log('--- Started checks ---');
  return Promise.all([
    context.storage.loadLatestTimelineModels('ActiveProfile', 1),
    getMergedEntriesFeed(context, ANALYSIS_RANGE),
    context.storage.loadTimelineModels(['Insulin'], ANALYSIS_RANGE, context.timestamp()),
    context.storage.loadTimelineModels(['Carbs'], ANALYSIS_RANGE, context.timestamp()),
    context.storage.loadLatestTimelineModels('DeviceStatus', 1),
    context.storage.loadTimelineModels(['Alarm'], ALARM_FETCH_RANGE, context.timestamp()),
    context.storage.loadLatestTimelineModels('BasalInsulin', 1),
  ]).then(([latestActiveProfile, sensorEntries, insulin, carbs, latestDeviceStatus, alarms, latestBasal]) => {
    const activeProfile = first(latestActiveProfile);
    const deviceStatus = first(latestDeviceStatus);
    const basal = first(latestBasal);

    if (!activeProfile) throw new Error('Could not find active profile in runChecks()');

    log(`1. Using profile: ${activeProfile?.profileName}`);
    const state = runAnalysis(
      context.timestamp(),
      activeProfile,
      sensorEntries,
      insulin,
      carbs,
      deviceStatus,
      alarms,
      basal,
    );

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
};
