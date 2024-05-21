"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateTimelineEntries = exports.getTimelineEntries = void 0;
const api_1 = require("../../utils/api");
const shared_1 = require("@nightbear/shared");
const shared_2 = require("@nightbear/shared");
const shared_3 = require("@nightbear/shared");
const getTimelineEntries = async (request, context) => {
    const { start, end } = request.requestParams;
    const defaultFrom = (0, shared_2.getTimeMinusTime)(context.timestamp(), 3 * shared_1.HOUR_IN_MS);
    const meterEntries = await context.db.getMeterEntriesByTimestamp({
        from: start || defaultFrom,
        to: end || context.timestamp(),
    });
    const sensorEntries = await context.db.getSensorEntriesByTimestamp({
        from: start || defaultFrom,
        to: end || context.timestamp(),
    });
    const bloodGlucoseEntries = (0, shared_3.getMergedBgEntries)(sensorEntries, meterEntries);
    const insulinEntries = await context.db.getInsulinEntriesByTimestamp({
        from: start || defaultFrom,
        to: end || context.timestamp(),
    });
    const carbEntries = await context.db.getCarbEntriesByTimestamp({
        from: start || defaultFrom,
        to: end || context.timestamp(),
    });
    const profileActivations = await context.db.getProfileActivationsByTimestamp({
        from: start || defaultFrom,
        to: end || context.timestamp(),
    });
    const alarms = await context.db.getAlarms({
        from: start || defaultFrom,
        to: end || context.timestamp(),
    });
    return (0, api_1.createResponse)({
        bloodGlucoseEntries,
        insulinEntries,
        carbEntries,
        meterEntries,
        profileActivations,
        alarms,
    });
};
exports.getTimelineEntries = getTimelineEntries;
const updateTimelineEntries = async (request, context) => {
    const dataPoint = request.requestBody;
    const timestamp = dataPoint?.isoTimestamp;
    if (!timestamp) {
        return (0, api_1.createResponse)('error');
    }
    const insulinEntry = dataPoint.insulinEntry
        ? await context.db.upsertInsulinEntry(dataPoint.insulinEntry)
        : await context.db.deleteInsulinEntry(timestamp);
    const meterEntry = dataPoint.meterEntry
        ? await context.db.upsertMeterEntry(dataPoint.meterEntry)
        : await context.db.deleteMeterEntry(timestamp);
    const carbEntry = dataPoint.carbEntry
        ? await context.db.upsertCarbEntry(dataPoint.carbEntry)
        : await context.db.deleteCarbEntry(timestamp);
    return (0, api_1.createResponse)({
        insulinEntry,
        meterEntry,
        carbEntry,
    });
};
exports.updateTimelineEntries = updateTimelineEntries;
//# sourceMappingURL=handler.js.map