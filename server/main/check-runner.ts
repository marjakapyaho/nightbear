import { HOUR_IN_MS, MIN_IN_MS } from 'core/calculations/calculations';
import { Profile, Settings } from 'core/models/model';
import { Context } from 'core/models/api';
import { getMergedEntriesFeed } from 'core/entries/entries';
import { runAnalysis } from 'core/analyser/analyser';
import { runAlarmChecks } from 'core/alarms/alarms';

const ANALYSIS_RANGE = 3 * HOUR_IN_MS;
let nextCheck: NodeJS.Timer;

export function runChecks(context: Context) {
  // Clear previous timer (if exists)
  if (nextCheck) {
    global.clearTimeout(nextCheck);
  }

  // And set next one
  nextCheck = global.setTimeout(runChecks, 2 * MIN_IN_MS);

  return Promise.all([
    context.storage.loadLatestTimelineModels('Settings', 1),
    getMergedEntriesFeed(context, ANALYSIS_RANGE),
    context.storage.loadTimelineModels('Insulin', ANALYSIS_RANGE, context.timestamp()),
    context.storage.loadLatestTimelineModels('DeviceStatus', 1),
    context.storage.loadLatestTimelineModels('Alarm', undefined, { isActive: true }),
  ])
    .then(([settings, sensorEntries, insulin, latestDeviceStatus, alarms ]) => {
      const activeSettings: Settings = settings[0];
      const activeProfile: Profile = activeSettings.activeProfile;
      const state = runAnalysis(
        context.timestamp(),
        activeProfile,
        sensorEntries,
        insulin,
        latestDeviceStatus[0],
        alarms,
      );
      return runAlarmChecks(context, state, activeProfile, alarms);
    });
}