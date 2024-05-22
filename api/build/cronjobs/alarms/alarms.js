"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAlarm = exports.detectAlarmActions = exports.runAlarmChecks = void 0;
const shared_1 = require("@nightbear/shared");
const utils_1 = require("./utils");
const runAlarmChecks = async (context, situation, activeProfile, activeAlarm) => {
    const { log } = context;
    const { remove, keep, create } = (0, exports.detectAlarmActions)(situation, activeProfile, activeAlarm);
    if (remove) {
        log(`Removing alarm with situation: ${remove.situation}`);
        await deactivateAlarm(remove, context);
    }
    if (keep) {
        log(`Keeping alarm with situation: ${keep.situation}`);
        return updateAlarm(keep, activeProfile, context);
    }
    if (create) {
        log(`Creating alarm with situation: ${create}`);
        return (0, exports.createAlarm)(create, context);
    }
    return null;
};
exports.runAlarmChecks = runAlarmChecks;
const detectAlarmActions = (situation, activeProfile, activeAlarm) => {
    // If there is no situation or alarms are disabled, remove active alarm
    if (situation === 'NO_SITUATION' || !activeProfile.alarmsEnabled) {
        return {
            remove: activeAlarm,
        };
    }
    // If there is already alarm of correct type, keep it
    if (activeAlarm && activeAlarm.situation === situation) {
        return {
            keep: activeAlarm,
        };
    }
    // If there is alarm of wrong type, remove it and create new one
    if (activeAlarm && activeAlarm.situation !== situation) {
        return {
            remove: activeAlarm,
            create: situation,
        };
    }
    // There was no previous alarm and there is a situation so create new alarm
    return {
        create: situation,
    };
};
exports.detectAlarmActions = detectAlarmActions;
const deactivateAlarm = async (alarm, context) => {
    // TODO: Let's not wait for these?
    context.pushover.ackAlarms(alarm.alarmStates.map(state => state.notificationReceipt).filter(shared_1.isNotNullish));
    await context.db.deactivateAlarm(alarm.id, context.timestamp());
    return alarm.id;
};
const updateAlarm = async (activeAlarm, activeProfile, context) => {
    const { situation } = activeAlarm;
    const currentAlarmState = (0, shared_1.getAlarmState)(activeAlarm);
    const { alarmLevel, validAfter } = currentAlarmState;
    // Alarm is not yet valid
    if ((0, shared_1.isTimeSmaller)(context.timestamp(), validAfter)) {
        return activeAlarm.id;
    }
    // Retry all notifications that are missing receipts
    const statesMissingReceipts = activeAlarm.alarmStates.filter(state => !state.notificationProcessedAt);
    const neededLevel = (0, utils_1.getNeededAlarmLevel)(situation, validAfter, activeProfile, context);
    // No need to escalate yet, just retry notifications that are missing receipts and return
    if (neededLevel === alarmLevel) {
        await (0, utils_1.retryNotifications)(statesMissingReceipts, situation, context);
        return activeAlarm.id;
    }
    const pushoverRecipient = (0, utils_1.getPushoverRecipient)(neededLevel, activeProfile);
    // Send new pushover if there is recipient
    const receipt = pushoverRecipient
        ? await context.pushover.sendAlarm(situation, pushoverRecipient)
        : undefined;
    // Escalate and create new alarm state
    await context.db.createAlarmState(activeAlarm.id, context.timestamp(), undefined, neededLevel, pushoverRecipient, receipt, receipt && context.timestamp());
    return activeAlarm.id;
};
const createAlarm = async (situation, context) => {
    const alarm = await context.db.createAlarmWithState(situation);
    return alarm.id;
};
exports.createAlarm = createAlarm;
//# sourceMappingURL=alarms.js.map