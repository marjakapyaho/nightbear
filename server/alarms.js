import * as helpers from './helpers';
import * as analyser from './analyser';
import * as data from './data';
import _ from 'lodash';

export function initAlarms() {
    setInterval(runChecks, 5 * helpers.MIN_IN_MS);
}

export function runChecks() {

    // Analyse current status
    var currentStatus = analyser.analyseData(data.getDataForAnalysis());

    // Get active alarms from db
    var activeAlarms = data.getActiveAlarms();

    // Analyse each active alarm in regards to their clear conditions and current status
    var matchingAlarmFound = false;

    _.each(activeAlarms, function(alarm) {
        if (currentStatus = alarm.type) {
            matchingAlarmFound = true;
            // Same alarm still, increase level if needed
        }
        else {
            // Check if clear conditions are met and update
        }
    });

    // There there was no previous matching alarm, create one
    if (!matchingAlarmFound) {
        data.createAlarm();
    }

    // Send out alarms according to level
    sendAlarms(1);
}

export function sendAlarms(level) {

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
