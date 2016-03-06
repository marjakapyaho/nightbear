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
        log('Active alarms:', timelineContent.activeAlarms);

        let operations = [];

        // Analyse current status
        const state = app.analyser.analyseData(timelineContent);

        const alarmsToRemove = _.filter(timelineContent.activeAlarms, function(alarm) {
            return !state[alarm.type];
        });

        const alarmsToKeep = _.filter(timelineContent.activeAlarms, function(alarm) {
            return state[alarm.type];
        });

        const alarmsToCreate = _.compact(_.map(state, function(value, key) {
            if (!value) return;
            if (_.findWhere(alarmsToKeep, { type: key })) return;
            return key;
        }));

        _.each(alarmsToRemove, function(alarm) {
            alarm.status = 'inactive';
            operations.push(app.data.updateAlarm(alarm));
        });

        _.each(alarmsToKeep, function(alarm) {

            // Advance alarm level if needed
            if (!alarm.ack) {
                alarm.level++;
            }

            if (unAckAlarm(alarm.type, alarm.ack)) {
                alarm.ack = false;
                alarm.level = 1;
            }

            // If alarm is not acknowledged
            // send alarm according to new updated level
            if (!alarm.ack) {
                sendAlarm(alarm.level, alarm.type);
            }

            operations.push(app.data.updateAlarm(alarm));
        });

        _.each(alarmsToCreate, function(alarmType) {
            log('Create new alarm with status:', alarmType);
            operations.push(app.data.createAlarm(alarmType, 1)); // Initial alarm level
        });

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
}
