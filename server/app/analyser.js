import _ from 'lodash';
import * as helpers from './helpers';

export const STATUS_OUTDATED = 'outdated';
export const STATUS_HIGH = 'high';
export const STATUS_LOW = 'low';
export const STATUS_RISING = 'rising';
export const STATUS_FALLING = 'falling';
export const STATUS_BATTERY = 'battery';
export const STATUS_OK = 'ok';

export default app => {

    return {
        analyseData,
        getProfile
    };

    function analyseData(timelineContent, activeAlarms) {
        var status = 'ok'; // OK if not proven otherwise
        var profile = getProfile();
        var { latestEntries, latestTreatments, latestDeviceStatus } = timelineContent;
        var batteryAlarm = (latestDeviceStatus.uploaderBattery || latestDeviceStatus.uploaderBattery === 0) ? latestDeviceStatus.uploaderBattery < profile.BATTERY_LIMIT : false;

        if (latestEntries.length < 1) {
            return { status: STATUS_OUTDATED, data: null };
        }

        let latestDataPoint = _.sortBy(latestEntries, 'date')[latestEntries.length - 1];
        let latestTime = latestDataPoint.date;
        let latestGlucoseValue = latestDataPoint.nb_glucose_value;
        let latestDirection = latestDataPoint.direction;

        // If we have no direction, calculate one
        if (latestDirection === helpers.DIRECTION_NOT_COMPUTABLE) {
            latestDirection = calculateDirection(latestEntries);
        }

        if (app.currentTime() - latestTime > profile.TIME_SINCE_SGV_LIMIT) {
            status = STATUS_OUTDATED;
        }
        else if (latestGlucoseValue > profile.HIGH_LEVEL_ABS) {
            status = STATUS_HIGH;
        }
        else if (latestGlucoseValue < profile.LOW_LEVEL_ABS) {
            status = STATUS_LOW;
        }
        else if (latestGlucoseValue > profile.HIGH_LEVEL_REL && detectDirection(latestDirection) === 'up') {
            status = STATUS_RISING;
        }
        else if (latestGlucoseValue < profile.LOW_LEVEL_REL && detectDirection(latestDirection) === 'down') {
            status = STATUS_FALLING;
        }

        return { status: status, data: latestDataPoint, batteryAlarm: batteryAlarm };
    }

    function getProfile() {

        if (new Date(app.currentTime()).getHours() > 9) { // DAY
            return {
                HIGH_LEVEL_REL: 12,
                HIGH_LEVEL_ABS: 15,
                LOW_LEVEL_REL: 8,
                LOW_LEVEL_ABS: 4,
                TIME_SINCE_SGV_LIMIT: 20 * helpers.MIN_IN_MS,
                BATTERY_LIMIT: 30
            };
        }
        else { // NIGHT
            return {
                HIGH_LEVEL_REL: 13,
                HIGH_LEVEL_ABS: 15,
                LOW_LEVEL_REL: 6,
                LOW_LEVEL_ABS: 4,
                TIME_SINCE_SGV_LIMIT: 60 * helpers.MIN_IN_MS,
                BATTERY_LIMIT: 10
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
    }

};
