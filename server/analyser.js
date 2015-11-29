import _ from 'lodash';

const HEAVY_NOISE_LIMIT = 3; // Switches to raw (set in Dexcom)

export function analyseData(profile, data, latestCal) {

    if (data.length < 1) {
        return 'outdated';
    }

    let latestDataPoint = _.sortBy(data, 'date')[0];
    let latestNoise = latestDataPoint.noise || 0;
    let latestTime = latestDataPoint.date;
    let latestSGV = changeSGVUnit(latestNoise < HEAVY_NOISE_LIMIT ? latestDataPoint.sgv : calculateRaw(latestDataPoint, latestCal));
    let latestDirection = latestDataPoint.direction;

    if (Date.now() - latestTime > profile.TIME_SINCE_SGV_LIMIT) {
        return 'outdated';
    }
    else if (latestSGV > profile.HIGH_LEVEL_ABS) {
        return 'high';
    }
    else if (latestSGV < profile.LOW_LEVEL_ABS) {
        return 'low';
    }
    else if (latestSGV > profile.HIGH_LEVEL_REL && detectDirection(latestDirection) === 'up') {
        return 'rising';
    }
    else if (latestSGV < profile.LOW_LEVEL_REL && detectDirection(latestDirection) === 'down') {
        return 'falling';
    }
    else {
        return 'ok';
    }
}

function calculateRaw(dataPoint, calData) {
    return calData.scale * (dataPoint.unfiltered - calData.intercept) / calData.slope;
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

function changeSGVUnit(sgv) {
    return Math.round((sgv / 18) * 10) / 10;
}

