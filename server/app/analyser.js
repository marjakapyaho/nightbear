import _ from 'lodash';
import * as helpers from './helpers';

export const STATUS_OUTDATED = 'outdated';
export const STATUS_HIGH = 'high';
export const STATUS_PERSISTENT_HIGH = 'persistent_high';
export const STATUS_LOW = 'low';
export const STATUS_RISING = 'rising';
export const STATUS_FALLING = 'falling';
export const STATUS_BATTERY = 'battery';

export default app => {

    const log = app.logger(__filename);

    return {
        analyseData,
        getProfile
    };

    function analyseData(timelineContent) {
        const state = analyseTimelineSnapshot(_.extend(
            {},
            timelineContent,
            {
                currentTimestamp: app.currentTime(),
                activeProfile: getProfile()
            }
        ));
        log('Analysis state:', state);
        return state;
    }

    function getProfile() {
        return getActiveProfile(app.currentTime());
    }

};

export function getActiveProfile(currentTimestamp) {
    if (new Date(currentTimestamp).getHours() > 9) { // DAY
        return {
            HIGH_LEVEL_REL: 10,
            HIGH_LEVEL_ABS: 15,
            LOW_LEVEL_REL: 9,
            LOW_LEVEL_ABS: 5,
            TIME_SINCE_SGV_LIMIT: 20 * helpers.MIN_IN_MS,
            BATTERY_LIMIT: 30,
            ALARM_RETRY: 120,
            ALARM_EXPIRE: 60 * 20 // 20 min
        };
    }
    else { // NIGHT
        return {
            HIGH_LEVEL_REL: 10,
            HIGH_LEVEL_ABS: 15,
            LOW_LEVEL_REL: 6,
            LOW_LEVEL_ABS: 4,
            TIME_SINCE_SGV_LIMIT: 60 * helpers.MIN_IN_MS,
            BATTERY_LIMIT: 10,
            ALARM_RETRY: 30,
            ALARM_EXPIRE: 60 * 120 // 120 min
        };
    }
}

export function analyseTimelineSnapshot({ currentTimestamp, activeProfile, latestEntries, latestTreatments, latestDeviceStatus, latestAlarms }) {
    let state = {};

    // Check battery status
    state[STATUS_BATTERY] = _.isNumber(latestDeviceStatus.uploaderBattery) && latestDeviceStatus.uploaderBattery < activeProfile.BATTERY_LIMIT;

    // Check we have data points
    // if not, just return
    if (latestEntries.length === 0) {
        state[STATUS_OUTDATED] = true;
        return state;
    }

    let latestDataPoint = _.sortBy(latestEntries, 'date')[latestEntries.length - 1];
    let latestGlucoseValue = latestDataPoint.nb_glucose_value;
    let latestDirection = latestDataPoint.direction;

    // If we have no direction, calculate one
    if (latestDirection === helpers.DIRECTION_NOT_COMPUTABLE) {
        latestDirection = calculateDirection(latestEntries);
    }

    state[STATUS_OUTDATED] = currentTimestamp - latestDataPoint.date > activeProfile.TIME_SINCE_SGV_LIMIT;

    state[STATUS_HIGH] = latestGlucoseValue > activeProfile.HIGH_LEVEL_ABS - (_.findWhere(latestAlarms, { type: STATUS_HIGH }) ? 2 : 0);

    const pastTwoHours = _.filter(latestEntries, entry => entry.date >= currentTimestamp - helpers.HOUR_IN_MS * 2);
    const knownTimeWindow = _.last(pastTwoHours).date - _.first(pastTwoHours).date;
    const haveWideEnoughWindow = knownTimeWindow > helpers.HOUR_IN_MS * 2 - helpers.MIN_IN_MS * 10; // allow 10 min tolerance
    const haveEnoughDataPoints = pastTwoHours.length > 18; // allow a few entries to be missing (2 hours would be 24 entries at 5 min intervals)
    const allAreHighEnough = _.filter(pastTwoHours, entry => entry.nb_glucose_value < activeProfile.HIGH_LEVEL_REL).length === 0; // not a single entry is below the HIGH_LEVEL_REL limit

    state[STATUS_PERSISTENT_HIGH] = (
        !state[STATUS_HIGH] &&
        haveWideEnoughWindow &&
        haveEnoughDataPoints &&
        allAreHighEnough &&
        (latestDirection === 'FortyFiveUp' || latestDirection === 'Flat')
    );

    state[STATUS_LOW] = latestGlucoseValue < activeProfile.LOW_LEVEL_ABS + (_.findWhere(latestAlarms, { type: STATUS_LOW }) ? 2 : 0);

    state[STATUS_RISING] = !state[STATUS_HIGH] && latestGlucoseValue > activeProfile.HIGH_LEVEL_REL && detectDirection(latestDirection) === 'up';

    state[STATUS_FALLING] = !state[STATUS_LOW] && latestGlucoseValue < activeProfile.LOW_LEVEL_REL && detectDirection(latestDirection) === 'down';

    return state;
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
}
