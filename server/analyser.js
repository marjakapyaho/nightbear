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

    if (Date.now() - latestTime > profile.TIME_SINCE_SGV_LIMIT) {
        return STATUS_OUTDATED;
    }
    else if (latestGlucoseValue > profile.HIGH_LEVEL_ABS) {
        return STATUS_HIGH;
    }
    else if (latestGlucoseValue < profile.LOW_LEVEL_ABS) {
        return STATUS_LOW;
    }
    else if (latestGlucoseValue > profile.HIGH_LEVEL_REL && detectDirection(latestDirection) === 'up') {
        return STATUS_RISING;
    }
    else if (latestGlucoseValue < profile.LOW_LEVEL_REL && detectDirection(latestDirection) === 'down') {
        return STATUS_FALLING;
    }
    else {
        return STATUS_OK;
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

function getProfile() {

    if (new Date().getHours() > 9) { // DAY
        return {
            HIGH_LEVEL_REL: 10,
            HIGH_LEVEL_ABS: 16,
            LOW_LEVEL_REL: 7,
            LOW_LEVEL_ABS: 4,
            TIME_SINCE_SGV_LIMIT: 20 * helpers.MIN_IN_MILLIS
        };
    }
    else { // NIGHT
        return {
            HIGH_LEVEL_REL: 13,
            HIGH_LEVEL_ABS: 16,
            LOW_LEVEL_REL: 6,
            LOW_LEVEL_ABS: 4,
            TIME_SINCE_SGV_LIMIT: 30 * helpers.MIN_IN_MILLIS
        };
    }
}
