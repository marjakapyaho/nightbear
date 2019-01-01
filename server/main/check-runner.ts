import { runAlarmChecks } from 'core/alarms/alarms';
import { runAnalysis } from 'core/analyser/analyser';
import { HOUR_IN_MS, MIN_IN_MS } from 'core/calculations/calculations';
import { getMergedEntriesFeed } from 'core/entries/entries';
import { Context } from 'core/models/api';
import { first } from 'lodash';

const ANALYSIS_RANGE = 3 * HOUR_IN_MS;
const CHECK_RUN_INTERVAL = 2 * MIN_IN_MS;
let nextCheck: NodeJS.Timer;

export function checkRunnerTimer(context: Context) {
  // Clear previous timer (if exists)
  if (nextCheck) {
    global.clearTimeout(nextCheck);
  }

  // And set next one
  nextCheck = global.setTimeout(checkRunnerTimer, CHECK_RUN_INTERVAL, context);

  return runChecks(context);
}

export function runChecks(context: Context) {
  return Promise.all([
    context.storage.loadLatestTimelineModels('ActiveProfile', 1),
    getMergedEntriesFeed(context, ANALYSIS_RANGE),
    context.storage.loadTimelineModels('Insulin', ANALYSIS_RANGE, context.timestamp()),
    context.storage.loadLatestTimelineModels('DeviceStatus', 1),
    context.storage.loadLatestTimelineModels('Alarm', undefined, { isActive: true }),
  ]).then(([latestActiveProfile, sensorEntries, insulin, latestDeviceStatus, alarms]) => {
    const activeProfile = first(latestActiveProfile);
    const deviceStatus = first(latestDeviceStatus);

    if (!activeProfile) throw new Error(`Couldn't find an active profile`);

    const state = runAnalysis(context.timestamp(), activeProfile, sensorEntries, insulin, deviceStatus, alarms);
    context.log.info(`Run analysis returned state: ${state}`);

    return runAlarmChecks(context, state, activeProfile, alarms).then(alarms => {
      context.log.info(`Run checks returned alarms: ${alarms}`);
      return alarms;
    });
  });
}
