export const MIN_IN_MS = 60 * 1000;
export const HOUR_IN_MS = 60 * MIN_IN_MS;
export const NOISE_LEVEL_LIMIT = 4;
export const DIRECTION_NOT_COMPUTABLE = 'NOT COMPUTABLE'; // when direction not computable, use raw sensor data instead
export const DEFAULT_TREATMENT_TYPE = 'Meal Bolus'; // this is somewhat arbitrary, but "Meal Bolus" is the most applicable of the types available in Nightscout

// Updates the given entry by interpreting RAW data where necessary, and converting units
export function setActualGlucose(entry, latestCalibration) {
    entry.nb_glucose_value = changeSGVUnit(entry.noise < NOISE_LEVEL_LIMIT ? entry.sgv : calculateRaw(entry, latestCalibration));
    return entry;
}

// @example isoTimestamp(1448805744000) => "2015-11-29T14:02:24Z"
export function isoTimestamp(timeInMs) {
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

