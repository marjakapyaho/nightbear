import { alarmWithUpdatedState } from 'shared/alarms/alarms';
import { MIN_IN_MS } from 'shared/calculations/calculations';
import { Context, createResponse, Request, Response } from 'shared/storage/api';
import { getAlarmState } from 'shared/models/utils';
import { first } from 'lodash';
import { extendLogger } from 'shared/utils/logging';
import { NIGHT_PROFILE_NAME, NO_WAKE_UPS_PROFILE_NAME, WATCH_NAME } from 'shared/utils/const';

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
    if (
      (activeProfile.profileName === NIGHT_PROFILE_NAME || activeProfile.profileName === NO_WAKE_UPS_PROFILE_NAME) &&
      ackedBy === WATCH_NAME
    ) {
      context.log(`Ack cancelled (profile: ${activeProfile.profileName}, source: ${ackedBy})`);
      return createResponse();
    }

    log(`Acking (by: "${ackedBy}") alarms: ${latestActiveAlarms.map(alarm => alarm.situationType).join(', ')}`);

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
