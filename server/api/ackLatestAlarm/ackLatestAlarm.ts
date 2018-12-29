import { MIN_IN_MS } from 'core/calculations/calculations';
import { Context, createResponse, Request, Response } from 'core/models/api';
import { extend, first } from 'lodash';

export function ackLatestAlarm(_request: Request, context: Context): Response {
  return Promise.all([
    context.storage.loadLatestTimelineModels('Alarm', undefined, { isActive: true }),
    context.storage.loadLatestTimelineModels('ActiveProfile', 1),
  ]).then(([latestActiveAlarms, latestActiveProfile]) => {
    // TODO: ack correct alarm with pushover receipt (https://pushover.net/api/receipts#callback)
    const latestActiveAlarm = first(latestActiveAlarms);
    const activeProfile = first(latestActiveProfile);

    if (!latestActiveAlarm || !activeProfile) {
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
