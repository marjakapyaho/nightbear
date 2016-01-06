import _ from 'lodash';
import * as helpers from './helpers';

export const STATUS_OUTDATED = 'outdated';
export const STATUS_HIGH = 'high';
export const STATUS_LOW = 'low';
export const STATUS_RISING = 'rising';
export const STATUS_FALLING = 'falling';
export const STATUS_OK = 'ok';

export function analyseData({ currentTime }, entries) {
    var profile = getProfile({ currentTime });

    if (entries.length < 1) {
        return { status: STATUS_OUTDATED, data: null };
    }

    let latestDataPoint = _.sortBy(entries, 'date')[entries.length - 1];
    let latestTime = latestDataPoint.date;
    let latestGlucoseValue = latestDataPoint.nb_glucose_value;
    let latestDirection = latestDataPoint.direction;

    // If we have no direction, calculate one
    if (latestDirection === helpers.DIRECTION_NOT_COMPUTABLE) {
        latestDirection = calculateDirection(entries);
    }

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

export function getProfile({ currentTime }) {

    if (new Date(currentTime()).getHours() > 9) { // DAY
        return {
            HIGH_LEVEL_REL: 12,
            HIGH_LEVEL_ABS: 15,
            LOW_LEVEL_REL: 8,
            LOW_LEVEL_ABS: 4,
            TIME_SINCE_SGV_LIMIT: 20 * helpers.MIN_IN_MS
        };
    }
    else { // NIGHT
        return {
            HIGH_LEVEL_REL: 13,
            HIGH_LEVEL_ABS: 15,
            LOW_LEVEL_REL: 6,
            LOW_LEVEL_ABS: 4,
            TIME_SINCE_SGV_LIMIT: 60 * helpers.MIN_IN_MS
        };
    }
}

function calculateSlope(older, newer) {
    return ((newer.nb_glucose_value - older.nb_glucose_value) / (newer.date - older.date)) * helpers.MIN_IN_MS * 5;
}

function calculateDirection(entries) {
    let latest = _.slice(_.sortBy(entries, 'date'), -3);
    let finalSlope, direction, slope1, slope2;

    // If we have over one entry
    if (latest.length === 2) {
        slope1 = calculateSlope(latest[0], latest[1]);
    }
    else if (latest.length === 3) {
        slope1 = calculateSlope(latest[0], latest[1]);
        slope2 = calculateSlope(latest[1], latest[2]);

        finalSlope = (slope1 + slope2) / 2; // TODO: do weighted average
    }
    else {
        return helpers.DIRECTION_NOT_COMPUTABLE;
    }

    let limit1 = 0.3;
    let limit2 = 0.7;
    let limit3 = 1.3;

    if (Math.abs(finalSlope) <= limit1) {
        direction = 'Flat';
    }
    else if (finalSlope < -(limit1) && finalSlope >= -(limit2)) {
        direction = 'FortyFiveDown';
    }
    else if (finalSlope > limit1 && finalSlope <= limit2) {
        direction = 'FortyFiveUp';
    }
    else if (finalSlope < -(limit2) && finalSlope >= -(limit3)) {
        direction = 'SingleDown';
    }
    else if (finalSlope > limit2 && finalSlope <= limit3) {
        direction = 'SingleUp';
    }
    else if (finalSlope < -(limit3)) {
        direction = 'DoubleDown';
    }
    else if (finalSlope > limit3) {
        direction = 'DoubleUp';
    }

    return direction;
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
