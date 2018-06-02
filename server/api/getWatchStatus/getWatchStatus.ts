import { Response, Context, createResponse, Request } from 'server/models/api';

export function getWatchStatus(_request: Request, context: Context): Response {
  return Promise.all([
    context.storage.loadLatestTimelineModels('Alarm', 5), // TODO: should be active alarms
    context.storage.loadLatestTimelineModels('DeviceStatus', 1),
  ])
    .then(([ alarms, deviceStatus ]) => createResponse({
      alarms,
      deviceStatus: deviceStatus[0] || {},
    }));
}
