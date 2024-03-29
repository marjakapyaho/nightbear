import {
  calculateRaw,
  changeBloodGlucoseUnitToMmoll,
  isDexcomEntryValid,
  MIN_IN_MS,
} from 'shared/calculations/calculations';
import { Context, createResponse, Request, Response } from 'shared/models/api';
import {
  DeviceStatus,
  DexcomCalibration,
  DexcomRawSensorEntry,
  DexcomSensorEntry,
  MeterEntry,
  Model,
} from 'shared/models/model';
import { isModel } from 'shared/models/utils';
import { getModelRef } from 'shared/storage/couchDbStorage';
import { first } from 'lodash';
import { generateUuid } from 'shared/utils/id';
import { extendLogger } from 'shared/utils/logging';

const ENTRY_TYPES = {
  BG_ENTRY: 'sgv',
  METER_ENTRY: 'mbg',
  CALIBRATION: 'cal',
};

// When receiving a DexcomCalibration, we look for MeterEntry's to link using this time range
export const CAL_PAIRING = {
  BEFORE: 15 * MIN_IN_MS,
  AFTER: 3 * MIN_IN_MS,
};

export function uploadDexcomEntry(request: Request, context: Context): Response {
  const { requestBody } = request;
  const requestObject = requestBody as any; // we don't know what this object is yet
  const timestamp = context.timestamp();
  const log = extendLogger(context.log, 'upload');
  const logCtx = `with device "${requestObject.device}"`;

  return Promise.resolve()
    .then((): Promise<Model | Model[] | null> => {
      // Handle Dexcom Uploader DeviceStatus:
      if (requestObject.hasOwnProperty('uploaderBattery')) {
        const dexcomStatus: DeviceStatus = parseDexcomStatus(requestObject, timestamp);
        return context.storage.saveModel(dexcomStatus);
      }

      // Handle Dexcom-generated MeterEntry's:
      if (requestObject.type === ENTRY_TYPES.METER_ENTRY) {
        const timestamp = parseInt(requestObject.date, 10);
        return Promise.resolve()
          .then(() => context.storage.loadTimelineModels(['MeterEntry'], 0, timestamp)) // see if we can find a MeterEntry that already exists with this exact timestamp
          .then(entries => first(entries))
          .then(existingEntry => {
            if (existingEntry) {
              // already exists in the DB -> no need to do anything!
              log(`${logCtx}: MeterEntry already exists in DB`);
              return Promise.resolve(null);
            }
            return context.storage.saveModel(parseMeterEntry(requestObject)); // we didn't find the entry yet -> create it
          });
      }

      // Handle Dexcom calibrations:
      if (requestObject.type === ENTRY_TYPES.CALIBRATION) {
        const timestamp = parseInt(requestObject.date, 10);
        return Promise.resolve()
          .then(() => context.storage.loadTimelineModels(['DexcomCalibration'], 0, timestamp)) // see if we can find a DexcomCalibration that already exists with this exact timestamp
          .then(cals => first(cals))
          .then(existingCal => {
            if (existingCal) {
              // already exists in the DB -> no need to do anything!
              log(`${logCtx}: DexcomCalibration already exists in DB`);
              return Promise.resolve(null);
            }
            const range = CAL_PAIRING.BEFORE + CAL_PAIRING.AFTER;
            const rangeEnd = timestamp + CAL_PAIRING.AFTER;
            return Promise.resolve()
              .then(() => context.storage.loadTimelineModels(['MeterEntry'], range, rangeEnd))
              .then(entries => entries.filter(entry => entry.source === 'dexcom'))
              .then(entries => {
                if (entries.length === 0) {
                  // TODO: Retry until it's found..?
                  log(`${logCtx}: Didn't find a MeterEntry to link with -> ignoring`);
                  return Promise.resolve(null);
                }
                if (entries.length > 1) {
                  log(`${logCtx}: Found more than 1 MeterEntry to link with -> very suspicious -> ignoring`);
                  return Promise.resolve(null);
                }
                const newCal = {
                  ...parseDexcomCalibration(requestObject),
                  meterEntries: entries.map(getModelRef), // store a reference to the MeterEntry that was received at the same time from the Dexcom uploader
                };
                return context.storage.saveModel(newCal);
              });
          });
      }

      // Handle Dexcom SensorEntry's:
      if (requestObject.type === ENTRY_TYPES.BG_ENTRY) {
        return Promise.resolve()
          .then(() => context.storage.loadLatestTimelineModel('DexcomCalibration'))
          .then(cal => {
            if (!cal) {
              log(`${logCtx}: Didn't find a DexcomCalibration -> ignoring`);
              return Promise.resolve(null);
            }
            if (cal.slope === null) {
              log(`${logCtx}: Didn't find a DexcomCalibration with a slope -> very suspicious -> ignoring`);
              return Promise.resolve(null);
            }
            const newEntries = parseDexcomEntry(requestObject, cal);
            return context.storage.saveModels(newEntries);
          });
      }

      // Handle Dexcom G6 upload from xDrip+
      if ((requestObject.device || '').match(/^xDrip-Dexcom/)) {
        const timestamp = parseInt(requestObject.date, 10);
        return Promise.resolve()
          .then(() => context.storage.loadTimelineModels(['DexcomG6SensorEntry'], 0, timestamp)) // see if we can find an entry of the same type that already exists with this exact timestamp
          .then(entries => first(entries))
          .then(existingEntry => {
            if (existingEntry) {
              // already exists in the DB -> no need to do anything!
              log(`${logCtx}: ${existingEntry.modelType} already exists in DB`);
              return Promise.resolve(null);
            } else {
              // we didn't find the entry yet -> create it
              return context.storage.saveModel({
                modelType: 'DexcomG6SensorEntry',
                modelUuid: generateUuid(),
                timestamp: requestObject.date,
                bloodGlucose: changeBloodGlucoseUnitToMmoll(requestObject.sgv),
                direction: requestObject.direction,
              });
            }
          });
      }

      // Handle phone status upload from xDrip+
      if ((requestObject.device || '').match(/^HMD/)) {
        const xdripStatus: DeviceStatus = parseXdripStatus(requestObject, timestamp);
        return context.storage.saveModel(xdripStatus);
      }

      throw new Error(`Unknown Dexcom entry type "${requestObject.type}"`);
    })
    .then((model: Model | Model[] | null) => {
      if (!model) log(`${logCtx} => null`);
      else if (isModel(model)) log(`${logCtx} => "${model.modelType}"`);
      else log(`${logCtx} => ${model.map(m => `"${m.modelType}"`).join(' & ')}`);
    })
    .then(() => Promise.resolve(createResponse(requestObject)));
}

export function parseDexcomEntry(
  requestObject: { [key: string]: string },
  latestCalibration: DexcomCalibration,
): Array<DexcomSensorEntry | DexcomRawSensorEntry> {
  const { slope, intercept, scale } = latestCalibration;

  const dexBloodGlucose = parseInt(requestObject.sgv, 10);
  const signalStrength = parseInt(requestObject.rssi, 10);
  const noiseLevel = parseInt(requestObject.noise, 10);
  const filtered = parseInt(requestObject.filtered, 10);
  const unfiltered = parseInt(requestObject.unfiltered, 10);
  const uploadTimestamp = parseInt(requestObject.date, 10);

  const entryRaw: DexcomRawSensorEntry = {
    modelType: 'DexcomRawSensorEntry',
    modelUuid: generateUuid(),
    timestamp: uploadTimestamp,
    bloodGlucose: calculateRaw(unfiltered, slope as number, intercept as number, scale as number), // TODO
    signalStrength,
    noiseLevel,
    rawFiltered: filtered,
    rawUnfiltered: unfiltered,
  };

  if (isDexcomEntryValid(noiseLevel, dexBloodGlucose)) {
    const entry: DexcomSensorEntry = {
      modelType: 'DexcomSensorEntry',
      modelUuid: generateUuid(),
      timestamp: uploadTimestamp,
      bloodGlucose: changeBloodGlucoseUnitToMmoll(dexBloodGlucose),
      signalStrength,
      noiseLevel,
    };
    return [entryRaw, entry];
  } else {
    return [entryRaw];
  }
}

export function parseMeterEntry(requestObject: { [key: string]: string }): MeterEntry {
  const bgTimestamp = parseInt(requestObject.date, 10);
  const bloodGlucose = parseInt(requestObject.mbg, 10);

  return {
    modelType: 'MeterEntry',
    modelUuid: generateUuid(),
    timestamp: bgTimestamp,
    source: 'dexcom',
    bloodGlucose: changeBloodGlucoseUnitToMmoll(bloodGlucose),
  };
}

export function parseDexcomCalibration(requestObject: { [key: string]: string }): DexcomCalibration {
  const timestamp = parseInt(requestObject.date, 10);
  const slope = parseFloat(requestObject.slope);
  const intercept = parseFloat(requestObject.intercept);
  const scale = parseFloat(requestObject.scale);

  return {
    modelType: 'DexcomCalibration',
    modelUuid: generateUuid(),
    timestamp,
    meterEntries: [],
    isInitialCalibration: false,
    slope,
    intercept,
    scale,
  };
}

export function parseDexcomStatus(requestObject: { [key: string]: string }, timestamp: number): DeviceStatus {
  const batteryLevel = parseInt(requestObject.uploaderBattery, 10);

  return {
    modelType: 'DeviceStatus',
    modelUuid: generateUuid(),
    deviceName: 'dexcom-uploader',
    timestamp,
    batteryLevel,
    geolocation: null,
  };
}

export function parseXdripStatus(
  requestObject: { [key: string]: { [key: string]: string } },
  timestamp: number,
): DeviceStatus {
  const batteryLevel = parseInt(requestObject.uploader.battery, 10);

  return {
    modelType: 'DeviceStatus',
    modelUuid: generateUuid(),
    deviceName: 'xdrip-uploader',
    timestamp,
    batteryLevel,
    geolocation: null,
  };
}
