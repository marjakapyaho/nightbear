import * as helpers from './helpers';
import * as analyser from './analyser';
import * as data from './data';
import _ from 'lodash';

export function initAlarms() {
    setInterval(runChecks, 5 * helpers.MIN_IN_MS);
}

export function runChecks() {
    Promise.all([
        data.getDataForAnalysis(),
        data.getActiveAlarms()
    ]).then(
        function(res) {
            var entries = res[0] ? res[0][0] : [];
            var treatments = res[0] ? res[0][1] : [];
            var alarms = res[1] || [];

            doChecks(entries, treatments, alarms);
        },
        function(err) {
            console.log('Failed with error', err);
        }
    );
}

// TODO: use treatments in analysis
function doChecks(entries, treatments, activeAlarms) {

    // Analyse current status
    var analysisResults =  analyser.analyseData(entries);
    var currentStatus = analysisResults.status;
    var latestDataPoint = analysisResults.data;

    // Analyse each active alarm in regards to their clear conditions and current status
    var matchingAlarmFound = false;

    _.each(activeAlarms, function(alarm) {
        alarm.level = alarm.level++;

        if (currentStatus = alarm.type) {
            matchingAlarmFound = true;
        }
        else if(currentStatus !== analyser.STATUS_OUTDATED) {
            // Check if clear conditions are met and clear if needed
            if(clearAlarmOfType(alarm.type, latestDataPoint)) {
                alarm.status = 'inactive';
                data.updateAlarm(alarm);
            }
        }

        // If alarm is not acknowledged and is still active,
        // send alarm according to new updated level
        if (!alarm.ack && alarm.status === 'active') {
            sendAlarm(alarm.level);
        }
    });

    // There there was no previous matching alarm, create one
    if (!matchingAlarmFound) {
        data.createAlarm();
        sendAlarm(1);
    }
}

export function sendAlarm(level) {

    if (level === 1) {
        return; // Pebble will fetch
    }
    else if (level === 2) {
        // Send out pushover level 2
    }
    else if (level === 3) {
        // Send out pushover level 3
    }
    else if (level === 4) {
        // Send out pushover level 4
    }
}

function clearAlarmOfType(type, latestDataPoint) {
    if( type === analyser.STATUS_OUTDATED) {
        return true; // Always clear if current status is no longer outdated
    }
    else if( type === analyser.STATUS_HIGH) {
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
