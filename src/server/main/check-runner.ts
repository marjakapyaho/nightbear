import { runAlarmChecks } from 'core/alarms/alarms';
import { runAnalysis } from 'core/analyser/analyser';
import { HOUR_IN_MS, MIN_IN_MS } from 'core/calculations/calculations';
import { getMergedEntriesFeed } from 'core/entries/entries';
import { Context } from 'core/models/api';
import { first, map, identity } from 'lodash';

const ANALYSIS_RANGE = 3 * HOUR_IN_MS;
const CHECK_RUN_INTERVAL = 2 * MIN_IN_MS;
let nextCheck: NodeJS.Timer;

export function startRunningChecks(context: Context) {
  // Clear previous timer (if exists)
  if (nextCheck) {
    global.clearTimeout(nextCheck);
  }

  // And set next one
  nextCheck = global.setTimeout(startRunningChecks, CHECK_RUN_INTERVAL, context);

  return runChecks(context).catch(err => context.log.error(`Nightbear check runner error: ${err.message}`, err));
}

export function runChecks(context: Context) {
  context.log.info('Starting check run (#1)');
  return Promise.all([
    context.storage.loadLatestTimelineModels('ActiveProfile', 1),
    getMergedEntriesFeed(context, ANALYSIS_RANGE),
    context.storage.loadTimelineModels(['Insulin'], ANALYSIS_RANGE, context.timestamp()),
    context.storage.loadLatestTimelineModels('DeviceStatus', 1),
    context.storage.loadLatestTimelineModels('Alarm', undefined, { isActive: true }),
  ]).then(([latestActiveProfile, sensorEntries, insulin, latestDeviceStatus, alarms]) => {
    context.log.info('Starting check run (#2)');
    const activeProfile = first(latestActiveProfile);
    const deviceStatus = first(latestDeviceStatus);

    if (!activeProfile) throw new Error(`Couldn't find an active profile`);

    const state = runAnalysis(context.timestamp(), activeProfile, sensorEntries, insulin, deviceStatus, alarms);
    context.log.info('Analyser returned raw state:', state);
    const situations = map(state, (val, key) => (val ? key : null)).filter(identity);
    context.log.info(`Analyser returned situations: ` + situations.length ? situations.join(', ') : 'n/a');

    return runAlarmChecks(context, state, activeProfile, alarms).then(alarms => {
      context.log.info(
        `There were changes in ${alarms.length} alarms with types: ${alarms
          .map(alarm => alarm.situationType)
          .join(', ')}`,
      );
      return alarms;
    });
  });
}
