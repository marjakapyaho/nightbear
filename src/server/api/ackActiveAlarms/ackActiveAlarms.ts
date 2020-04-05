import { alarmWithUpdatedState } from 'core/alarms/alarms';
import { MIN_IN_MS } from 'core/calculations/calculations';
import { Context, createResponse, Request, Response } from 'core/models/api';
import { getAlarmState } from 'core/models/utils';
import { first } from 'lodash';

export function ackActiveAlarms(request: Request, context: Context): Response {
  return Promise.all([
    context.storage.loadLatestTimelineModels('Alarm', undefined, { isActive: true }),
    context.storage.loadLatestTimelineModels('ActiveProfile', 1),
  ]).then(([latestActiveAlarms, latestActiveProfile]) => {
    const { requestBody } = request;
    const requestObject = requestBody as any; // TODO: fix this when ending support for string
    const ackedBy = requestObject.acknowledged_by; // https://pushover.net/api/receipts#callback
    const activeProfile = first(latestActiveProfile);

    if (!latestActiveAlarms.length || !activeProfile) {
      return createResponse();
    }

    context.log.info(
      `[Check]: Acking (by: ${ackedBy}) alarms with types: ${latestActiveAlarms
        .map(alarm => alarm.situationType)
        .join(', ')}`,
    );

    let allPushOverReceipts: string[] = [];
    const updatedAlarms = latestActiveAlarms.map(alarm => {
      const snoozeTime = activeProfile.alarmSettings[alarm.situationType].snoozeMinutes;
      allPushOverReceipts = allPushOverReceipts.concat(getAlarmState(alarm).pushoverReceipts);
      return alarmWithUpdatedState(alarm, {
        alarmLevel: 1,
        validAfterTimestamp: context.timestamp() + snoozeTime * MIN_IN_MS,
        ackedBy,
        pushoverReceipts: [],
      });
    });

    return context.pushover
      .ackAlarms(allPushOverReceipts)
      .then(() => context.storage.saveModels(updatedAlarms))
      .then(() => createResponse());
  });
}
