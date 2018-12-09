import { runAlarmChecks } from 'core/alarms/alarms';
import { runAnalysis } from 'core/analyser/analyser';
import { HOUR_IN_MS, MIN_IN_MS } from 'core/calculations/calculations';
import { getMergedEntriesFeed } from 'core/entries/entries';
import { Context } from 'core/models/api';
import { first } from 'lodash';

const ANALYSIS_RANGE = 3 * HOUR_IN_MS;
const CHECK_RUN_INTERVAL = 2 * MIN_IN_MS;
let nextCheck: NodeJS.Timer;

export function runChecks(context: Context) {
  // Clear previous timer (if exists)
  if (nextCheck) {
    global.clearTimeout(nextCheck);
  }

  // And set next one
  nextCheck = global.setTimeout(runChecks, CHECK_RUN_INTERVAL);

  return Promise.all([
    context.storage.loadLatestTimelineModels('Settings', 1),
    getMergedEntriesFeed(context, ANALYSIS_RANGE),
    context.storage.loadTimelineModels('Insulin', ANALYSIS_RANGE, context.timestamp()),
    context.storage.loadLatestTimelineModels('DeviceStatus', 1),
    context.storage.loadLatestTimelineModels('Alarm', undefined, { isActive: true }),
  ]).then(([settings, sensorEntries, insulin, latestDeviceStatus, alarms]) => {
    const activeSettings = first(settings);
    const deviceStatus = first(latestDeviceStatus);

    if (!activeSettings) throw new Error(`Couldn't load active settings`);

    const activeProfile = activeSettings.activeProfile;
    const state = runAnalysis(context.timestamp(), activeProfile, sensorEntries, insulin, deviceStatus, alarms);

    return runAlarmChecks(context, state, activeProfile, alarms);
  });
}
