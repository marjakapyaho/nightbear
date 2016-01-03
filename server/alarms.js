import * as helpers from './helpers';
import * as analyser from './analyser';
import _ from 'lodash';

export const ALARM_SNOOZE_TIMES = {
    [analyser.STATUS_OUTDATED]: 60,
    [analyser.STATUS_HIGH]: 60,
    [analyser.STATUS_LOW]: 15,
    [analyser.STATUS_RISING]: 30,
    [analyser.STATUS_FALLING]: 10
};

export function initAlarms({ alarms }) {
    alarms.runChecks();
    setInterval(alarms.runChecks, 5 * helpers.MIN_IN_MS);
}

export function runChecks({ data, currentTime }) {
    console.log('Running alarm checks');
    Promise.all([
        data.getLatestEntries(helpers.HOUR_IN_MS * 0.5),
        data.getLatestTreatments(helpers.HOUR_IN_MS * 3),
        data.getActiveAlarms(true) // include acknowledged alarms
    ]).then(
        function([ entries, treatments, alarms ]) {
            doChecks(entries, treatments, alarms, currentTime, data);
        },
        function(err) {
            console.log('Failed with error', err);
        }
    );
}

// TODO: use treatments in analysis
function doChecks(entries, treatments, activeAlarms, currentTime, data) {

    // Analyse current status
    var analysisResults =  analyser.analyseData(entries);
    var currentStatus = analysisResults.status;
    var latestDataPoint = analysisResults.data;

    // Analyse each active alarm in regards to their clear conditions and current status
    var matchingAlarmFound = false;

    _.each(activeAlarms, function(alarm) {
        console.log('Found active alarm:', alarm);
        alarm.level = alarm.level++;

        // Are we still having the same alarm
        if (currentStatus === alarm.type) {
            matchingAlarmFound = true;
        }
        else if(clearAlarmOfType(alarm.type, latestDataPoint)) { // or not
            alarm.status = 'inactive';
        }

        // Release ack lock if enough time has passed
        if(unAckAlarm(alarm.type, alarm.ack, currentTime)) {
            alarm.ack = false;
        }

        // Update alarm in DB to match new level (and possibly status and ack)
        data.updateAlarm(alarm);

        // If alarm is not acknowledged and is still active,
        // send alarm according to new updated level
        if (!alarm.ack && alarm.status === 'active') {
            sendAlarm(alarm.level);
        }
    });

    // There there was no previous matching alarm, create new one
    if (!matchingAlarmFound) {
        console.log('Create new alarm with status', currentStatus);
        data.createAlarm(currentStatus, 1); // Initial alarm level
    }
}

export function sendAlarm(level) {
    if (level === 2) {
        // Send out pushover level 2
    }
    else if (level === 3) {
        // Send out pushover level 3
    }
    else if (level === 4) {
        // Send out pushover level 4
    }
}

function unAckAlarm(type, ack, currentTime) {
    if (!ack) return;

    let ackTimeInMillis = ALARM_SNOOZE_TIMES[type] * helpers.HOUR_IN_MS;

    // If more time has passed since ack then this type allows, return true
    return currentTime() - ack >= ackTimeInMillis;
}

function clearAlarmOfType(type, latestDataPoint) {
    if( type === analyser.STATUS_OUTDATED) {
        return true; // Always clear if current status is no longer outdated
    }
    else if (type === analyser.STATUS_HIGH) {
        if (latestDataPoint < analyser.getProfile().HIGH_LEVEL_ABS - 2) {
            return true;
        }
    }
    else if( type === analyser.STATUS_LOW) {
        if (latestDataPoint > analyser.getProfile().LOW_LEVEL_ABS + 2) {
            return true;
        }
    }
    else if( type === analyser.STATUS_RISING) {
        return true;
    }
    else if( type === analyser.STATUS_FALLING) {
        return true;
    }

    return false;
}
