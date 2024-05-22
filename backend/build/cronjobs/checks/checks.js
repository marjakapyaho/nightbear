"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checks = void 0;
const alarms_1 = require("../alarms/alarms");
const analyser_1 = require("../analyser/analyser");
const utils_1 = require("./utils");
exports.checks = (async (context) => {
    const { log } = context;
    const currentTimestamp = context.timestamp();
    log(`----- STARTED CHECKS AT: ${currentTimestamp} -----`);
    const sensorEntries = await context.db.getSensorEntriesByTimestamp((0, utils_1.getRange)(context, 3));
    const insulinEntries = await context.db.getInsulinEntriesByTimestamp((0, utils_1.getRange)(context, 24));
    const carbEntries = await context.db.getCarbEntriesByTimestamp((0, utils_1.getRange)(context, 24));
    const meterEntries = await context.db.getMeterEntriesByTimestamp((0, utils_1.getRange)(context, 3));
    const activeProfile = await context.db.getActiveProfile();
    const alarms = await context.db.getAlarms((0, utils_1.getRange)(context, 12));
    const activeAlarm = await context.db.getActiveAlarm();
    log(`1. Using profile: ${activeProfile.profileName}`);
    const situation = (0, analyser_1.runAnalysis)({
        currentTimestamp,
        activeProfile,
        sensorEntries,
        meterEntries,
        insulinEntries,
        carbEntries,
        alarms,
    });
    log(`2. Active situation: ${situation || '-'}`);
    const alarmId = await (0, alarms_1.runAlarmChecks)(context, situation, activeProfile, activeAlarm);
    log(`3. Active alarm with id: ${alarmId || '-'}`);
});
//# sourceMappingURL=checks.js.map