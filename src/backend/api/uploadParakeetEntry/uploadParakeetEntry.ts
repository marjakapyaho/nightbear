import { calculateRaw } from 'shared/calculations/calculations';
import { Context, createResponse, Request, Response } from 'shared/storage/api';
import { DeviceStatus, DexcomCalibration, ParakeetSensorEntry } from 'shared/models/model';
import { find } from 'lodash';
import { generateUuid } from 'shared/utils/id';

// parakeet needs this response to work
const PARAKEET_RESPONSE = '!ACK  0!';

export function uploadParakeetEntry(request: Request, context: Context): Response {
  const { requestParams } = request;

  return Promise.resolve()
    .then(() => context.storage.loadLatestTimelineModels('DexcomCalibration', 2))
    .then(latestCalibrations => {
      const latestCalibration = find(latestCalibrations as DexcomCalibration[], cal => cal.slope !== null); // TODO
      if (!latestCalibration) {
        throw new Error('Could not find DexcomCalibration for uploading Parakeet entry');
      }

      // Parse parakeet entry
      const parakeetEntry: ParakeetSensorEntry = parseParakeetEntry(
        requestParams,
        latestCalibration,
        context.timestamp(),
      );

      // Parse parakeet status
      const parakeetStatuses: DeviceStatus[] = parseParakeetStatus(requestParams, context.timestamp());

      // Save entries to db
      return context.storage.saveModels([parakeetEntry, ...parakeetStatuses]);
    })
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
    modelUuid: generateUuid(),
    timestamp: timestamp - millisecondsSinceMeasured,
    bloodGlucose: calculateRaw(unfiltered, slope as number, intercept as number, scale as number),
    rawFiltered: filtered,
    rawUnfiltered: unfiltered,
  };
}

export function parseParakeetStatus(params: { [key: string]: string }, timestamp: number): DeviceStatus[] {
  const batteryLevel = parseInt(params.bp, 10);
  const geolocation = params.gl;
  const transmitterBattery = parseInt(params.db, 10);

  return [
    {
      modelType: 'DeviceStatus',
      modelUuid: generateUuid(),
      deviceName: 'parakeet',
      timestamp,
      batteryLevel,
      geolocation,
    },
    {
      modelType: 'DeviceStatus',
      modelUuid: generateUuid(),
      deviceName: 'dexcom-transmitter',
      timestamp,
      batteryLevel: transmitterBattery,
      geolocation: null,
    },
  ];
}
