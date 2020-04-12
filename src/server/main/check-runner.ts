import { runAlarmChecks } from 'core/alarms/alarms';
import { runAnalysis } from 'core/analyser/analyser';
import { HOUR_IN_MS } from 'core/calculations/calculations';
import { getMergedEntriesFeed } from 'core/entries/entries';
import { Context } from 'core/models/api';
import { extendLogger } from 'core/utils/logging';
import { first, identity, map } from 'lodash';

const ANALYSIS_RANGE = 3 * HOUR_IN_MS;

export function runChecks(context: Context) {
  const log = extendLogger(context.log, 'check');
  log('--- Started runChecks() ---');
  return Promise.all([
    context.storage.loadLatestTimelineModels('ActiveProfile', 1),
    getMergedEntriesFeed(context, ANALYSIS_RANGE),
    context.storage.loadTimelineModels(['Insulin'], ANALYSIS_RANGE, context.timestamp()),
    context.storage.loadLatestTimelineModels('DeviceStatus', 1),
    context.storage.loadLatestTimelineModels('Alarm', undefined, { isActive: true }),
  ]).then(([latestActiveProfile, sensorEntries, insulin, latestDeviceStatus, alarms]) => {
    const activeProfile = first(latestActiveProfile);
    const deviceStatus = first(latestDeviceStatus);

    if (!activeProfile) throw new Error('Could not find active profile in runChecks()');

    log(`1. Using profile: ${activeProfile?.profileName}`);
    const state = runAnalysis(context.timestamp(), activeProfile, sensorEntries, insulin, deviceStatus, alarms);

    const situations = map(state, (val, key) => (val ? key : null)).filter(identity);
    log('2. Active situations: ' + (situations.length ? situations.join(', ') : 'n/a'));

    return runAlarmChecks(context, state, activeProfile, alarms).then(alarms => {
      log(
        `There were changes in ${alarms.length} alarms with types: ${alarms
          .map(alarm => alarm.situationType)
          .join(', ')}`,
      );
      return alarms;
    });
  });
}
