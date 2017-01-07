export const MIN_IN_MS = 60 * 1000;
export const HOUR_IN_MS = 60 * MIN_IN_MS;
export const NOISE_LEVEL_LIMIT = 4;
export const DIRECTION_NOT_COMPUTABLE = 'NOT COMPUTABLE'; // when direction not computable, use raw sensor data instead
export const DEFAULT_TREATMENT_TYPE = 'Meal Bolus'; // this is somewhat arbitrary, but "Meal Bolus" is the most applicable of the types available in Nightscout

// Updates the given entry by interpreting RAW data where necessary, and converting units
export function setActualGlucose(entry, latestCalibration) {
    let valueToUse = entry.sgv;
    if (entry.noise >= NOISE_LEVEL_LIMIT || entry.sgv < 40) {
        valueToUse = calculateRaw(entry, latestCalibration);
    }

    entry.nb_glucose_value = changeSGVUnit(valueToUse);

    return entry;
}

export function setActualGlucoseForParakeet(entry, latestCalibration) {
    return changeSGVUnit(calculateRaw(entry, latestCalibration));
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

// Unused parameters:
// rr (cache buster?)
// zi (transmitter id)
// pc (passcode for parakeet)
// bm (?)
// ct (?)
export function convertRawTransmitterData(app, entry, latestCalibration) {
    const date = convertCurrentTimeForParakeet(app, entry.ts); // adapted from parakeet app engine
    return {
        "sensorEntriesRaw": {
            "unfiltered": parseInt(entry.lv, 10),
            "filtered": parseInt(entry.lf, 10),
            "device": "parakeet",
            "type": "raw",
            "nb_glucose_value": setActualGlucoseForParakeet({ unfiltered: parseInt(entry.lv, 10) }, latestCalibration),
            "date": date
        },
        "deviceStatusParakeet": {
            "geoLocation": entry.gl,
            "parakeetBattery": entry.bp,
            "transmitterBattery": entry.db,
            "date": date
        }
    };
}

export function convertCurrentTimeForParakeet(app, timeEntry) {
    return parseInt(parseInt(app.currentTime(), 10) - (parseInt(timeEntry, 10) / 1000) + "000", 10)
}
