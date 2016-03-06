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

export default app => {

    const log = app.logger(__filename);

    return {
        initAlarms,
        runChecks
    };

    function initAlarms() {
        runChecks();
        setInterval(runChecks, 5 * helpers.MIN_IN_MS);
    }

    function runChecks() {
        return app.data.getTimelineContent().then(
            function(timelineContent) {
                doChecks(timelineContent);
            },
            function(err) {
                log.error('Checks failed with error', err);
            }
        );
    }

    function doChecks(timelineContent) {

        let operations = [];

        // Analyse current status
        let analysisResults = app.analyser.analyseData(timelineContent);
        let currentStatus = analysisResults.status;
        let latestDataPoint = analysisResults.data;
        let batteryAlarm = analysisResults.batteryAlarm;

        // Analyse each active alarm in regards to their clear conditions and current status
        let matchingAlarmFound = false;

        _.each(timelineContent.activeAlarms, function(alarm) {
            log('Found active alarm:', alarm.type);

            // Advance alarm level if alarm not acknowledged
            if (!alarm.ack) {
                alarm.level++;
            }

            // Are we still having the same alarm
            if (currentStatus === alarm.type || (batteryAlarm && alarm.type === 'battery')) {
                matchingAlarmFound = true;
            }
            else if (clearAlarmOfType(alarm.type, latestDataPoint, batteryAlarm)) { // or not
                alarm.status = 'inactive';
            }

            // Release ack lock if enough time has passed and alarm is still active
            if (alarm.status === 'active' && unAckAlarm(alarm.type, alarm.ack)) {
                alarm.ack = false;
                alarm.level = 1;
            }

            // Update alarm in DB to match new level (and possibly status and ack)
            operations.push(app.data.updateAlarm(alarm));

            // If alarm is not acknowledged and is still active,
            // send alarm according to new updated level
            if (!alarm.ack && alarm.status === 'active') {
                sendAlarm(alarm.level, alarm.type);
            }
        });

        // There there was no previous matching alarm, create new one
        if (!matchingAlarmFound && currentStatus !== analyser.STATUS_OK) {
            log('Create new alarm with status:', currentStatus);
            operations.push(app.data.createAlarm(currentStatus, 1)); // Initial alarm level
        }
        else if (!matchingAlarmFound && batteryAlarm) {
            operations.push(app.data.createAlarm(analyser.STATUS_BATTERY, 1)); // Initial alarm level
        }

        return Promise.all(operations);
    }

    function sendAlarm(level, type) {
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

        app.pushover.send(msg, function(err, result) {
            if (err) {
                throw err;
            }
            log('Pushover result:', result);
        });
    }

    function unAckAlarm(type, ack) {
        if (!ack) return;

        let ackTimeInMillis = ALARM_SNOOZE_TIMES[type] * helpers.HOUR_IN_MS;

        // If more time has passed since ack then this type allows, return true
        return app.currentTime() - ack >= ackTimeInMillis;
    }

    function clearAlarmOfType(type, latestDataPoint, batteryAlarm) {
        if (latestDataPoint && type === analyser.STATUS_OUTDATED) {
            return true; // Always clear if current status is no longer outdated
        }
        else if (type === analyser.STATUS_HIGH) {
            if (latestDataPoint && latestDataPoint.nb_glucose_value < app.analyser.getProfile().HIGH_LEVEL_ABS - 2) {
                return true;
            }
        }
        else if (type === analyser.STATUS_LOW) {
            if (latestDataPoint && latestDataPoint.nb_glucose_value > app.analyser.getProfile().LOW_LEVEL_ABS + 2) {
                return true;
            }
        }
        else if (type === analyser.STATUS_RISING) {
            return true;
        }
        else if (type === analyser.STATUS_FALLING) {
            return true;
        }
        else if (type === analyser.STATUS_BATTERY && !batteryAlarm) {
            return true;
        }

        return false;
    }

}