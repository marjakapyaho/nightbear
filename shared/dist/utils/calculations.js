"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateRequiredCarbsToInsulinRatio = exports.calculateCurrentCarbsToInsulinRatio = exports.getCarbsOnBoard = exports.getPercentOfCarbsRemaining = exports.getInsulinOnBoard = exports.getPercentOfInsulinRemaining = exports.calculateAverageBg = exports.calculateDailyAverageBgs = exports.calculateDailyAmounts = exports.getBgAverage = exports.countSituations = exports.calculateTimeHigh = exports.calculateTimeLow = exports.calculateTimeInRange = exports.calculateHba1c = exports.roundTo2Decimals = exports.roundTo1Decimals = exports.roundTo0Decimals = exports.setDecimals = exports.setOneDecimal = exports.isDexcomEntryValid = exports.calculateRaw = exports.changeBloodGlucoseUnitToMgdl = exports.changeBloodGlucoseUnitToMmoll = exports.NOISE_LEVEL_LIMIT = exports.TIME_LIMIT_FOR_SLOPE = exports.DAY_IN_MS = exports.HOUR_IN_MS = exports.MIN_IN_MS = exports.SEC_IN_MS = void 0;
const lodash_1 = require("lodash");
const config_1 = require("./config");
const time_1 = require("./time");
const helpers_1 = require("./helpers");
exports.SEC_IN_MS = 1000;
exports.MIN_IN_MS = 60 * exports.SEC_IN_MS;
exports.HOUR_IN_MS = 60 * exports.MIN_IN_MS;
exports.DAY_IN_MS = 24 * exports.HOUR_IN_MS;
exports.TIME_LIMIT_FOR_SLOPE = 15 * exports.MIN_IN_MS;
exports.NOISE_LEVEL_LIMIT = 4;
// Conversion from mg/dL to mmol/L (rounds to 1 decimal)
const changeBloodGlucoseUnitToMmoll = (glucoseInMgdl) => {
    return Math.round((glucoseInMgdl / 18) * 10) / 10;
};
exports.changeBloodGlucoseUnitToMmoll = changeBloodGlucoseUnitToMmoll;
// Conversion from mmol/L to mg/dL
const changeBloodGlucoseUnitToMgdl = (glucoseInMmoll) => {
    const numeric = Math.floor(10 * glucoseInMmoll) / 10;
    return Math.round(18 * numeric);
};
exports.changeBloodGlucoseUnitToMgdl = changeBloodGlucoseUnitToMgdl;
// Calculates actual blood glucose in mmol/L
const calculateRaw = (unfiltered, slope, intercept, scale = 1) => {
    if (unfiltered !== 0 && slope !== 0 && scale !== 0) {
        const raw = (scale * (unfiltered - intercept)) / slope;
        return (0, exports.changeBloodGlucoseUnitToMmoll)(raw);
    }
    return null;
};
exports.calculateRaw = calculateRaw;
// Is Dexcom entry valid
const isDexcomEntryValid = (noise, sgv) => {
    return noise < exports.NOISE_LEVEL_LIMIT && sgv > 40;
};
exports.isDexcomEntryValid = isDexcomEntryValid;
function setOneDecimal(num) {
    return num ? (Math.round(num * 10) / 10).toFixed(1) : '';
}
exports.setOneDecimal = setOneDecimal;
function setDecimals(num, decimals) {
    return num ? num.toFixed(decimals) : '';
}
exports.setDecimals = setDecimals;
// Rounds a number to 0 decimals
const roundTo0Decimals = (num) => {
    return Math.round(num);
};
exports.roundTo0Decimals = roundTo0Decimals;
// Rounds a number to 1 decimal; for contexts where more precision is a nuisance when debugging
const roundTo1Decimals = (num) => {
    return Math.round(num * 10) / 10;
};
exports.roundTo1Decimals = roundTo1Decimals;
const roundTo2Decimals = (num) => {
    return Math.round(num * 100) / 100;
};
exports.roundTo2Decimals = roundTo2Decimals;
const calculateHba1c = (entries) => {
    const sumOfEntries = (0, lodash_1.reduce)(entries, (sum, entry) => {
        return sum + (0, exports.changeBloodGlucoseUnitToMgdl)(entry.bloodGlucose);
    }, 0);
    const avgGlucose = sumOfEntries / entries.length;
    // Base formula (avgGlucose + 46.7) / 28.7) from research, -0.6 from Nightscout
    return (avgGlucose + 46.7) / 28.7 - 0.6;
};
exports.calculateHba1c = calculateHba1c;
const calculateTimeInRange = (sensorEntries) => {
    const totalCount = sensorEntries.length;
    const goodCount = sensorEntries.filter(entry => entry.bloodGlucose &&
        entry.bloodGlucose >= config_1.timeInRangeLowLimit &&
        entry.bloodGlucose <= config_1.timeInRangeHighLimit).length;
    return Math.round((goodCount / totalCount) * 100);
};
exports.calculateTimeInRange = calculateTimeInRange;
const calculateTimeLow = (sensorEntries) => {
    const totalCount = sensorEntries.length;
    const goodCount = sensorEntries.filter(entry => entry.bloodGlucose && entry.bloodGlucose < config_1.timeInRangeLowLimit).length;
    return Math.round((goodCount / totalCount) * 100);
};
exports.calculateTimeLow = calculateTimeLow;
const calculateTimeHigh = (sensorEntries) => {
    const totalCount = sensorEntries.length;
    const goodCount = sensorEntries.filter(entry => entry.bloodGlucose && entry.bloodGlucose > config_1.timeInRangeHighLimit).length;
    return Math.round((goodCount / totalCount) * 100);
};
exports.calculateTimeHigh = calculateTimeHigh;
// Note: if there is e.g. 10 entries over limit in a row, it's categorized as one single occurrence of situation
const countSituations = (sensorEntries, limit, low) => {
    let counter = 0;
    let incidentBeingRecorded;
    sensorEntries.forEach(entry => {
        if (entry.bloodGlucose && (low ? entry.bloodGlucose < limit : entry.bloodGlucose > limit)) {
            if (!incidentBeingRecorded) {
                counter++;
                incidentBeingRecorded = true;
            }
        }
        else {
            incidentBeingRecorded = false;
        }
    });
    return counter;
};
exports.countSituations = countSituations;
const getBgAverage = (sensorEntries) => {
    const entriesWithBgs = sensorEntries.filter(entry => entry.bloodGlucose);
    return setOneDecimal(entriesWithBgs.reduce((sum, entry) => sum + (entry.bloodGlucose || 0), 0) /
        entriesWithBgs.length);
};
exports.getBgAverage = getBgAverage;
const getTotal = (dailyAmounts) => dailyAmounts.reduce((prev, current) => prev + current.amount, 0);
const getDailyAverage = (dailySensorEntries) => dailySensorEntries.length
    ? dailySensorEntries.reduce((prev, current) => prev + current.bloodGlucose, 0) /
        dailySensorEntries.length
    : 0;
const calculateDailyAmounts = (entries, days, now = Date.now()) => {
    const dayArray = (0, lodash_1.fill)(Array(days), null).map((_val, i) => ({
        timestamp: (0, time_1.getDateWithoutTimeMs)(now - exports.DAY_IN_MS * i),
        total: null,
    }));
    const groupedEntries = (0, lodash_1.groupBy)(entries, entry => (0, time_1.getDateWithoutTime)(entry.timestamp));
    return dayArray
        .map(day => ({
        timestamp: day.timestamp,
        total: day.timestamp && groupedEntries[day.timestamp]
            ? getTotal(groupedEntries[day.timestamp])
            : null,
    }))
        .reverse();
};
exports.calculateDailyAmounts = calculateDailyAmounts;
const calculateDailyAverageBgs = (entries, days, now = Date.now()) => {
    const dayArray = (0, lodash_1.fill)(Array(days), null).map((_val, i) => ({
        timestamp: (0, time_1.getDateWithoutTimeMs)(now - exports.DAY_IN_MS * i),
        average: null,
    }));
    const groupedEntries = (0, lodash_1.groupBy)(entries, entry => (0, time_1.getDateWithoutTime)(entry.timestamp));
    return dayArray
        .map(day => ({
        timestamp: day.timestamp,
        average: day.timestamp && groupedEntries[day.timestamp]
            ? getDailyAverage(groupedEntries[day.timestamp])
            : null,
    }))
        .reverse();
};
exports.calculateDailyAverageBgs = calculateDailyAverageBgs;
const calculateAverageBg = (entries) => {
    const sumOfBgs = entries.map(entry => entry.bloodGlucose).reduce((prev, cur) => prev + cur, 0);
    return (0, helpers_1.roundNumberToFixedDecimals)(sumOfBgs / entries.length, 1);
};
exports.calculateAverageBg = calculateAverageBg;
// Adjusted from: https://github.com/LoopKit/LoopKit/blob/dev/LoopKit/InsulinKit/ExponentialInsulinModel.swift (MIT license)
const calculatePercentageRemaining = (actionDuration, peakActivityTime, minutesSince) => {
    const pi = (peakActivityTime * (1 - peakActivityTime / actionDuration)) /
        (1 - (2 * peakActivityTime) / actionDuration);
    const a = (2 * pi) / actionDuration;
    const S = 1 / (1 - a + (1 + a) * Math.exp(-actionDuration / pi));
    if (minutesSince <= 0) {
        return 1;
    }
    else if (minutesSince >= actionDuration) {
        return 0;
    }
    return (1 -
        S *
            (1 - a) *
            ((Math.pow(minutesSince, 2) / (pi * actionDuration * (1 - a)) - minutesSince / pi - 1) *
                Math.exp(-minutesSince / pi) +
                1));
};
// Adjusted from: https://github.com/LoopKit/LoopKit/blob/dev/LoopKit/InsulinKit/ExponentialInsulinModel.swift (MIT license)
const getPercentOfInsulinRemaining = (injectionTimestamp, currentTimestamp) => {
    const actionDuration = 360; // Minutes (Fiasp)
    const peakActivityTime = 55; // Minutes (Fiasp)
    const minutesSinceInjection = (0, time_1.getTimeMinusTimeMs)(currentTimestamp, injectionTimestamp) / exports.MIN_IN_MS;
    return calculatePercentageRemaining(actionDuration, peakActivityTime, minutesSinceInjection);
};
exports.getPercentOfInsulinRemaining = getPercentOfInsulinRemaining;
const getInsulinOnBoard = (currentTimestamp, insulinEntries) => insulinEntries
    .filter(entry => entry.type === 'FAST')
    .map(entry => {
    const insulinRemainingPercentage = (0, exports.getPercentOfInsulinRemaining)(entry.timestamp, currentTimestamp);
    return insulinRemainingPercentage * entry.amount;
})
    .reduce((prev, cur) => prev + cur, 0);
exports.getInsulinOnBoard = getInsulinOnBoard;
// Adjusted from the insulin graph above
const getPercentOfCarbsRemaining = (digestionTimestamp, currentTimestamp, durationFactor) => {
    const actionDuration = 60 * durationFactor; // Minutes (default is for sugar)
    const peakActivityTime = 20 * durationFactor; // Minutes (default is for sugar)
    const minutesSinceDigestion = (0, time_1.getTimeMinusTimeMs)(currentTimestamp, digestionTimestamp) / exports.MIN_IN_MS;
    return calculatePercentageRemaining(actionDuration, peakActivityTime, minutesSinceDigestion);
};
exports.getPercentOfCarbsRemaining = getPercentOfCarbsRemaining;
const getCarbsOnBoard = (currentTimestamp, carbEntries) => carbEntries
    .map(entry => {
    const carbsRemainingPercentage = (0, exports.getPercentOfCarbsRemaining)(entry.timestamp, currentTimestamp, entry.durationFactor);
    return carbsRemainingPercentage * entry.amount;
})
    .reduce((prev, cur) => prev + cur, 0);
exports.getCarbsOnBoard = getCarbsOnBoard;
const calculateCurrentCarbsToInsulinRatio = (carbsOnBoard, insulinOnBoard) => {
    const ratio = carbsOnBoard / insulinOnBoard;
    return (0, helpers_1.isValidNumber)(ratio) ? ratio : null;
};
exports.calculateCurrentCarbsToInsulinRatio = calculateCurrentCarbsToInsulinRatio;
const calculateRequiredCarbsToInsulinRatio = (currentTimestamp, carbEntries, insulinEntries) => {
    // Ignore last 2 hours as we might be having an issue with missing insulin or carbs, so it's not a good example
    const timeWindowEnd = (0, time_1.getTimeMinusTimeMs)(currentTimestamp, (0, time_1.hourToMs)(2));
    const relevantCarbEntries = carbEntries.filter(entry => (0, time_1.isTimeSmaller)(entry.timestamp, timeWindowEnd));
    const relevantInsulinEntries = insulinEntries.filter(entry => (0, time_1.isTimeSmaller)(entry.timestamp, timeWindowEnd));
    const sumOfCarbs = relevantCarbEntries
        .map(entry => entry.amount)
        .reduce((prev, cur) => prev + cur, 0);
    const sumOfInsulins = relevantInsulinEntries
        .map(entry => entry.amount)
        .reduce((prev, cur) => prev + cur, 0);
    const ratio = sumOfCarbs / sumOfInsulins;
    return (0, helpers_1.isValidNumber)(ratio) ? ratio : null;
};
exports.calculateRequiredCarbsToInsulinRatio = calculateRequiredCarbsToInsulinRatio;
//# sourceMappingURL=calculations.js.map