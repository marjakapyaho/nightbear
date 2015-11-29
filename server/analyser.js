import _ from 'lodash';

const HIGH_LEVEL_REL = 10;
const HIGH_LEVEL_ABS = 16;
const LOW_LEVEL_REL = 7;
const LOW_LEVEL_ABS = 4;
const HEAVY_NOISE_LIMIT = 3; // Switch to raw
const TIME_SINCE_SGV_LIMIT = 20 * 60 * 1000; // 20 min in milliseconds

export function analyseData(data, latestCal) {

    if (data.length < 1) {
        return 'outdated';
    }

    let latestDataPoint = _.sortBy(data, 'date')[0];
    let latestNoise = latestDataPoint.noise || 0;
    let latestTime = latestDataPoint.date;
    let latestSGV = changeSGVUnit(latestNoise < HEAVY_NOISE_LIMIT ? latestDataPoint.sgv : calculateRaw(latestDataPoint, latestCal));
    let latestDirection = latestDataPoint.direction;

    if (Date.now() - latestTime > TIME_SINCE_SGV_LIMIT) {
        return 'outdated';
    }
    else if (latestSGV > HIGH_LEVEL_ABS) {
        return 'high';
    }
    else if (latestSGV < LOW_LEVEL_ABS) {
        return 'low';
    }
    else if (latestSGV > HIGH_LEVEL_REL && detectDirection(latestDirection) === 'up') {
        return 'rising';
    }
    else if (latestSGV < LOW_LEVEL_REL && detectDirection(latestDirection) === 'down') {
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
        direction === 'SingleUp' ||
        direction === 'FortyFiveUp') {
        return 'up';
    }
    else if (direction === 'DoubleDown' ||
             direction === 'SingleDown' ||
             direction === 'FortyFiveDown') {
        return 'down';
    }
    else if (direction === 'Flat') {
        return 'flat';
    }
    else {
        return undefined;
    }
}

function changeSGVUnit(sgv) {
    return Math.round((sgv / 18) * 10) / 10;
}

