import { MIN_IN_MS } from 'core/calculations/calculations';
import { Context, createResponse, Request, Response } from 'core/models/api';
import { Alarm, Profile, Settings } from 'core/models/model';
import { extend } from 'lodash';

export function ackLatestAlarm(_request: Request, context: Context): Response {
  return Promise.all([
    context.storage.loadLatestTimelineModels('Alarm', 1, { isActive: true }),
    context.storage.loadLatestTimelineModels('Settings', 1),
  ]).then(([latestActiveAlarms, latestSettings]) => {
    const latestActiveAlarm = latestActiveAlarms[0] as Alarm; // TODO
    const activeSettings = latestSettings[0] as Settings; // TODO
    const activeProfile = activeSettings.activeProfile as Profile;

    if (!latestActiveAlarm) {
      return createResponse();
    }

    const snoozeTime = activeProfile.alarmSettings[latestActiveAlarm.situationType].snoozeMinutes;

    const updatedAlarm = extend(latestActiveAlarm, {
      validAfterTimestamp: context.timestamp() + snoozeTime * MIN_IN_MS,
      alarmLevel: 1,
    });

    return context.pushover
      .ackAlarms(updatedAlarm.pushoverReceipts)
      .then(() => context.storage.saveModel(extend(updatedAlarm, { pushoverReceipts: [] })))
      .then(() => createResponse());
  });
}
