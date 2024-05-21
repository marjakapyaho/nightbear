"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEscalationAfterMinutes = exports.getSnoozeMinutes = exports.getFirstAlarmState = exports.getAlarmState = exports.onlyActive = exports.situationsToSituationSettings = exports.ALARM_FALLBACK_LEVEL = exports.ALARM_START_LEVEL = void 0;
const lodash_1 = require("lodash");
exports.ALARM_START_LEVEL = 0;
exports.ALARM_FALLBACK_LEVEL = 1;
exports.situationsToSituationSettings = {
    OUTDATED: 'outdated',
    CRITICAL_OUTDATED: 'criticalOutdated',
    FALLING: 'falling',
    RISING: 'rising',
    LOW: 'low',
    BAD_LOW: 'badLow',
    COMPRESSION_LOW: 'compressionLow',
    HIGH: 'high',
    BAD_HIGH: 'badHigh',
    PERSISTENT_HIGH: 'persistentHigh',
    MISSING_DAY_INSULIN: 'missingDayInsulin',
};
const onlyActive = (alarms) => alarms.filter(alarm => alarm.isActive);
exports.onlyActive = onlyActive;
const getAlarmState = (alarm) => {
    const latest = (0, lodash_1.last)(alarm.alarmStates);
    if (!latest)
        throw new Error(`Couldn't get latest AlarmState from Alarm "${alarm.id}"`);
    return latest;
};
exports.getAlarmState = getAlarmState;
const getFirstAlarmState = (alarm) => {
    const firstState = (0, lodash_1.first)(alarm.alarmStates);
    if (!firstState)
        throw new Error(`Couldn't get first AlarmState from Alarm "${alarm.id}"`);
    return firstState;
};
exports.getFirstAlarmState = getFirstAlarmState;
const getSnoozeMinutes = (situation, profile) => {
    return profile.situationSettings[exports.situationsToSituationSettings[situation]].snoozeMinutes | 0;
};
exports.getSnoozeMinutes = getSnoozeMinutes;
const getEscalationAfterMinutes = (situation, profile) => {
    return profile.situationSettings[exports.situationsToSituationSettings[situation]].escalationAfterMinutes;
};
exports.getEscalationAfterMinutes = getEscalationAfterMinutes;
//# sourceMappingURL=alarms.js.map