import * as data from './data';

export const MIN_IN_MS = 60 * 1000;
export const HOUR_IN_MS = 60 * MIN_IN_MS;
export const DIRECTION_NOT_COMPUTABLE = 'NOT COMPUTABLE'; // when direction not computable, use raw sensor data instead

// Updates the given entry by interpreting RAW data where necessary, and converting units
export function setActualGlucose(entry, latestCalibration) {
    entry.nb_glucose_value = changeSGVUnit(entry.direction !== DIRECTION_NOT_COMPUTABLE ? entry.sgv : calculateRaw(entry, latestCalibration));
    return entry;
}

// @example timestamp(1448805744000) => "2015-11-29T14:02:24Z"
export function timestamp(timeInMs = Date.now()) {
    return new Date(timeInMs).toISOString().replace(/\..*/, 'Z');
}

export function calculateRaw(dataPoint, calData) {
    return calData.scale * (dataPoint.unfiltered - calData.intercept) / calData.slope;
}

// Converts blood glucose values from mg/dL (used by Dexcom) to mmol/L (used in Europe), and rounds to 1 decimal
// @example changeSGVUnit(68) => 3.8
export function changeSGVUnit(sgv) {
    return Math.round((sgv / 18) * 10) / 10;
}

