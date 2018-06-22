import { find } from 'lodash';
import { Response, Request, createResponse, Context } from 'core/models/api';
import {
  DeviceStatus,
  DexcomCalibration,
  DexcomRawSensorEntry,
  DexcomSensorEntry,
  Model,
} from 'core/models/model';
import { calculateRaw, isDexcomEntryValid, changeBloodGlucoseUnitToMmoll } from 'core/calculations/calculations';

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
    .then((latestCalibrations): Promise<Model | null> => {

      if (requestObject.hasOwnProperty('uploaderBattery')) {
        const dexcomStatus: DeviceStatus = parseDexcomStatus(requestObject, timestamp);
        return context.storage.saveModel(dexcomStatus);
      }

      const latestCalibration = latestCalibrations[0] as DexcomCalibration;

      if (requestObject.type === ENTRY_TYPES.CALIBRATION) {
        const newDexcomCalibration: DexcomCalibration | null = initCalibration(requestObject, latestCalibration);
        if (newDexcomCalibration) {
          return context.storage.saveModel(newDexcomCalibration);
        }
        else {
          return Promise.resolve(null);
        }
      }

      // Meter entry needs initialized calibration
      if (!latestCalibration) {
        return Promise.reject('Could not find incomplete DexcomCalibration for uploading matching meter entry');
      }

      if (requestObject.type === ENTRY_TYPES.METER_ENTRY) {
        const updatedDexcomCalibration: DexcomCalibration | null = amendCalibration(requestObject, latestCalibration);
        if (updatedDexcomCalibration) {
          return context.storage.saveModel(updatedDexcomCalibration);
        }
        else {
          return Promise.resolve(null);
        }
      }

      const latestFullCalibration = find(latestCalibrations as DexcomCalibration[], (cal) => cal.slope !== null); // TODO

      // Bg entry needs full calibration
      if (!latestFullCalibration) {
        return Promise.reject('Could not find complete DexcomCalibration for uploading Dexcom sensor entry');
      }

      if (requestObject.type === ENTRY_TYPES.BG_ENTRY) {
        const dexcomEntry: DexcomSensorEntry | DexcomRawSensorEntry = parseDexcomEntry(requestObject, latestFullCalibration);
        return context.storage.saveModel(dexcomEntry);
      }

      return Promise.reject('Unknown Dexcom entry type');
    })
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
  }
  else {
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

  const timestamp = parseInt(requestObject.date, 10);
  const slope = parseFloat(requestObject.slope);
  const intercept = parseFloat(requestObject.intercept);
  const scale = parseFloat(requestObject.scale);

  // Only proceed if we don't already have this calibration
  if (cal && timestamp === cal.timestamp) {
    return null;
  }
  else {
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
}

export function amendCalibration(
  requestObject: { [key: string]: string },
  cal: DexcomCalibration,
): DexcomCalibration | null {

  const bgTimestamp = parseInt(requestObject.date, 10);
  const bloodGlucose = parseInt(requestObject.mbg, 10);

  // Only proceed if we don't already have this meter entry in latest calibration
  if (cal && cal.meterEntries.length === 0) {
    return { ...cal,  meterEntries: [{
        modelType: 'MeterEntry',
        timestamp: bgTimestamp,
        bloodGlucose: changeBloodGlucoseUnitToMmoll(bloodGlucose),
      }],
    };
  }
  else {
    return null;
  }
}

export function parseDexcomStatus(
  requestObject: { [key: string]: string },
  timestamp: number,
  ): DeviceStatus {

  const batteryLevel = parseInt(requestObject.uploaderBattery, 10);

  return {
    modelType: 'DeviceStatus',
    deviceName: 'dexcom',
    timestamp,
    batteryLevel,
    geolocation: null,
  };
}
