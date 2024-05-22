"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ackActiveAlarm = exports.getActiveAlarm = void 0;
const api_1 = require("../../utils/api");
const shared_1 = require("@nightbear/shared");
const utils_1 = require("./utils");
const getActiveAlarm = async (_request, context) => {
    const activeAlarm = await context.db.getActiveAlarm();
    return (0, api_1.createResponse)(activeAlarm);
};
exports.getActiveAlarm = getActiveAlarm;
const ackActiveAlarm = async (request, context) => {
    const { ackedBy } = request.requestParams;
    // Get active alarm
    const activeAlarm = await context.db.getActiveAlarm();
    // If we have nothing to ack, return
    if ((0, utils_1.isThereNothingToAck)(activeAlarm, context)) {
        return (0, api_1.createResponse)('Nothing to ack');
    }
    // Get situation's snooze minutes from active profile
    const snoozeMinutes = await (0, utils_1.getSnoozeMinutesFromActiveProfile)(activeAlarm, context);
    // Create new alarm state for active alarm with snooze minutes
    await context.db.createAlarmState(activeAlarm.id, (0, shared_1.getTimePlusMinutes)(context.timestamp(), snoozeMinutes), ackedBy);
    // Mark all alarm states as processed (in case there were any notification receipts missing)
    await context.db.markAllAlarmStatesAsProcessed(activeAlarm.id);
    return (0, api_1.createResponse)(activeAlarm.id);
};
exports.ackActiveAlarm = ackActiveAlarm;
//# sourceMappingURL=handler.js.map