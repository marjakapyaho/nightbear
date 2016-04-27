import _ from 'lodash';
import * as helpers from './helpers';

export const STATUS_OUTDATED = 'outdated';
export const STATUS_HIGH = 'high';
export const STATUS_PERSISTENT_HIGH = 'persistent_high';
export const STATUS_LOW = 'low';
export const STATUS_RISING = 'rising';
export const STATUS_FALLING = 'falling';
export const STATUS_BATTERY = 'battery';

export const situationObjectToArray = x => _.compact(_.map(x, (val, key) => val ? key : null)); // e.g. { high: true, low: false } => [ 'high' ]

export default app => {

    const log = app.logger(__filename);

    return {
        analyseData
    };

    function analyseData(timelineContent) {
        const state = analyseTimelineSnapshot(_.extend(
            {},
            timelineContent,
            {
                currentTimestamp: app.currentTime(),
                activeProfile: app.profile.getActiveProfile(timelineContent.profileSettings)
            }
        ));
        const stateArray = situationObjectToArray(state);
        log('Detected situations: ' + (stateArray.length ? stateArray.join(', ') : 'n/a'));
        log.debug('Full analysis state:', state);
        return state;
    }

};

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
    let latestNoise = latestDataPoint.noise;

    // If we have no direction, calculate one
    if (latestDirection === helpers.DIRECTION_NOT_COMPUTABLE) {
        latestDirection = calculateDirection(latestEntries, latestNoise);
    }

    state[STATUS_OUTDATED] = currentTimestamp - latestDataPoint.date > activeProfile.TIME_SINCE_SGV_LIMIT;

    state[STATUS_HIGH] = latestGlucoseValue > activeProfile.HIGH_LEVEL_ABS - (_.findWhere(latestAlarms, { type: STATUS_HIGH }) ? 2 : 0);

    const relevantTimeWindow = _.filter(latestEntries, entry => entry.date >= currentTimestamp - helpers.HOUR_IN_MS * 2.5);
    const timeWindowLength = _.last(relevantTimeWindow).date - _.first(relevantTimeWindow).date;
    const haveWideEnoughWindow = timeWindowLength > helpers.HOUR_IN_MS * 2.5 - helpers.MIN_IN_MS * 10; // we need 2.5 hours of data (with 10 min tolerance)
    const haveEnoughDataPoints = relevantTimeWindow.length > 25; // allow a few entries to be missing (2.5 hours would be 30 entries at 5 min intervals)
    const hasCounterConditions = _.some(relevantTimeWindow, entry => ( // reject the entire time period if even a single entry...
        entry.nb_glucose_value > activeProfile.HIGH_LEVEL_ABS || // ...is above the HIGH limit
        entry.nb_glucose_value < activeProfile.HIGH_LEVEL_REL || // ...is below the RELATIVE HIGH limit
        (entry.direction !== 'FortyFiveUp' && entry.direction !== 'Flat') // ...shows any signs of active change, or slow fall
    ));

    state[STATUS_PERSISTENT_HIGH] = (
        haveWideEnoughWindow &&
        haveEnoughDataPoints &&
        !hasCounterConditions
    );

    state[STATUS_LOW] = latestGlucoseValue < activeProfile.LOW_LEVEL_ABS + (_.findWhere(latestAlarms, { type: STATUS_LOW }) ? 2 : 0);

    state[STATUS_RISING] = !state[STATUS_HIGH] && latestGlucoseValue > activeProfile.HIGH_LEVEL_REL && detectDirection(latestDirection) === 'up';

    state[STATUS_FALLING] = !state[STATUS_LOW] && latestGlucoseValue < activeProfile.LOW_LEVEL_REL && detectDirection(latestDirection) === 'down';

    return state;
}

function calculateSlope(older, newer) {
    return ((newer.nb_glucose_value - older.nb_glucose_value) / (newer.date - older.date)) * helpers.MIN_IN_MS * 5;
}

function calculateDirection(entries, latestNoise) {
    let neededDataPointCount = latestNoise >= helpers.NOISE_LEVEL_LIMIT ? 6 : 2;
    let latest = _.slice(_.sortBy(entries, 'date'), -(neededDataPointCount + 1));
    let finalSlope, direction;

    if (latest.length < neededDataPointCount + 1) {
        return helpers.DIRECTION_NOT_COMPUTABLE;
    }

    let sumOfSlopes = 0;
    for (let i = 0; i < neededDataPointCount; i++) {
        sumOfSlopes += calculateSlope(latest[i], latest[i + 1]);
    }

    finalSlope = sumOfSlopes / neededDataPointCount;

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
