"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSnoozeMinutesFromActiveProfile = exports.isThereNothingToAck = void 0;
const shared_1 = require("@nightbear/shared");
const shared_2 = require("@nightbear/shared");
const isThereNothingToAck = (activeAlarm, context) => !activeAlarm || (0, shared_1.isTimeSmaller)(context.timestamp(), (0, shared_2.getAlarmState)(activeAlarm).validAfter);
exports.isThereNothingToAck = isThereNothingToAck;
const getSnoozeMinutesFromActiveProfile = async (activeAlarm, context) => {
    const activeProfile = await context.db.getActiveProfile();
    return (0, shared_2.getSnoozeMinutes)(activeAlarm.situation, activeProfile);
};
exports.getSnoozeMinutesFromActiveProfile = getSnoozeMinutesFromActiveProfile;
//# sourceMappingURL=utils.js.map