import { Response, Context, createResponse } from '../../utils/api';
import { Alarm, DeviceStatus } from '../../utils/model';

export function getWatchStatus(context: Context): Response {
  return createResponse({
    alarms: getActiveAlarms(context.timestamp()),
    deviceStatus: getDeviceStatus(context.timestamp()),
  });
}

export function getDeviceStatus(timestamp: number): DeviceStatus {
  // TODO: use timestamp to get device status
  console.log(timestamp); // tslint:disable-line:no-console
  return {
    modelType: 'DeviceStatus',
    deviceName: 'dexcom',
    timestamp: 324234324,
    batteryLevel: 80,
    geolocation: null,
  };
}

export function getActiveAlarms(timestamp: number): Alarm[] {
  // TODO: use timestamp to get active alarms
  console.log(timestamp); // tslint:disable-line:no-console
  return [{
    modelType: 'Alarm',
    creationTimestamp: 324234324,
    validAfterTimestamp: 234432423,
    alarmLevel: 1,
    situationType: 'PERSISTENT_HIGH',
    isActive: true,
    pushoverReceipts: [],
  }];
}
