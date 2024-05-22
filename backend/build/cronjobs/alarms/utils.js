"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.retryNotifications = exports.getPushoverRecipient = exports.getNeededAlarmLevel = void 0;
const shared_1 = require("@nightbear/shared");
const shared_2 = require("@nightbear/shared");
const lodash_1 = require("lodash");
const shared_3 = require("@nightbear/shared");
const getNeededAlarmLevel = (currentSituation, validAfter, activeProfile, context) => {
    const hasBeenValidForMinutes = Math.round((0, shared_1.getTimeMinusTimeMs)(context.timestamp(), validAfter) / shared_2.MIN_IN_MS);
    const levelUpTimes = (0, shared_3.getEscalationAfterMinutes)(currentSituation, activeProfile);
    if (!levelUpTimes) {
        return shared_3.ALARM_FALLBACK_LEVEL;
    }
    const accumulatedTimes = (0, lodash_1.map)(levelUpTimes, (_x, i) => (0, lodash_1.sum)((0, lodash_1.take)(levelUpTimes, i + 1)));
    return ((0, lodash_1.findIndex)(accumulatedTimes, minutes => minutes > hasBeenValidForMinutes) + 1 ||
        levelUpTimes.length + 1);
};
exports.getNeededAlarmLevel = getNeededAlarmLevel;
const getPushoverRecipient = (neededLevel, activeProfile) => {
    const availableTargetsCount = activeProfile.notificationTargets.length;
    return neededLevel < availableTargetsCount
        ? activeProfile.notificationTargets[neededLevel]
        : undefined;
};
exports.getPushoverRecipient = getPushoverRecipient;
const retryNotifications = async (states, situation, context) => Promise.all(states.map(async (state) => {
    const receipt = state.notificationTarget
        ? await context.pushover.sendAlarm(situation, state.notificationTarget)
        : undefined;
    // Update alarm state to have receipt if we got it
    if (receipt) {
        return context.db.markAlarmAsProcessed({
            ...state,
            notificationReceipt: receipt,
        });
    }
}));
exports.retryNotifications = retryNotifications;
//# sourceMappingURL=utils.js.map