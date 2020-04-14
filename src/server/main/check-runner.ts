import { runAlarmChecks } from 'core/alarms/alarms';
import { runAnalysis } from 'core/analyser/analyser';
import { HOUR_IN_MS, MIN_IN_MS } from 'core/calculations/calculations';
import { getMergedEntriesFeed } from 'core/entries/entries';
import { Context } from 'core/models/api';
import { first, map, identity } from 'lodash';
import { extendLogger } from 'core/utils/logging';

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

  return runChecks(context).catch(err => context.log(`Check runner error: ${err.message}`, err));
}

export function runChecks(context: Context) {
  const log = extendLogger(context.log, 'check');
  log('--- Started runChecks() ---');
  return Promise.all([
    context.storage.loadLatestTimelineModels('ActiveProfile', 1),
    getMergedEntriesFeed(context, ANALYSIS_RANGE),
    context.storage.loadTimelineModels(['Insulin'], ANALYSIS_RANGE, context.timestamp()),
    context.storage.loadLatestTimelineModels('DeviceStatus', 1),
    context.storage.loadLatestTimelineModels('Alarm', undefined, { isActive: true }),
    // TODO: we actually need ALL active alarms + alarms that have deactivationTimestamp within past hour
    context.storage.loadTimelineModels(['Alarm'], ANALYSIS_RANGE, context.timestamp()),
  ]).then(([latestActiveProfile, sensorEntries, insulin, latestDeviceStatus, activeAlarms, latestAlarms]) => {
    const activeProfile = first(latestActiveProfile);
    const deviceStatus = first(latestDeviceStatus);

    if (!activeProfile) throw new Error('Could not find active profile in runChecks()');

    log(`1. Using profile: ${activeProfile?.profileName}`);
    const state = runAnalysis(
      context.timestamp(),
      activeProfile,
      sensorEntries,
      insulin,
      deviceStatus,
      activeAlarms,
      latestAlarms,
    );

    const situations = map(state, (val, key) => (val ? key : null)).filter(identity);
    log('2. Active situations: ' + (situations.length ? situations.join(', ') : 'n/a'));

    return runAlarmChecks(context, state, activeProfile, activeAlarms).then(alarms => {
      log(
        `There were changes in ${alarms.length} alarms with types: ${alarms
          .map(alarm => alarm.situationType)
          .join(', ')}`,
      );
      return alarms;
    });
  });
}
