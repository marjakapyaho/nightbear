import {
  calculateRaw,
  changeBloodGlucoseUnitToMmoll,
  isDexcomEntryValid,
  MIN_IN_MS,
} from 'core/calculations/calculations';
import { Context, createResponse, Request, Response } from 'core/models/api';
import {
  DeviceStatus,
  DexcomCalibration,
  DexcomRawSensorEntry,
  DexcomSensorEntry,
  MeterEntry,
  Model,
} from 'core/models/model';
import { getModelRef } from 'core/storage/couchDbStorage';
import { first } from 'lodash';

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
  const logCtx = `uploadDexcomEntry: "${requestObject.type}" at "${requestObject.date || ''}"`;

  return Promise.resolve()
    .then(
      (): Promise<Model | null> => {
        // Handle Dexcom Uploader DeviceStatus:
        if (requestObject.hasOwnProperty('uploaderBattery')) {
          const dexcomStatus: DeviceStatus = parseDexcomStatus(requestObject, timestamp);
          return context.storage.saveModel(dexcomStatus);
        }

        // Handle Dexcom-generated MeterEntry's:
        if (requestObject.type === ENTRY_TYPES.METER_ENTRY) {
          const timestamp = parseInt(requestObject.date, 10);
          return Promise.resolve()
            .then(() => context.storage.loadTimelineModels('MeterEntry', 0, timestamp)) // see if we can find a MeterEntry that already exists with this exact timestamp
            .then(entries => first(entries))
            .then(existingEntry => {
              if (existingEntry) {
                // already exists in the DB -> no need to do anything!
                console.log(`${logCtx}: MeterEntry already exists in DB`);
                return Promise.resolve(null);
              }
              return context.storage.saveModel(parseMeterEntry(requestObject)); // we didn't find the entry yet -> create it
            });
        }

        // Handle Dexcom calibrations:
        if (requestObject.type === ENTRY_TYPES.CALIBRATION) {
          const timestamp = parseInt(requestObject.date, 10);
          return Promise.resolve()
            .then(() => context.storage.loadTimelineModels('DexcomCalibration', 0, timestamp)) // see if we can find a DexcomCalibration that already exists with this exact timestamp
            .then(cals => first(cals))
            .then(existingCal => {
              if (existingCal) {
                // already exists in the DB -> no need to do anything!
                console.log(`${logCtx}: DexcomCalibration already exists in DB`);
                return Promise.resolve(null);
              }
              const range = CAL_PAIRING.BEFORE + CAL_PAIRING.AFTER;
              const rangeEnd = timestamp + CAL_PAIRING.AFTER;
              return Promise.resolve()
                .then(() => context.storage.loadTimelineModels('MeterEntry', range, rangeEnd))
                .then(entries => entries.filter(entry => entry.source === 'dexcom'))
                .then(entries => {
                  if (entries.length === 0) {
                    // TODO: Retry until it's found..?
                    console.log(`${logCtx}: Didn't find a MeterEntry to link with -> ignoring`);
                    return Promise.resolve(null);
                  }
                  if (entries.length > 1) {
                    console.log(`${logCtx}: Found more than 1 MeterEntry to link with -> very suspicious -> ignoring`);
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
                console.log(`${logCtx}: Didn't find a DexcomCalibration -> ignoring`);
                return Promise.resolve(null);
              }
              if (cal.slope === null) {
                console.log(`${logCtx}: Didn't find a DexcomCalibration with a slope -> very suspicious -> ignoring`);
                return Promise.resolve(null);
              }
              const newEntry: DexcomSensorEntry | DexcomRawSensorEntry = parseDexcomEntry(requestObject, cal);
              return context.storage.saveModel(newEntry);
            });
        }

        throw new Error(`Unknown Dexcom entry type "${requestObject.type}"`);
      },
    )
    .then((model: Model | null) => console.log(`${logCtx} => "${model ? model.modelType : 'null'}"`))
    .then(() => Promise.resolve(createResponse(requestObject)));
}

export function parseDexcomEntry(
  requestObject: { [key: string]: string },
  latestCalibration: DexcomCalibration,
): DexcomSensorEntry | DexcomRawSensorEntry {
  const { slope, intercept, scale } = latestCalibration;

  const dexBloodGlucose = parseInt(requestObject.sgv, 10);
  const signalStrength = parseInt(requestObject.rssi, 10);
  const noiseLevel = parseInt(requestObject.noise, 10);
  const filtered = parseInt(requestObject.filtered, 10);
  const unfiltered = parseInt(requestObject.unfiltered, 10);
  const uploadTimestamp = parseInt(requestObject.date, 10);

  if (isDexcomEntryValid(noiseLevel, dexBloodGlucose)) {
    return {
      modelType: 'DexcomSensorEntry',
      timestamp: uploadTimestamp,
      bloodGlucose: changeBloodGlucoseUnitToMmoll(dexBloodGlucose),
      signalStrength,
      noiseLevel,
    };
  } else {
    return {
      modelType: 'DexcomRawSensorEntry',
      timestamp: uploadTimestamp,
      bloodGlucose: calculateRaw(unfiltered, slope as number, intercept as number, scale as number), // TODO
      signalStrength,
      noiseLevel,
      rawFiltered: filtered,
      rawUnfiltered: unfiltered,
    };
  }
}

export function parseMeterEntry(requestObject: { [key: string]: string }): MeterEntry {
  const bgTimestamp = parseInt(requestObject.date, 10);
  const bloodGlucose = parseInt(requestObject.mbg, 10);

  return {
    modelType: 'MeterEntry',
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
    deviceName: 'dexcom-uploader',
    timestamp,
    batteryLevel,
    geolocation: null,
  };
}
