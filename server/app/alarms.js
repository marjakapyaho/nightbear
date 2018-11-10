import * as helpers from './helpers';
import * as analyser from './analyser';
import _ from 'lodash';

let nextCheck;

export default app => {

    const log = app.logger(__filename);

    return {
        runChecks
    };

    function runChecks(queryThrottleMs = 0) {
        log.debug(`Running checks (queries throttled at ${queryThrottleMs} ms)`);

        // Clear previous timer (if exists) and set next one
        if (nextCheck) { clearTimeout(nextCheck); }
        nextCheck = setTimeout(runChecks, 1 * helpers.MIN_IN_MS, queryThrottleMs);

        return app.data.getTimelineContent(queryThrottleMs)
            .then(doChecks)
            .catch(err => log.error('Checks failed', err));
    }

    function doChecks(timelineContent) {
        log.debug('Active alarms:', timelineContent.activeAlarms);

        if (!timelineContent.profileSettings.alarmsOn) {
            log.debug('Alarm module DISABLED');
            return;
        }

        let operations = [];
        let activeProfile = app.profile.getActiveProfile(timelineContent.profileSettings);

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
            if (_.find(alarmsToKeep, { type: key })) return;
            return key;
        }));

        log.debug('Remove:' + alarmsToRemove.length + ', Keep:' + alarmsToKeep.length + ', Create:' + alarmsToCreate.length);

        _.each(alarmsToRemove, function(alarm) {
            alarm.status = 'inactive';
            // We're not waiting for the results of pushover acks
            app.pushover.ackAlarms(alarm.pushoverReceipts);
            operations.push(app.data.updateAlarm(alarm));
        });

        _.each(alarmsToKeep, function(alarm) {

            if (app.currentTime() <= alarm.validAfter) {
                return;
            }

            const hasBeenValidFor = (app.currentTime() - alarm.validAfter) / helpers.MIN_IN_MS;
            const levelUpTimes = activeProfile.alarmSettings[alarm.type].levels;
            const accumulatedTimes = _.map(levelUpTimes, (x, i) => _.sum(_.take(levelUpTimes, i + 1)));
            const neededLevel = _.findIndex(accumulatedTimes, minutes => minutes > hasBeenValidFor) + 1 || levelUpTimes.length + 1;

            if (neededLevel !== alarm.level || usePushForLevelOne(alarm)) {
                log('Level-upping alarm from ' + alarm.level + ' to ' + neededLevel);
                alarm.level = neededLevel;
                operations.push(
                    app.pushover.sendAlarm(alarm.level, alarm.type, activeProfile.ALARM_RETRY, activeProfile.ALARM_EXPIRE, app)
                        .then(receipt => { // only persist the level upgrade IF the alarm got sent (so we get retries)
                            alarm.pushoverReceipts = alarm.pushoverReceipts || [];
                            alarm.pushoverReceipts.push(receipt);
                            return app.data.updateAlarm(alarm);
                        })
                        .catch(err => log.error('Sending alarm failed:', err))
                );
            }

        });

        _.each(alarmsToCreate, function(alarmType) {
            log.debug('Create new alarm with status:', alarmType);
            operations.push(app.data.createAlarm(alarmType, 1)); // Initial alarm level
        });

        return Promise.all(operations);
    }

    function usePushForLevelOne(alarm) {
        return alarm.level === 1 && (!alarm.pushoverReceipts || alarm.pushoverReceipts.length === 0) && app.profile.getActiveProfileName() === 'night';
    }

}
