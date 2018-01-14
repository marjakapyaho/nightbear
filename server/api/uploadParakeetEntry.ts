import { Response, Request, createResponse, Context } from '../utils/api';
import { DeviceStatus, DexcomCalibration, ParakeetSensorEntry } from '../utils/model';
import { calculateRaw } from '../utils/calculations';

const PARAKEET_RESPONSE = '!ACK  0!'; // parakeet needs this response to work

export function uploadParakeetEntry(request: Request, context: Context): Response {

  const { requestParams } = request;

  // Get latest calibration
  const latestCalibration = getLatestCalibration(context.timestamp());

  // Parse parakeet entry
  const parakeetEntry: ParakeetSensorEntry = parseParakeetEntry(requestParams, latestCalibration, context.timestamp());

  // Parse parakeet status
  const parakeetStatus: DeviceStatus = parseParakeetStatus(requestParams, context.timestamp());

  // Save entries to db
  console.log(parakeetEntry); // tslint:disable-line:no-console
  console.log(parakeetStatus); // tslint:disable-line:no-console

  return createResponse(PARAKEET_RESPONSE);
}

export function parseParakeetEntry(
  params: { [key: string]: string },
  latestCalibration: DexcomCalibration,
  timestamp: number,
  ): ParakeetSensorEntry {
  const { slope, intercept, scale } = latestCalibration;

  const filtered = parseInt(params.lf, 10);
  const unfiltered = parseInt(params.lv, 10);
  const millisecondsSinceMeasured = parseInt(params.ts, 10);

  return {
    modelType: 'ParakeetSensorEntry',
    modelVersion: 1,
    timestamp,
    bloodGlucose: calculateRaw(unfiltered, slope, intercept, scale),
    measuredAtTimestamp: timestamp - millisecondsSinceMeasured,
    rawFiltered: filtered,
    rawUnfiltered: unfiltered,
  };
}

export function parseParakeetStatus(
  params: { [key: string]: string },
  timestamp: number,
  ): DeviceStatus {
  const batteryLevel = parseInt(params.bp, 10);
  const geolocation = params.gl;

  return {
    modelType: 'DeviceStatus',
    modelVersion: 1,
    deviceName: 'parakeet',
    timestamp,
    batteryLevel,
    geolocation,
  };
}

// TODO: this should come from db
function getLatestCalibration(timestamp: number): DexcomCalibration {
  return {
    modelType: 'DexcomCalibration',
    modelVersion: 1,
    timestamp,
    bloodGlucose: [ 4.5 ],
    isInitialCalibration: false,
    slope: 828.3002146147081,
    intercept: 30000,
    scale: 0.9980735302684531,
  };
}
