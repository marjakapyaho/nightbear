"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapTimelineEntriesToGraphPoints = exports.getMergedBgEntries = exports.getTimestampFlooredToEveryFiveMinutes = exports.getFillColor = void 0;
const lodash_1 = require("lodash");
const luxon_1 = require("luxon");
const calculations_1 = require("./calculations");
const time_1 = require("./time");
const alarms_1 = require("./alarms");
const config_1 = require("./config");
// TODO
const getFillColor = (bg) => {
    if (!bg) {
        return 'white';
    }
    if (bg > config_1.highLimit) {
        return '#F8CC6F';
    }
    if (bg < config_1.lowLimit) {
        return '#ee5a36';
    }
    return '#54c87e';
};
exports.getFillColor = getFillColor;
const getTimestampFlooredToEveryFiveMinutes = (timestamp) => {
    const dateTime = luxon_1.DateTime.fromISO(timestamp);
    const minuteSlot = Math.floor(dateTime.get('minute') / 5);
    return dateTime
        .set({ minute: minuteSlot * 5, second: 0, millisecond: 0 })
        .toUTC()
        .toISO();
};
exports.getTimestampFlooredToEveryFiveMinutes = getTimestampFlooredToEveryFiveMinutes;
const getMergedBgEntries = (sensorEntries, meterEntries) => (0, lodash_1.chain)(meterEntries ? [...sensorEntries, ...meterEntries] : sensorEntries)
    .sortBy('timestamp')
    .groupBy(entry => (0, exports.getTimestampFlooredToEveryFiveMinutes)(entry.timestamp))
    .flatMap((entries, groupTimestamp) => ({
    bloodGlucose: (0, calculations_1.calculateAverageBg)(entries),
    timestamp: groupTimestamp,
}))
    .value();
exports.getMergedBgEntries = getMergedBgEntries;
const getAndValidateEntry = (entries) => {
    if (entries.length > 1) {
        throw new Error('Multiple entries of type in slot.');
    }
    return entries.length === 1 ? entries[0] : undefined;
};
const mapTimelineEntriesToGraphPoints = (timelineEntries, rangeInMs, currentTimestamp) => {
    const { bloodGlucoseEntries, insulinEntries, meterEntries, carbEntries, profileActivations, alarms, } = timelineEntries;
    const countOfFiveMinSlots = rangeInMs / (5 * calculations_1.MIN_IN_MS);
    const startSlotTimestamp = (0, exports.getTimestampFlooredToEveryFiveMinutes)(currentTimestamp);
    const slotArray = (0, lodash_1.fill)(Array(countOfFiveMinSlots), null);
    return slotArray
        .map((_val, i) => {
        const timestamp = startSlotTimestamp && (0, time_1.getTimeMinusMinutes)(startSlotTimestamp, i * 5);
        if (!timestamp) {
            throw new Error('Could not calculate timestamp for slot');
        }
        const bgEntry = getAndValidateEntry(bloodGlucoseEntries.filter(entry => (0, exports.getTimestampFlooredToEveryFiveMinutes)(entry.timestamp) === timestamp));
        const insulinEntry = getAndValidateEntry(insulinEntries.filter(entry => (0, exports.getTimestampFlooredToEveryFiveMinutes)(entry.timestamp) === timestamp));
        const meterEntry = getAndValidateEntry(meterEntries.filter(entry => (0, exports.getTimestampFlooredToEveryFiveMinutes)(entry.timestamp) === timestamp));
        const carbEntry = getAndValidateEntry(carbEntries.filter(entry => (0, exports.getTimestampFlooredToEveryFiveMinutes)(entry.timestamp) === timestamp));
        const profileActivationsInSlot = profileActivations?.filter(activation => (0, exports.getTimestampFlooredToEveryFiveMinutes)(activation.activatedAt) === timestamp);
        const alarmsInSlot = alarms?.filter(alarm => (0, exports.getTimestampFlooredToEveryFiveMinutes)((0, alarms_1.getFirstAlarmState)(alarm).timestamp) === timestamp);
        const val = bgEntry ? bgEntry.bloodGlucose : null;
        const color = (0, exports.getFillColor)(val);
        return {
            isoTimestamp: timestamp,
            timestamp: (0, time_1.getTimeInMillis)(timestamp),
            val,
            color,
            ...(insulinEntry && { insulinEntry }),
            ...(meterEntry && { meterEntry }),
            ...(carbEntry && { carbEntry }),
            ...(profileActivationsInSlot && { profileActivations: profileActivationsInSlot }),
            ...(alarmsInSlot && { alarms: alarmsInSlot }),
        };
    })
        .reverse();
};
exports.mapTimelineEntriesToGraphPoints = mapTimelineEntriesToGraphPoints;
//# sourceMappingURL=timelineEntries.js.map