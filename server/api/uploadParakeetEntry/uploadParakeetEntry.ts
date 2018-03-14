import { Response, Request, createResponse, Context } from '../../models/api';
import { DeviceStatus, DexcomCalibration, ParakeetSensorEntry } from '../../models/model';
import { calculateRaw } from '../../core/calculations/calculations';

// parakeet needs this response to work
const PARAKEET_RESPONSE = '!ACK  0!';

export function uploadParakeetEntry(request: Request, context: Context): Response {

  const { requestParams } = request;

  // Get latest calibration
  const latestCalibration = getLatestCalibration(context.timestamp());

  // Parse parakeet entry
  const parakeetEntry: ParakeetSensorEntry = parseParakeetEntry(requestParams, latestCalibration, context.timestamp());

  // Parse parakeet status
  const parakeetStatus: DeviceStatus = parseParakeetStatus(requestParams, context.timestamp());

  // Save entries to db
  return context.storage.saveModels([ parakeetEntry, parakeetStatus ])
    .then(() => Promise.resolve(createResponse(PARAKEET_RESPONSE)));
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
    timestamp,
    bloodGlucose: calculateRaw(unfiltered, slope as number, intercept as number, scale as number),
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
    timestamp,
    meterEntries: [{
      modelType: 'MeterEntry',
      timestamp: 1508672249758,
      bloodGlucose: 7.7,
      measuredAt: 2343242424,
    }],
    isInitialCalibration: false,
    slope: 828.3002146147081,
    intercept: 30000,
    scale: 0.9980735302684531,
  };
}
