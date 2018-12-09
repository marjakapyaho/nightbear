import { Context, createResponse, Request, Response } from 'core/models/api';
import { first } from 'lodash';

export function getWatchStatus(_request: Request, context: Context): Response {
  return Promise.all([
    context.storage.loadLatestTimelineModels('Alarm', 5, { isActive: true }),
    context.storage.loadLatestTimelineModels('DeviceStatus', 1),
  ]).then(([alarms, deviceStatus]) =>
    createResponse({
      alarms,
      deviceStatus: first(deviceStatus) || {},
    }),
  );
}
