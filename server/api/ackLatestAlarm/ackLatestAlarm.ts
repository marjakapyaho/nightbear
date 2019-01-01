import { alarmWithUpdatedState } from 'core/alarms/alarms';
import { MIN_IN_MS } from 'core/calculations/calculations';
import { Context, createResponse, Request, Response } from 'core/models/api';
import { getAlarmState } from 'core/models/utils';
import { first } from 'lodash';

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
    const updatedAlarm = alarmWithUpdatedState(latestActiveAlarm, {
      alarmLevel: 1,
      validAfterTimestamp: context.timestamp() + snoozeTime * MIN_IN_MS,
      ackedBy: null, // TODO: get acker
      pushoverReceipts: [],
    });

    return context.pushover
      .ackAlarms(getAlarmState(latestActiveAlarm).pushoverReceipts)
      .then(() => context.storage.saveModel(updatedAlarm))
      .then(() => createResponse());
  });
}
