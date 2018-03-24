import { extend, find } from 'lodash';
import { Response, Request, createResponse, Context } from '../../models/api';
import { DeviceStatus, DexcomCalibration, DexcomRawSensorEntry, DexcomSensorEntry, MeterEntry, Model } from '../../models/model';
import { calculateRaw, isDexcomEntryValid, changeBloodGlucoseUnitToMmoll } from '../../core/calculations/calculations';

const ENTRY_TYPES = {
  BG_ENTRY: 'sgv',
  METER_ENTRY: 'mbg',
  CALIBRATION: 'cal',
};

export function uploadDexcomEntry(request: Request, context: Context): Response {
  const { requestBody } = request;
  const requestObject = requestBody as any; // we don't know what this object is yet
  const timestamp = context.timestamp();
  const latestCalibration = getLatestCalibration(context.timestamp());

  return Promise.resolve()
    .then((): Promise<Model> => {
      if (requestObject.type === ENTRY_TYPES.BG_ENTRY) {
        const dexcomEntry: DexcomSensorEntry | DexcomRawSensorEntry = parseDexcomEntry(requestObject, latestCalibration, timestamp);
        return context.storage.saveModel(dexcomEntry);
      }
      else if (requestObject.type === ENTRY_TYPES.METER_ENTRY) {
        const newDexcomCalibration: DexcomCalibration | null = initCalibration(requestObject, latestCalibration, timestamp);
        if (newDexcomCalibration) {
          return context.storage.saveModel(newDexcomCalibration);
        }
      }
      else if (requestObject.type === ENTRY_TYPES.CALIBRATION) {
        const updatedDexcomCalibration: DexcomCalibration | null = parseCalibration(requestObject, latestCalibration);
        if (updatedDexcomCalibration) {
          return context.storage.saveModel(updatedDexcomCalibration);
        }
      }
      else if (requestObject.hasOwnProperty('uploaderBattery')) {
        const dexcomStatus: DeviceStatus = parseDexcomStatus(requestObject, timestamp);
        return context.storage.saveModel(dexcomStatus);
      }
      return Promise.reject('Unknown Dexcom entry type');
    })
    .then(() => Promise.resolve(createResponse(requestObject)));
}

export function parseDexcomEntry(
  requestObject: { [key: string]: string },
  latestCalibration: DexcomCalibration,
  timestamp: number,
  ): DexcomSensorEntry | DexcomRawSensorEntry {

  const { slope, intercept, scale } = latestCalibration;

  const dexBloodGlucose = parseInt(requestObject.sgv, 10);
  const signalStrength = parseInt(requestObject.rssi, 10);
  const noiseLevel = parseInt(requestObject.noise, 10);
  const filtered = parseInt(requestObject.filtered, 10);
  const unfiltered = parseInt(requestObject.unfiltered, 10);

  if (isDexcomEntryValid(noiseLevel, dexBloodGlucose)) {
    return {
      modelType: 'DexcomSensorEntry',
      timestamp,
      bloodGlucose: changeBloodGlucoseUnitToMmoll(dexBloodGlucose),
      signalStrength,
      noiseLevel,
    };
  }
  else {
    return {
      modelType: 'DexcomRawSensorEntry',
      timestamp,
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
  cal: DexcomCalibration,
  timestamp: number,
  ): DexcomCalibration | null {

  const bgTimestamp = parseInt(requestObject.date, 10);
  const bloodGlucose = parseInt(requestObject.mbg, 10);

  // Only proceed if we don't already have this meter entry
  if (cal && find(cal.meterEntries, (entry: MeterEntry) => entry.measuredAt === bgTimestamp)) {
    return null;
  }
  else {
    return {
      modelType: 'DexcomCalibration',
      timestamp,
      meterEntries: [{
        modelType: 'MeterEntry',
        timestamp,
        bloodGlucose: changeBloodGlucoseUnitToMmoll(bloodGlucose),
        measuredAt: bgTimestamp,
      }],
      isInitialCalibration: false,
      slope: null,
      intercept: null,
      scale: null,
    };
  }
}

export function parseCalibration(
  requestObject: { [key: string]: string },
  cal: DexcomCalibration,
): DexcomCalibration | null {

  const slope = parseFloat(requestObject.slope);
  const intercept = parseFloat(requestObject.intercept);
  const scale = parseFloat(requestObject.scale);

  if (cal && cal.meterEntries.length && !cal.slope && !cal.intercept && !cal.scale) {
    return extend(cal, { slope, intercept, scale });
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

// TODO: this should come from db
function getLatestCalibration(timestamp: number): DexcomCalibration {
  return {
    modelType: 'DexcomCalibration',
    timestamp,
    meterEntries: [{
      modelType: 'MeterEntry',
      timestamp,
      bloodGlucose: 7.7,
      measuredAt: timestamp,
    }],
    isInitialCalibration: false,
    slope: 828.3002146147081,
    intercept: 30000,
    scale: 0.9980735302684531,
  };
}
