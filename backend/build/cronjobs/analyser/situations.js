"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.detectPersistentHigh = exports.detectRising = exports.detectFalling = exports.detectHigh = exports.detectLow = exports.detectCompressionLow = exports.detectOutdated = exports.detectBadHigh = exports.detectBadLow = exports.detectCriticalOutdated = void 0;
const shared_1 = require("@nightbear/shared");
const utils_1 = require("./utils");
const lodash_1 = require("lodash");
const utils_2 = require("../checks/utils");
const detectCriticalOutdated = (latestEntry, insulinOnBoard, currentTimestamp, predictedSituation) => {
    // If there is no data, it's been hours without data, so we should alarm immediately
    if (!latestEntry) {
        return true;
    }
    // How long since latest entry
    const msSinceLatestEntry = (0, shared_1.getTimeMinusTimeMs)(currentTimestamp, latestEntry.timestamp);
    // If we're missing at least two entries, and we're predicting critical situation or have
    // relevant amount of insulin, alarm about data being critically outdated immediately
    return (msSinceLatestEntry > (0, shared_1.minToMs)(utils_1.TIME_SINCE_BG_CRITICAL) &&
        ((0, utils_1.isSituationCritical)(predictedSituation) || insulinOnBoard > utils_1.RELEVANT_IOB_LIMIT_FOR_LOW));
};
exports.detectCriticalOutdated = detectCriticalOutdated;
const detectBadLow = (latestEntry) => latestEntry.bloodGlucose < utils_1.LOW_LEVEL_BAD;
exports.detectBadLow = detectBadLow;
const detectBadHigh = (activeProfile, latestEntry) => latestEntry.bloodGlucose > activeProfile.analyserSettings.highLevelBad;
exports.detectBadHigh = detectBadHigh;
const detectOutdated = (activeProfile, latestEntry, currentTimestamp) => {
    // How long since latest entry
    const msSinceLatestEntry = (0, shared_1.getTimeMinusTimeMs)(currentTimestamp, latestEntry.timestamp);
    // Check if we're over timeSinceBgMinutes from settings
    return msSinceLatestEntry > (0, shared_1.minToMs)(activeProfile.analyserSettings.timeSinceBgMinutes);
};
exports.detectOutdated = detectOutdated;
const detectCompressionLow = (activeProfile, entries, insulinOnBoard, currentTimestamp) => {
    const noRelevantInsulin = insulinOnBoard < utils_1.RELEVANT_IOB_LIMIT_FOR_LOW;
    const isNight = activeProfile.profileName === 'night';
    const { relevantEntries, hasEnoughData } = (0, utils_1.getRelevantEntries)(currentTimestamp, entries, utils_1.COMPRESSION_LOW_TIME_WINDOW);
    const slopeIsReallyBig = Boolean((0, lodash_1.find)(relevantEntries, entry => entry.rawSlope && Math.abs(entry.rawSlope) > utils_1.slopeLimits.MEGA_FAST));
    const thereAreNotTooManyLowEntries = relevantEntries.filter(entry => entry.bloodGlucose < activeProfile.analyserSettings.lowLevelAbs)
        .length < utils_1.LOW_COUNT_LIMIT_FOR_COMPRESSION_LOW;
    return (noRelevantInsulin &&
        isNight &&
        hasEnoughData &&
        slopeIsReallyBig &&
        thereAreNotTooManyLowEntries);
};
exports.detectCompressionLow = detectCompressionLow;
const detectLow = (activeProfile, latestEntry, alarms, carbEntries, thereIsTooMuchInsulinForCarbs, currentTimestamp) => {
    const bloodGlucoseIsLow = latestEntry.bloodGlucose < (0, utils_1.getLowLimitWithPossibleAddition)(alarms, activeProfile);
    const notComingUpFromBadLow = (0, utils_1.areThereSpecificSituationsInGivenWindow)(currentTimestamp, alarms, 'BAD_LOW', utils_1.BAD_LOW_QUARANTINE_WINDOW);
    const thereAreNotEnoughCorrectionCarbs = (0, utils_2.getEntriesWithinTimeRange)(currentTimestamp, carbEntries, (0, shared_1.minToMs)(utils_1.LOW_CORRECTION_SUPPRESSION_WINDOW)).length === 0 || thereIsTooMuchInsulinForCarbs;
    return bloodGlucoseIsLow && notComingUpFromBadLow && thereAreNotEnoughCorrectionCarbs;
};
exports.detectLow = detectLow;
const detectHigh = (activeProfile, latestEntry, alarms, insulinOnBoard, thereIsTooLittleInsulinForCarbs, currentTimestamp) => {
    const bloodGlucoseIsHigh = latestEntry.bloodGlucose > (0, utils_1.getHighLimitWithPossibleAddition)(alarms, activeProfile);
    const notComingDownFromBadHigh = (0, utils_1.areThereSpecificSituationsInGivenWindow)(currentTimestamp, alarms, 'BAD_HIGH', utils_1.BAD_HIGH_QUARANTINE_WINDOW);
    const thereIsNotEnoughCorrectionInsulin = insulinOnBoard < utils_1.RELEVANT_IOB_LIMIT_FOR_HIGH || thereIsTooLittleInsulinForCarbs;
    return bloodGlucoseIsHigh && notComingDownFromBadHigh && thereIsNotEnoughCorrectionInsulin;
};
exports.detectHigh = detectHigh;
const detectFalling = (activeProfile, latestEntry, carbEntries, currentTimestamp, thereIsTooMuchInsulinForCarbs, predictedSituation) => {
    const bloodGlucoseIsRelativeLow = (0, utils_1.isBloodGlucoseRelativeLow)(latestEntry, activeProfile);
    const slopeIsFalling = (0, utils_1.isSlopeFalling)(latestEntry);
    const predictedSituationIsLowOrBadLow = (0, utils_1.isPredictedSituationAnyLowOrMissing)(predictedSituation);
    const thereAreNotEnoughCorrectionCarbs = (0, utils_2.getEntriesWithinTimeRange)(currentTimestamp, carbEntries, (0, shared_1.minToMs)(utils_1.LOW_CORRECTION_SUPPRESSION_WINDOW)).length === 0 || thereIsTooMuchInsulinForCarbs;
    return (bloodGlucoseIsRelativeLow &&
        (slopeIsFalling || ((0, utils_1.slopeIsNegative)(latestEntry) && predictedSituationIsLowOrBadLow)) &&
        thereAreNotEnoughCorrectionCarbs);
};
exports.detectFalling = detectFalling;
const detectRising = (activeProfile, latestEntry, insulinOnBoard, thereIsTooLittleInsulinForCarbs, predictedSituation) => {
    const bloodGlucoseIsRelativeHigh = (0, utils_1.isBloodGlucoseRelativeHigh)(latestEntry, activeProfile);
    const slopeIsRising = (0, utils_1.isSlopeRising)(latestEntry);
    const predictedSituationIsHighOrBadHigh = (0, utils_1.isPredictedSituationAnyHighOrMissing)(predictedSituation);
    const thereIsNotEnoughCorrectionInsulin = insulinOnBoard < utils_1.RELEVANT_IOB_LIMIT_FOR_HIGH || thereIsTooLittleInsulinForCarbs;
    return (bloodGlucoseIsRelativeHigh &&
        (slopeIsRising || ((0, utils_1.slopeIsPositive)(latestEntry) && predictedSituationIsHighOrBadHigh)) &&
        thereIsNotEnoughCorrectionInsulin);
};
exports.detectRising = detectRising;
const detectPersistentHigh = (activeProfile, latestEntry, entries, insulinOnBoard, thereIsTooLittleInsulinForCarbs, currentTimestamp) => {
    const { relevantEntries, hasEnoughData } = (0, utils_1.getRelevantEntries)(currentTimestamp, entries, utils_1.PERSISTENT_HIGH_TIME_WINDOW);
    const isAllDataRelativeHigh = relevantEntries.filter(entry => (0, utils_1.isBloodGlucoseRelativeHigh)(entry, activeProfile)).length ===
        relevantEntries.length;
    const thereIsNotEnoughCorrectionInsulin = insulinOnBoard < utils_1.RELEVANT_IOB_LIMIT_FOR_HIGH || thereIsTooLittleInsulinForCarbs;
    const slopeIsNotDown = !(0, utils_1.slopeIsNegative)(latestEntry);
    return (hasEnoughData && isAllDataRelativeHigh && thereIsNotEnoughCorrectionInsulin && slopeIsNotDown);
};
exports.detectPersistentHigh = detectPersistentHigh;
//# sourceMappingURL=situations.js.map