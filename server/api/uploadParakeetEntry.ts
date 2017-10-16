import { Response, Request, createResponse } from '../utils/api';
import { DeviceStatus, ParakeetSensorEntry } from '../utils/model';

export function uploadParakeetEntry(request: Request): Response {

  const { requestParams } = request;

  // Parse parakeet entry
  const parakeetEntry: ParakeetSensorEntry = parseParakeetEntry(requestParams);

  // Parse parakeet status
  const parakeetStatus: DeviceStatus = parseParakeetStatus(requestParams);

  // Save entries to db: TODO
  console.log(parakeetEntry); // tslint:disable-line:no-console
  console.log(parakeetStatus); // tslint:disable-line:no-console

  return createResponse('!ACK  0!');
}

function parseParakeetEntry(params: { [key: string]: string }): ParakeetSensorEntry {
  return {
    modelType: 'ParakeetSensorEntry',
    modelVersion: 1,
    timestamp: Date.now(),
    bloodGlucose: 5.5, // TODO
    measuredAtTimestamp: Date.now() - parseInt(params.ts, 10),
    rawFiltered: parseInt(params.lf, 10),
    rawUnfiltered: parseInt(params.lv, 10),
  };
}

function parseParakeetStatus(params: { [key: string]: string }): DeviceStatus {
  return {
    modelType: 'DeviceStatus',
    modelVersion: 1,
    deviceName: 'parakeet',
    timestamp: Date.now(),
    batteryLevel: parseInt(params.bp, 10),
    geolocation: params.gl,
  };
}
