"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTimePlusTimeMs = exports.getTimePlusMinutes = exports.getTimePlusTime = exports.getTimeMinusHours = exports.getTimeMinusMinutes = exports.getTimeMinusTimeMs = exports.getTimeMinusTime = exports.isTimeSmallerOrEqual = exports.isTimeSmaller = exports.isTimeLargerOrEqual = exports.isTimeLarger = exports.hourToMs = exports.minToMs = exports.getTimeAsISOStr = exports.getTimeInMillis = exports.getActivationTimestamp = exports.getDateWithoutTimeMs = exports.getDateWithoutTime = exports.humanReadableLongTime = exports.humanReadableShortTime = exports.DEFAULT_TIMEZONE = void 0;
const luxon_1 = require("luxon");
const calculations_1 = require("./calculations");
// TODO: Make this configurable via env (or just use env.DEFAULT_TIMEZONE as-is)
exports.DEFAULT_TIMEZONE = 'Europe/Helsinki';
// @example "12:34"
const humanReadableShortTime = (msUtc = Date.now()) => {
    return luxon_1.DateTime.fromMillis(msUtc).setZone(exports.DEFAULT_TIMEZONE).toFormat('HH:mm');
};
exports.humanReadableShortTime = humanReadableShortTime;
// @example "2020-01-31 12:34:56"
const humanReadableLongTime = (utcISOStr) => {
    return luxon_1.DateTime.fromISO(utcISOStr).setZone(exports.DEFAULT_TIMEZONE).toFormat('yyyy-MM-dd HH:mm:ss');
};
exports.humanReadableLongTime = humanReadableLongTime;
// @example "2020-01-31"
const getDateWithoutTime = (utcISOStr) => {
    return luxon_1.DateTime.fromISO(utcISOStr).toFormat('yyyy-MM-dd');
};
exports.getDateWithoutTime = getDateWithoutTime;
const getDateWithoutTimeMs = (timestampMs) => {
    return luxon_1.DateTime.fromMillis(timestampMs).toFormat('yyyy-MM-dd');
};
exports.getDateWithoutTimeMs = getDateWithoutTimeMs;
// Returns the timestamp (in milliseconds UTC) of the given hours/minutes/seconds combo for the current day.
// Note that this may be in the past or in the future, relevant to Date.now().
function getActivationTimestamp(spec) {
    const d = new Date();
    d.setUTCHours(spec.hours);
    d.setUTCMinutes(spec?.minutes || 0);
    d.setUTCSeconds(spec?.seconds || 0);
    return d.getTime();
}
exports.getActivationTimestamp = getActivationTimestamp;
// Type converters
const getTimeInMillis = (time) => typeof time === 'string' ? luxon_1.DateTime.fromISO(time).toMillis() : time;
exports.getTimeInMillis = getTimeInMillis;
const getTimeAsISOStr = (time) => typeof time === 'string' ? time : luxon_1.DateTime.fromMillis(time).toUTC().toISO() || '';
exports.getTimeAsISOStr = getTimeAsISOStr;
const minToMs = (minutes) => minutes * calculations_1.MIN_IN_MS;
exports.minToMs = minToMs;
const hourToMs = (minutes) => minutes * calculations_1.HOUR_IN_MS;
exports.hourToMs = hourToMs;
// Comparisons
const isTimeLarger = (time1, time2) => (0, exports.getTimeInMillis)(time1) > (0, exports.getTimeInMillis)(time2);
exports.isTimeLarger = isTimeLarger;
const isTimeLargerOrEqual = (time1, time2) => (0, exports.getTimeInMillis)(time1) >= (0, exports.getTimeInMillis)(time2);
exports.isTimeLargerOrEqual = isTimeLargerOrEqual;
const isTimeSmaller = (time1, time2) => (0, exports.getTimeInMillis)(time1) < (0, exports.getTimeInMillis)(time2);
exports.isTimeSmaller = isTimeSmaller;
const isTimeSmallerOrEqual = (time1, time2) => (0, exports.getTimeInMillis)(time1) <= (0, exports.getTimeInMillis)(time2);
exports.isTimeSmallerOrEqual = isTimeSmallerOrEqual;
// Minus
const getTimeMinusTime = (time1, time2) => (0, exports.getTimeAsISOStr)((0, exports.getTimeInMillis)(time1) - (0, exports.getTimeInMillis)(time2));
exports.getTimeMinusTime = getTimeMinusTime;
const getTimeMinusTimeMs = (time1, time2) => (0, exports.getTimeInMillis)(time1) - (0, exports.getTimeInMillis)(time2);
exports.getTimeMinusTimeMs = getTimeMinusTimeMs;
const getTimeMinusMinutes = (time1, minutes) => (0, exports.getTimeAsISOStr)((0, exports.getTimeInMillis)(time1) - minutes * calculations_1.MIN_IN_MS);
exports.getTimeMinusMinutes = getTimeMinusMinutes;
const getTimeMinusHours = (time1, hours) => (0, exports.getTimeAsISOStr)((0, exports.getTimeInMillis)(time1) - hours * calculations_1.HOUR_IN_MS);
exports.getTimeMinusHours = getTimeMinusHours;
// Plus
const getTimePlusTime = (time1, time2) => (0, exports.getTimeAsISOStr)((0, exports.getTimeInMillis)(time1) + (0, exports.getTimeInMillis)(time2));
exports.getTimePlusTime = getTimePlusTime;
const getTimePlusMinutes = (time1, minutes) => (0, exports.getTimeAsISOStr)((0, exports.getTimeInMillis)(time1) + minutes * calculations_1.MIN_IN_MS);
exports.getTimePlusMinutes = getTimePlusMinutes;
const getTimePlusTimeMs = (time1, time2) => (0, exports.getTimeInMillis)(time1) + (0, exports.getTimeInMillis)(time2);
exports.getTimePlusTimeMs = getTimePlusTimeMs;
//# sourceMappingURL=time.js.map