import { alarmWithUpdatedState } from 'core/alarms/alarms';
import { MIN_IN_MS } from 'core/calculations/calculations';
import { Context, createResponse, Request, Response } from 'core/models/api';
import { getAlarmState } from 'core/models/utils';
import { first } from 'lodash';
import { extendLogger } from 'core/utils/logging';
import { NIGHT_PROFILE_NAME, WATCH_NAME } from 'core/models/const';

export function ackActiveAlarms(request: Request, context: Context): Response {
  const log = extendLogger(context.log, 'check');
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

    // Disable watch ack at night
    if (activeProfile.profileName === NIGHT_PROFILE_NAME && ackedBy === WATCH_NAME) {
      context.log.info(`Ack cancelled with profile ${activeProfile.profileName} and source ${ackedBy}`);
      return createResponse();
    }

    log(
      `Acking (by: ${ackedBy}) alarms with types: ${latestActiveAlarms.map(alarm => alarm.situationType).join(', ')}`,
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
      .then(alarms => createResponse(alarms));
  });
}
