"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMockActiveAlarm = exports.getMockActiveProfile = exports.generateSensorEntries = void 0;
const mocks_1 = require("../mocks");
const time_1 = require("./time");
const mocks_2 = require("../mocks");
const generateSensorEntries = ({ currentTimestamp, bloodGlucoseHistory, latestEntryAge = 0, // when omitted, "latest" entry is "now"
 }) => {
    return bloodGlucoseHistory
        .map((bloodGlucose, index) => {
        if (!bloodGlucose)
            return null;
        const intervalMinutes = 5;
        const minutesAgo = latestEntryAge + (bloodGlucoseHistory.length - 1 - index) * intervalMinutes;
        const entryTimestamp = (0, time_1.getTimeMinusTimeMs)(currentTimestamp, minutesAgo * 60 * 1000);
        return {
            type: 'DEXCOM_G6_SHARE',
            timestamp: (0, time_1.getTimeAsISOStr)(entryTimestamp),
            bloodGlucose,
        };
    })
        .filter(entry => entry !== null);
};
exports.generateSensorEntries = generateSensorEntries;
const getMockActiveProfile = (profileName = 'day', alarmsEnabled = true) => ({
    ...mocks_1.mockProfiles[0],
    alarmsEnabled,
    profileName,
});
exports.getMockActiveProfile = getMockActiveProfile;
const getMockActiveAlarm = (situation) => ({
    ...mocks_2.mockAlarms[0],
    situation,
});
exports.getMockActiveAlarm = getMockActiveAlarm;
//# sourceMappingURL=test.js.map