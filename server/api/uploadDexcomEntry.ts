import { Response, Request, createResponse, Context } from '../utils/api';
import { DeviceStatus, DexcomCalibration, DexcomRawSensorEntry, DexcomSensorEntry } from '../utils/model';
import { calculateRaw, isDexcomEntryValid, changeBloodGlucoseUnitToMmoll } from '../utils/calculations';

const ENTRY_TYPES = {
  BG_ENTRY: 'sgv',
  METER_ENTRY: 'mbg',
  CALIBRATION: 'cal',
};

export function uploadDexcomEntry(request: Request, context: Context): Response {

  const { requestBody } = request;
  const requestObject = requestBody as any; // we don't know what this object is yet

  if (requestObject.type === ENTRY_TYPES.BG_ENTRY) {
    const latestCalibration = getLatestCalibration(context.timestamp());
    const dexcomEntry: DexcomSensorEntry | DexcomRawSensorEntry = parseDexcomEntry(requestObject, latestCalibration, context.timestamp());
    if (dexcomEntry.modelType === 'DexcomSensorEntry') {
      console.log(dexcomEntry); // tslint:disable-line:no-console
      // TODO: save DexcomSensorEntry
    }
    else {
      console.log(dexcomEntry); // tslint:disable-line:no-console
      // TODO: save DexcomRawSensorEntry
    }
  }
  else if (requestObject.type === ENTRY_TYPES.CALIBRATION || requestObject.type === ENTRY_TYPES.METER_ENTRY) {
    const dexcomCalibration: DexcomCalibration = parseCalibration(requestObject, context.timestamp());
    console.log(dexcomCalibration); // tslint:disable-line:no-console
    // TODO: save DexcomCalibration
  }
  else if (requestObject.hasOwnProperty('uploaderBattery')) {
    const dexcomStatus: DeviceStatus = parseDexcomStatus(requestObject, context.timestamp());
    console.log(dexcomStatus); // tslint:disable-line:no-console
    // TODO: save DeviceStatus
  }

  return createResponse(requestObject); // Nightscout api responds with request data
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
      modelVersion: 1,
      timestamp,
      bloodGlucose: changeBloodGlucoseUnitToMmoll(dexBloodGlucose),
      signalStrength,
      noiseLevel,
    };
  }
  else {
    return {
      modelType: 'DexcomRawSensorEntry',
      modelVersion: 1,
      timestamp,
      bloodGlucose: calculateRaw(unfiltered, slope as number, intercept as number, scale as number), // TODO
      signalStrength,
      noiseLevel,
      rawFiltered: filtered,
      rawUnfiltered: unfiltered,
    };
  }
}

export function parseCalibration(
  requestObject: { [key: string]: string },
  timestamp: number,
): DexcomCalibration {

  const bloodGlucose = parseInt(requestObject.mbg, 10);
  const slope = parseInt(requestObject.slope, 10);
  const intercept = parseInt(requestObject.intercept, 10);
  const scale = parseInt(requestObject.scale, 10);

  // TODO TODO TODO
  const latestCalibration: DexcomCalibration = getLatestCalibration(timestamp);
  if (latestCalibration) {
    // TODO
/*    latestCalibration.slope = slope;
    latestCalibration.intercept = intercept;
    latestCalibration.scale = scale;*/
    return latestCalibration;
  }
  else {
    return {
      modelType: 'DexcomCalibration',
      modelVersion: 1,
      timestamp,
      bloodGlucose: [bloodGlucose],
      isInitialCalibration: false,
      slope,
      intercept,
      scale,
    };
  }
}

export function parseDexcomStatus(
  requestObject: { [key: string]: string },
  timestamp: number,
  ): DeviceStatus {
  const batteryLevel = parseInt(requestObject.uploaderBattery, 10);

  return {
    modelType: 'DeviceStatus',
    modelVersion: 1,
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
    modelVersion: 1,
    timestamp,
    bloodGlucose: [ 4.5 ],
    isInitialCalibration: false,
    slope: 828.3002146147081,
    intercept: 30000,
    scale: 0.9980735302684531,
  };
}
