"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLowLimitWithPossibleAddition = exports.getHighLimitWithPossibleAddition = exports.areThereSpecificSituationsInGivenWindow = exports.isPredictedSituationAnyHighOrMissing = exports.isPredictedSituationAnyLowOrMissing = exports.isBloodGlucoseRelativeHigh = exports.isBloodGlucoseRelativeLow = exports.isThereTooLittleInsulin = exports.isThereTooMuchInsulin = exports.isSlopeRising = exports.isSlopeFalling = exports.slopeIsPositive = exports.slopeIsNegative = exports.getRelevantEntries = exports.isSituationCritical = exports.getPredictedSituation = exports.getPredictedAnalyserEntries = exports.getLatestAnalyserEntry = exports.mapSensorAndMeterEntriesToAnalyserEntries = exports.slopeLimits = exports.CARBS_TO_INSULIN_MULTIPLIER = exports.RELEVANT_IOB_LIMIT_FOR_HIGH = exports.RELEVANT_IOB_LIMIT_FOR_LOW = exports.LOW_CLEARING_THRESHOLD = exports.HIGH_CLEARING_THRESHOLD = exports.LOW_CORRECTION_SUPPRESSION_WINDOW = exports.TIME_SINCE_BG_CRITICAL = exports.BAD_LOW_QUARANTINE_WINDOW = exports.BAD_HIGH_QUARANTINE_WINDOW = exports.LOW_COUNT_LIMIT_FOR_COMPRESSION_LOW = exports.COMPRESSION_LOW_TIME_WINDOW = exports.PERSISTENT_HIGH_TIME_WINDOW = exports.LOW_LEVEL_BAD = void 0;
const shared_1 = require("@nightbear/shared");
const lodash_1 = require("lodash");
const shared_2 = require("@nightbear/shared");
const ml_regression_simple_linear_1 = require("ml-regression-simple-linear");
const analyser_1 = require("./analyser");
const shared_3 = require("@nightbear/shared");
const shared_4 = require("@nightbear/shared");
// Critical settings
exports.LOW_LEVEL_BAD = 3.0;
// Minutes
exports.PERSISTENT_HIGH_TIME_WINDOW = 60;
exports.COMPRESSION_LOW_TIME_WINDOW = 25;
exports.LOW_COUNT_LIMIT_FOR_COMPRESSION_LOW = 4;
exports.BAD_HIGH_QUARANTINE_WINDOW = 60;
exports.BAD_LOW_QUARANTINE_WINDOW = 15;
exports.TIME_SINCE_BG_CRITICAL = 15;
exports.LOW_CORRECTION_SUPPRESSION_WINDOW = 20;
// Other units
exports.HIGH_CLEARING_THRESHOLD = 1;
exports.LOW_CLEARING_THRESHOLD = 0.5;
exports.RELEVANT_IOB_LIMIT_FOR_LOW = 0.5;
exports.RELEVANT_IOB_LIMIT_FOR_HIGH = 1;
exports.CARBS_TO_INSULIN_MULTIPLIER = 1.5;
exports.slopeLimits = {
    SLOW: 0.3,
    MEDIUM: 0.6,
    FAST: 1.3,
    MEGA_FAST: 2,
};
const PREDICTION_TIME_MINUTES = 20;
const DATA_USED_FOR_PREDICTION_MINUTES = 20;
const changeSum = (numbers) => {
    return (0, lodash_1.sum)(numbers);
};
const window = (_number, index, numbers) => {
    const start = Math.max(0, index - 1);
    const end = Math.min(numbers.length, index + 1 + 1);
    return (0, lodash_1.slice)(numbers, start, end);
};
const detectNoise = (entries) => {
    const directionChanges = entries.map((entry, i) => {
        const previousEntry = entries[i - 1];
        let changedDirection = 0;
        if (previousEntry && previousEntry.slope && entry.slope) {
            changedDirection =
                (previousEntry.slope > 0 && entry.slope < 0) || (previousEntry.slope < 0 && entry.slope > 0)
                    ? 1
                    : 0;
        }
        return changedDirection;
    });
    return directionChanges.map(window).map(changeSum);
};
const sumOfSlopes = (entries) => {
    return (0, lodash_1.reduce)(entries, (slopeSum, entry) => slopeSum + (entry.slope || 0), 0);
};
const average = ({ entries, currentEntry, }) => {
    const newSlope = sumOfSlopes(entries)
        ? sumOfSlopes(entries) / (entries.length || 1)
        : currentEntry.rawSlope;
    const roundedNewSlope = newSlope ? (0, shared_1.roundTo2Decimals)(newSlope) : newSlope;
    return {
        bloodGlucose: currentEntry.bloodGlucose,
        timestamp: currentEntry.timestamp,
        slope: roundedNewSlope,
        rawSlope: currentEntry.rawSlope,
    };
};
const makeWindow = (noiseArray) => {
    return (currentEntry, index, entries) => {
        const noise = noiseArray[index];
        const start = Math.max(0, index - noise);
        const end = Math.min(entries.length, index + noise + 1);
        return { entries: (0, lodash_1.slice)(entries, start, end), currentEntry };
    };
};
const smoothSlopesWithNoise = (entries, noiseArray) => {
    return entries.map(makeWindow(noiseArray)).map(average);
};
const mapSensorAndMeterEntriesToAnalyserEntries = (sensorEntries, meterEntries) => {
    const allEntries = (0, shared_4.getMergedBgEntries)(sensorEntries, meterEntries);
    const entriesWithSlopes = allEntries.map((entry, i) => {
        const currentBg = entry.bloodGlucose;
        const currentTimestamp = entry.timestamp;
        const previousEntry = allEntries[i - 1];
        let currentSlope;
        if (previousEntry) {
            const previousBg = previousEntry.bloodGlucose;
            const previousTimestamp = previousEntry.timestamp;
            const timeBetweenEntries = (0, shared_2.getTimeMinusTimeMs)(currentTimestamp, previousTimestamp);
            if (timeBetweenEntries < shared_1.TIME_LIMIT_FOR_SLOPE && timeBetweenEntries > 0) {
                currentSlope = (0, shared_1.roundTo2Decimals)(((currentBg - previousBg) / timeBetweenEntries) * shared_1.MIN_IN_MS * 5);
            }
        }
        return {
            bloodGlucose: currentBg,
            timestamp: currentTimestamp,
            slope: currentSlope,
            rawSlope: currentSlope,
        };
    });
    const noiseArray = detectNoise(entriesWithSlopes);
    return smoothSlopesWithNoise(entriesWithSlopes, noiseArray);
};
exports.mapSensorAndMeterEntriesToAnalyserEntries = mapSensorAndMeterEntriesToAnalyserEntries;
const getLatestAnalyserEntry = (entries) => (0, lodash_1.chain)(entries).last().value();
exports.getLatestAnalyserEntry = getLatestAnalyserEntry;
const getPredictedAnalyserEntries = (analyserEntries, predictionMinutes) => {
    if (analyserEntries.length < 2) {
        return [];
    }
    const latestEntryTimestamp = (0, exports.getLatestAnalyserEntry)(analyserEntries)?.timestamp;
    const predictionRangeEnd = (0, shared_2.getTimeMinusTime)(latestEntryTimestamp, DATA_USED_FOR_PREDICTION_MINUTES * shared_1.MIN_IN_MS);
    const entries = analyserEntries.filter(entry => entry.timestamp > predictionRangeEnd);
    const entriesCount = entries.length;
    const latestEntry = (0, exports.getLatestAnalyserEntry)(entries);
    const x = Array.from(Array(entriesCount).keys());
    const y = entries.map(entry => entry.bloodGlucose);
    const regression = new ml_regression_simple_linear_1.SimpleLinearRegression(x, y);
    const predictionCount = predictionMinutes / 5; // e.g. 30 minutes would predict 6 values
    const predictionArray = Array.from(Array(predictionCount).keys()).map(num => entriesCount + num);
    const predictedSensorEntries = regression.predict(predictionArray).map((val, i) => ({
        bloodGlucose: val,
        timestamp: (0, shared_2.getTimePlusTime)(latestEntry?.timestamp, (i + 1) * 5 * shared_1.MIN_IN_MS),
        type: 'DEXCOM_G6_SHARE',
    }));
    return (0, exports.mapSensorAndMeterEntriesToAnalyserEntries)(predictedSensorEntries);
};
exports.getPredictedAnalyserEntries = getPredictedAnalyserEntries;
const getPredictedSituation = (activeProfile, analyserEntries, insulinEntries, carbEntries, alarms, requiredCarbsToInsulin) => {
    const predictedEntries = (0, exports.getPredictedAnalyserEntries)(analyserEntries, PREDICTION_TIME_MINUTES);
    return (0, analyser_1.detectSituation)((0, exports.getLatestAnalyserEntry)(predictedEntries)?.timestamp, activeProfile, predictedEntries, insulinEntries, carbEntries, alarms, requiredCarbsToInsulin);
};
exports.getPredictedSituation = getPredictedSituation;
const isSituationCritical = (situation) => situation === 'LOW' ||
    situation === 'BAD_LOW' ||
    situation === 'FALLING' ||
    situation === 'BAD_HIGH';
exports.isSituationCritical = isSituationCritical;
const hasEnoughData = (relevantEntries, dataNeededMinutes) => {
    // E.g. we want 30 min of data which could have 30/5 = 6 entries but depending
    // on start time and delay could only have 5 entries, and then we'll leave
    // one entry slack for the check (= -2)
    const entriesNeeded = dataNeededMinutes / 5 - 1;
    return relevantEntries.length >= entriesNeeded;
};
const getEntriesWithinTimeRange = (currentTimestamp, entries, dataNeededMinutes) => {
    const dataNeededMs = dataNeededMinutes * shared_1.MIN_IN_MS;
    const timeWindowStart = (0, shared_2.getTimeMinusTimeMs)(currentTimestamp, dataNeededMs);
    return entries.filter(entry => (0, shared_2.isTimeLargerOrEqual)(entry.timestamp, timeWindowStart));
};
const getRelevantEntries = (currentTimestamp, entries, dataNeededMinutes) => {
    const relevantEntries = getEntriesWithinTimeRange(currentTimestamp, entries, dataNeededMinutes);
    return {
        relevantEntries,
        hasEnoughData: hasEnoughData(relevantEntries, dataNeededMinutes),
    };
};
exports.getRelevantEntries = getRelevantEntries;
const slopeIsNegative = (entry) => entry.slope && entry.slope < 0;
exports.slopeIsNegative = slopeIsNegative;
const slopeIsPositive = (entry) => entry.slope && entry.slope > 0;
exports.slopeIsPositive = slopeIsPositive;
const isSlopeFalling = (entry) => entry.slope && entry.slope < -exports.slopeLimits.MEDIUM;
exports.isSlopeFalling = isSlopeFalling;
const isSlopeRising = (entry) => entry.slope && entry.slope > exports.slopeLimits.MEDIUM;
exports.isSlopeRising = isSlopeRising;
const isThereTooMuchInsulin = (requiredCarbsToInsulin, currentCarbsToInsulin) => currentCarbsToInsulin !== null &&
    requiredCarbsToInsulin !== null &&
    currentCarbsToInsulin < requiredCarbsToInsulin * exports.CARBS_TO_INSULIN_MULTIPLIER;
exports.isThereTooMuchInsulin = isThereTooMuchInsulin;
const isThereTooLittleInsulin = (requiredCarbsToInsulin, currentCarbsToInsulin) => currentCarbsToInsulin !== null &&
    requiredCarbsToInsulin !== null &&
    currentCarbsToInsulin > requiredCarbsToInsulin * exports.CARBS_TO_INSULIN_MULTIPLIER;
exports.isThereTooLittleInsulin = isThereTooLittleInsulin;
const isBloodGlucoseRelativeLow = (latestEntry, activeProfile) => latestEntry.bloodGlucose < activeProfile.analyserSettings.lowLevelRel &&
    latestEntry.bloodGlucose >= activeProfile.analyserSettings.lowLevelAbs;
exports.isBloodGlucoseRelativeLow = isBloodGlucoseRelativeLow;
const isBloodGlucoseRelativeHigh = (latestEntry, activeProfile) => latestEntry.bloodGlucose > activeProfile.analyserSettings.highLevelRel &&
    latestEntry.bloodGlucose <= activeProfile.analyserSettings.highLevelAbs;
exports.isBloodGlucoseRelativeHigh = isBloodGlucoseRelativeHigh;
// If predictedSituation is not defined, we're doing the "predictedSituation" detection
// for analyser and can just ignore predicted situation param
const isPredictedSituationAnyLowOrMissing = (predictedSituation) => !predictedSituation || predictedSituation === 'LOW' || predictedSituation === 'BAD_LOW';
exports.isPredictedSituationAnyLowOrMissing = isPredictedSituationAnyLowOrMissing;
const isPredictedSituationAnyHighOrMissing = (predictedSituation) => !predictedSituation || predictedSituation === 'HIGH' || predictedSituation === 'BAD_HIGH';
exports.isPredictedSituationAnyHighOrMissing = isPredictedSituationAnyHighOrMissing;
const areThereSpecificSituationsInGivenWindow = (currentTimestamp, alarms, situation, windowMinutes) => !alarms.find(alarm => {
    const alarmDeactivatedInsideGivenWindow = alarm.deactivatedAt &&
        (0, shared_2.isTimeLarger)(alarm.deactivatedAt, (0, shared_2.getTimeMinusTimeMs)(currentTimestamp, (0, shared_2.minToMs)(windowMinutes)));
    return alarm.situation === situation && (alarm.isActive || alarmDeactivatedInsideGivenWindow);
});
exports.areThereSpecificSituationsInGivenWindow = areThereSpecificSituationsInGivenWindow;
const getHighLimitWithPossibleAddition = (alarms, activeProfile) => {
    const thresholdAdditionIfAlreadyHigh = (0, lodash_1.find)((0, shared_3.onlyActive)(alarms), { situation: 'HIGH' })
        ? exports.HIGH_CLEARING_THRESHOLD
        : 0;
    return activeProfile.analyserSettings.highLevelAbs - thresholdAdditionIfAlreadyHigh;
};
exports.getHighLimitWithPossibleAddition = getHighLimitWithPossibleAddition;
const getLowLimitWithPossibleAddition = (alarms, activeProfile) => {
    const thresholdAdditionIfAlreadyLow = (0, lodash_1.find)((0, shared_3.onlyActive)(alarms), { situation: 'LOW' })
        ? exports.LOW_CLEARING_THRESHOLD
        : 0;
    return activeProfile.analyserSettings.lowLevelAbs + thresholdAdditionIfAlreadyLow;
};
exports.getLowLimitWithPossibleAddition = getLowLimitWithPossibleAddition;
//# sourceMappingURL=utils.js.map