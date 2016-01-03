import _ from 'lodash';
import * as helpers from './helpers';

export const STATUS_OUTDATED = 'outdated';
export const STATUS_HIGH = 'high';
export const STATUS_LOW = 'low';
export const STATUS_RISING = 'rising';
export const STATUS_FALLING = 'falling';
export const STATUS_OK = 'ok';

export function analyseData(data) {
    var profile = getProfile();

    if (data.length < 1) {
        return STATUS_OUTDATED;
    }

    let latestDataPoint = _.sortBy(data, 'date')[0];
    let latestTime = latestDataPoint.date;
    let latestGlucoseValue = latestDataPoint.nb_glucose_value;
    let latestDirection = latestDataPoint.direction;

    if (currentTime() - latestTime > profile.TIME_SINCE_SGV_LIMIT) {
        return { status: STATUS_OUTDATED, data: latestDataPoint };
    }
    else if (latestGlucoseValue > profile.HIGH_LEVEL_ABS) {
        return { status: STATUS_HIGH, data: latestDataPoint };
    }
    else if (latestGlucoseValue < profile.LOW_LEVEL_ABS) {
        return { status: STATUS_LOW, data: latestDataPoint };
    }
    else if (latestGlucoseValue > profile.HIGH_LEVEL_REL && detectDirection(latestDirection) === 'up') {
        return { status: STATUS_RISING, data: latestDataPoint };
    }
    else if (latestGlucoseValue < profile.LOW_LEVEL_REL && detectDirection(latestDirection) === 'down') {
        return { status: STATUS_FALLING, data: latestDataPoint };
    }
    else {
        return { status: STATUS_OK, data: latestDataPoint };
    }
}

export function getProfile() {

    if (new Date().getHours() > 9) { // DAY
        return {
            HIGH_LEVEL_REL: 10,
            HIGH_LEVEL_ABS: 16,
            LOW_LEVEL_REL: 7,
            LOW_LEVEL_ABS: 4,
            TIME_SINCE_SGV_LIMIT: 20 * helpers.MIN_IN_MS
        };
    }
    else { // NIGHT
        return {
            HIGH_LEVEL_REL: 13,
            HIGH_LEVEL_ABS: 16,
            LOW_LEVEL_REL: 6,
            LOW_LEVEL_ABS: 4,
            TIME_SINCE_SGV_LIMIT: 30 * helpers.MIN_IN_MS
        };
    }
}

function detectDirection(direction) {
    if (direction === 'DoubleUp' ||
        direction === 'SingleUp') {
        return 'up';
    }
    else if (direction === 'DoubleDown' ||
             direction === 'SingleDown') {
        return 'down';
    }
    else if (direction === 'Flat' ||
             direction === 'FortyFiveUp' ||
             direction === 'FortyFiveDown') {
        return 'flat';
    }
    else {
        return undefined;
    }
}
