import { extend } from 'lodash';
import { Response, Context, createResponse, Request } from 'nightbear/server/models/api';
import { Alarm, Profile } from 'nightbear/server/models/model';
import { MIN_IN_MS } from 'nightbear/server/core/calculations/calculations';
import { ackPushoverAlarms } from 'nightbear/server/utils/pushover';

export function ackLatestAlarm(_request: Request, context: Context): Response {

  return Promise.all([
    context.storage.loadLatestTimelineModels('Alarm', 1), // TODO: active
    context.storage.loadLatestTimelineModels('Profile', 1),
  ])
    .then(([ latestActiveAlarms, activeProfiles ]) => {
      const latestActiveAlarm = latestActiveAlarms[0] as Alarm; // TODO
      const activeProfile = activeProfiles[0] as Profile; // TODO

      if (!latestActiveAlarm) {
        return createResponse();
      }

      const snoozeTime = activeProfile.alarmSettings[latestActiveAlarm.situationType].snoozeMinutes;

      const updatedAlarm = extend(latestActiveAlarm, {
        validAfterTimestamp: context.timestamp() + snoozeTime * MIN_IN_MS,
        alarmLevel: 1,
      });

      return ackPushoverAlarms(updatedAlarm.pushoverReceipts)
        .then(() => context.storage.saveModel(extend(updatedAlarm, { pushoverReceipts: [] })))
        .then(() => createResponse());
    });
}
