import * as helpers from './helpers';
import * as analyser from './analyser';
import _ from 'lodash';

export const ALARM_SNOOZE_TIMES = {
    [analyser.STATUS_OUTDATED]: 120,
    [analyser.STATUS_HIGH]: 90,
    [analyser.STATUS_LOW]: 15,
    [analyser.STATUS_RISING]: 20,
    [analyser.STATUS_FALLING]: 10
};

export function initAlarms({ alarms }) {
    alarms.runChecks();
    setInterval(alarms.runChecks, 5 * helpers.MIN_IN_MS);
}

export function runChecks({ data, currentTime, pushover }) {
    return Promise.all([
        data.getLatestEntries(helpers.HOUR_IN_MS * 0.5),
        data.getLatestTreatments(helpers.HOUR_IN_MS * 3),
        data.getActiveAlarms(true), // include acknowledged alarms
        data.getLatestDeviceStatus()
    ]).then(
        function([ entries, treatments, alarms, deviceStatus ]) {
            return doChecks(entries, treatments, alarms, deviceStatus, currentTime, data, pushover);
        },
        function(err) {
            console.log('Failed with error', err);
        }
    );
}

function doChecks(entries, treatments, activeAlarms, deviceStatus, currentTime, data, pushover) {

    let operations = [];

    // Analyse current status
    let analysisResults = analyser.analyseData({ currentTime }, entries, deviceStatus);
    let currentStatus = analysisResults.status;
    let latestDataPoint = analysisResults.data;
    let batteryAlarm = analysisResults.batteryAlarm;

    // Analyse each active alarm in regards to their clear conditions and current status
    let matchingAlarmFound = false;

    _.each(activeAlarms, function(alarm) {
        console.log('Found active alarm:', alarm.type);

        // Advance alarm level if alarm not acknowledged
        if (!alarm.ack) {
            alarm.level++;
        }

        // Are we still having the same alarm
        if (currentStatus === alarm.type || (batteryAlarm && alarm.type === 'battery')) {
            matchingAlarmFound = true;
        }
        else if(clearAlarmOfType(alarm.type, latestDataPoint, currentTime, batteryAlarm)) { // or not
            alarm.status = 'inactive';
        }

        // Release ack lock if enough time has passed and alarm is still active
        if(alarm.status === 'active' && unAckAlarm(alarm.type, alarm.ack, currentTime)) {
            alarm.ack = false;
            alarm.level = 1;
        }

        // Update alarm in DB to match new level (and possibly status and ack)
        operations.push(data.updateAlarm(alarm));

        // If alarm is not acknowledged and is still active,
        // send alarm according to new updated level
        if (!alarm.ack && alarm.status === 'active') {
            sendAlarm(pushover, alarm.level, alarm.type);
        }
    });

    // There there was no previous matching alarm, create new one
    if (!matchingAlarmFound && currentStatus !== analyser.STATUS_OK) {
        console.log('Create new alarm with status', currentStatus);
        operations.push(data.createAlarm(currentStatus, 1)); // Initial alarm level
    }
    else if(!matchingAlarmFound && batteryAlarm) {
        operations.push(data.createAlarm(analyser.STATUS_BATTERY, 1)); // Initial alarm level
    }

    return Promise.all(operations);
}

function sendAlarm(pushover, level, type) {
    let msg = {
        message: type,
        title: "NightBear alert",
        sound: 'persistent',
        device: process.env['PUSHOVER_LEVEL_1'],
        priority: 2,
        retry: 120,
        expire: 60
    };

    if (level === 2) {
        msg.device = process.env['PUSHOVER_LEVEL_1'];
    }
    else if (level === 3) {
        msg.device = process.env['PUSHOVER_LEVEL_2'];
    }
    else if (level === 4) {
        msg.device = process.env['PUSHOVER_LEVEL_3'];
    }

    pushover.send(msg, function(err, result) {
        if ( err ) {
            throw err;
        }
        console.log(result);
    });
}

function unAckAlarm(type, ack, currentTime) {
    if (!ack) return;

    let ackTimeInMillis = ALARM_SNOOZE_TIMES[type] * helpers.HOUR_IN_MS;

    // If more time has passed since ack then this type allows, return true
    return currentTime() - ack >= ackTimeInMillis;
}

function clearAlarmOfType(type, latestDataPoint, currentTime, batteryAlarm) {
    if(latestDataPoint && type === analyser.STATUS_OUTDATED) {
        return true; // Always clear if current status is no longer outdated
    }
    else if (type === analyser.STATUS_HIGH) {
        if (latestDataPoint && latestDataPoint.nb_glucose_value < analyser.getProfile({ currentTime }).HIGH_LEVEL_ABS - 2) {
            return true;
        }
    }
    else if (type === analyser.STATUS_LOW) {
        if (latestDataPoint && latestDataPoint.nb_glucose_value > analyser.getProfile({ currentTime }).LOW_LEVEL_ABS + 2) {
            return true;
        }
    }
    else if (type === analyser.STATUS_RISING) {
        return true;
    }
    else if(type === analyser.STATUS_FALLING) {
        return true;
    }
    else if(type === analyser.STATUS_BATTERY && !batteryAlarm) {
        return true;
    }

    return false;
}
