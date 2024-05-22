"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEntriesBeforeMs = exports.getEntriesWithinTimeRange = exports.getRange = void 0;
const shared_1 = require("@nightbear/shared");
const shared_2 = require("@nightbear/shared");
const getRange = (context, hours) => ({
    from: (0, shared_2.getTimeMinusTime)(context.timestamp(), hours * shared_1.HOUR_IN_MS),
});
exports.getRange = getRange;
const getEntriesWithinTimeRange = (currentTimestamp, entries, rangeInMs) => {
    const timeWindowStart = (0, shared_2.getTimeMinusTimeMs)(currentTimestamp, rangeInMs);
    return entries.filter(entry => (0, shared_2.isTimeLargerOrEqual)(entry.timestamp, timeWindowStart));
};
exports.getEntriesWithinTimeRange = getEntriesWithinTimeRange;
const getEntriesBeforeMs = (currentTimestamp, entries, diffToNowMs) => {
    const timeWindowEnd = (0, shared_2.getTimeMinusTimeMs)(currentTimestamp, diffToNowMs);
    return entries.filter(entry => (0, shared_2.isTimeSmaller)(entry.timestamp, timeWindowEnd));
};
exports.getEntriesBeforeMs = getEntriesBeforeMs;
//# sourceMappingURL=utils.js.map