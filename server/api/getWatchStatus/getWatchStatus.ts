import { Response, Context, createResponse, Request } from 'core/models/api';

export function getWatchStatus(_request: Request, context: Context): Response {
  return Promise.all([
    context.storage.loadLatestTimelineModels('Alarm', 5, { isActive: true }),
    context.storage.loadLatestTimelineModels('DeviceStatus', 1),
  ]).then(([alarms, deviceStatus]) =>
    createResponse({
      alarms,
      deviceStatus: deviceStatus[0] || {},
    }),
  );
}
