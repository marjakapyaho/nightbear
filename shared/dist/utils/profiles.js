"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getActiveProfile = exports.PROFILE_BASE = exports.DEFAULT_TARGETS = exports.DEFAULT_ALARM_SETTINGS = void 0;
exports.DEFAULT_ALARM_SETTINGS = {
    escalationAfterMinutes: [5, 10, 10],
    snoozeMinutes: 10,
};
exports.DEFAULT_TARGETS = ['bear-phone', 'marjan_iphone', 'jrwNexus5'];
exports.PROFILE_BASE = {
    id: 'NEW',
    isActive: true,
    alarmsEnabled: true,
    analyserSettings: {
        highLevelRel: 8,
        highLevelAbs: 10,
        highLevelBad: 14,
        lowLevelRel: 6,
        lowLevelAbs: 4,
        timeSinceBgMinutes: 30,
    },
    situationSettings: {
        outdated: exports.DEFAULT_ALARM_SETTINGS,
        criticalOutdated: exports.DEFAULT_ALARM_SETTINGS,
        falling: exports.DEFAULT_ALARM_SETTINGS,
        rising: exports.DEFAULT_ALARM_SETTINGS,
        low: exports.DEFAULT_ALARM_SETTINGS,
        badLow: exports.DEFAULT_ALARM_SETTINGS,
        compressionLow: exports.DEFAULT_ALARM_SETTINGS,
        high: exports.DEFAULT_ALARM_SETTINGS,
        badHigh: exports.DEFAULT_ALARM_SETTINGS,
        persistentHigh: exports.DEFAULT_ALARM_SETTINGS,
        missingDayInsulin: exports.DEFAULT_ALARM_SETTINGS,
    },
    notificationTargets: exports.DEFAULT_TARGETS,
};
const getActiveProfile = (profiles) => {
    return profiles?.find(profile => profile.isActive);
};
exports.getActiveProfile = getActiveProfile;
//# sourceMappingURL=profiles.js.map