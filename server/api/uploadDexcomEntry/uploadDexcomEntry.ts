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
import { find } from 'lodash';

const ENTRY_TYPES = {
  BG_ENTRY: 'sgv',
  METER_ENTRY: 'mbg',
  CALIBRATION: 'cal',
};

export function uploadDexcomEntry(request: Request, context: Context): Response {
  const { requestBody } = request;
  const requestObject = requestBody as any; // we don't know what this object is yet
  const timestamp = context.timestamp();

  return Promise.resolve()
    .then(() => context.storage.loadLatestTimelineModels('DexcomCalibration', 1))
    .then(
      (latestCalibrations): Promise<Model | null> => {
        if (requestObject.hasOwnProperty('uploaderBattery')) {
          const dexcomStatus: DeviceStatus = parseDexcomStatus(requestObject, timestamp);
          return context.storage.saveModel(dexcomStatus);
        }

        const latestCalibration = latestCalibrations[0] as DexcomCalibration;

        if (requestObject.type === ENTRY_TYPES.METER_ENTRY) {
          const newDexcomCalibration: DexcomCalibration | null = initCalibration(requestObject, latestCalibration);
          if (newDexcomCalibration) {
            return context.storage.saveModel(newDexcomCalibration);
          } else {
            return Promise.resolve(null);
          }
        }

        if (requestObject.type === ENTRY_TYPES.CALIBRATION) {
          const updatedDexcomCalibration: DexcomCalibration | null = amendOrInitCalibration(
            requestObject,
            latestCalibration,
          );
          if (updatedDexcomCalibration) {
            return context.storage.saveModel(updatedDexcomCalibration);
          } else {
            return Promise.resolve(null);
          }
        }

        const latestFullCalibration = find(latestCalibrations as DexcomCalibration[], cal => cal.slope !== null); // TODO

        // Bg entry needs full calibration
        if (!latestFullCalibration) {
          return Promise.reject('Could not find complete DexcomCalibration for uploading Dexcom sensor entry');
        }

        if (requestObject.type === ENTRY_TYPES.BG_ENTRY) {
          const dexcomEntry: DexcomSensorEntry | DexcomRawSensorEntry = parseDexcomEntry(
            requestObject,
            latestFullCalibration,
          );
          return context.storage.saveModel(dexcomEntry);
        }

        return Promise.reject('Unknown Dexcom entry type');
      },
    )
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

export function initCalibration(
  requestObject: { [key: string]: string },
  cal: DexcomCalibration | undefined,
): DexcomCalibration | null {
  const bgTimestamp = parseInt(requestObject.date, 10);
  const bloodGlucose = parseInt(requestObject.mbg, 10);

  // Only proceed if we don't already have this meter entry
  if (cal && find(cal.meterEntries, (entry: MeterEntry) => entry.timestamp === bgTimestamp)) {
    return null;
  } else {
    return {
      modelType: 'DexcomCalibration',
      timestamp: bgTimestamp,
      meterEntries: [
        {
          modelType: 'MeterEntry',
          timestamp: bgTimestamp,
          bloodGlucose: changeBloodGlucoseUnitToMmoll(bloodGlucose),
        },
      ],
      isInitialCalibration: false,
      slope: null,
      intercept: null,
      scale: null,
    };
  }
}

export function amendOrInitCalibration(
  requestObject: { [key: string]: string },
  cal: DexcomCalibration,
): DexcomCalibration | null {
  const timestamp = parseInt(requestObject.date, 10);
  const slope = parseFloat(requestObject.slope);
  const intercept = parseFloat(requestObject.intercept);
  const scale = parseFloat(requestObject.scale);

  const proximityToPreviousCal = cal ? Math.abs(cal.timestamp - timestamp) < 5 * MIN_IN_MS : false;

  // If we have previous calibration that doesn't have cal data
  if (cal && cal.meterEntries.length && proximityToPreviousCal && !cal.slope && !cal.intercept && !cal.scale) {
    return { ...cal, slope, intercept, scale };
  }

  // If there are no matching calibrations, make a new one
  else if (!cal || !(cal.slope === slope && cal.intercept === intercept && cal.scale === scale)) {
    return {
      modelType: 'DexcomCalibration',
      timestamp,
      meterEntries: [],
      isInitialCalibration: false,
      slope,
      intercept,
      scale,
    };
  } else {
    return null;
  }
}

export function parseDexcomStatus(requestObject: { [key: string]: string }, timestamp: number): DeviceStatus {
  const batteryLevel = parseInt(requestObject.uploaderBattery, 10);

  return {
    modelType: 'DeviceStatus',
    deviceName: 'dexcom',
    timestamp,
    batteryLevel,
    geolocation: null,
  };
}
