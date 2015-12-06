import * as helpers from './helpers';
import * as analyser from './analyser';
import * as data from './data';

export function initAlarms() {
    setInterval(runChecks, 5 * helpers.MIN_IN_MILLIS);
}

export function runChecks() {

    // Analyse current status
    var status = analyser.analyseData(data.getDataForAnalysis());

    // Get active alarms from db
    var activeAlarms = data.getActiveAlarms();

    // If current status OK, set past alarms to inactive state
    if (status === analyser.STATUS_OK) {

    }

    // If current status gives alarm, check if there is already one in db

    // Check if there are any other alarms that should be set inactive

    // If pre-existing alarm, check if level should be changed

    // Send out alarms according to level
    sendAlarm(1);
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
