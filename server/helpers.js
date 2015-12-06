import * as data from './data';

export const MIN_IN_MILLIS = 60 * 1000;
export const HEAVY_NOISE_LIMIT = 3; // Switches to raw (set in Dexcom)

export function detectActualGlucose(entry) {
    entry.nb_glucose_value = changeSGVUnit(entry.noise < HEAVY_NOISE_LIMIT ? entry.sgv : calculateRaw(entry, data.getLatestCalibration()));
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

