import { Context, createResponse, Request, Response } from 'shared/storage/api';
import { first } from 'lodash';
import { getAlarmState } from 'shared/models/utils';

export function getWatchStatus(_request: Request, context: Context): Response {
  return Promise.all([
    context.storage.loadLatestTimelineModels('Alarm', undefined, { isActive: true }),
    context.storage.loadLatestTimelineModels('DeviceStatus', 1),
  ]).then(([alarms, deviceStatus]) => {
    const now = context.timestamp();

    // Return only alarms that are not currently snoozing
    const validAlarms = alarms.filter(alarm => {
      const { validAfterTimestamp } = getAlarmState(alarm);
      return now > validAfterTimestamp;
    });

    return createResponse({
      alarms: validAlarms,
      deviceStatus: first(deviceStatus) || {},
    });
  });
}
