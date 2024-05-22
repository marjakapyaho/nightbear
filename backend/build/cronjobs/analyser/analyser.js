"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.detectSituation = exports.runAnalysis = void 0;
const utils_1 = require("./utils");
const situations_1 = require("./situations");
const shared_1 = require("@nightbear/shared");
const utils_2 = require("../checks/utils");
const shared_2 = require("@nightbear/shared");
const runAnalysis = ({ currentTimestamp, activeProfile, sensorEntries, meterEntries, insulinEntries, carbEntries, alarms, }) => {
    const analyserEntries = (0, utils_1.mapSensorAndMeterEntriesToAnalyserEntries)(sensorEntries, meterEntries);
    const requiredCarbsToInsulin = (0, shared_1.calculateRequiredCarbsToInsulinRatio)(currentTimestamp, carbEntries, insulinEntries);
    const relevantInsulinEntries = (0, utils_2.getEntriesWithinTimeRange)(currentTimestamp, insulinEntries, (0, shared_2.hourToMs)(6));
    const relevantCarbEntries = (0, utils_2.getEntriesWithinTimeRange)(currentTimestamp, carbEntries, (0, shared_2.hourToMs)(6));
    const predictedSituation = (0, utils_1.getPredictedSituation)(activeProfile, analyserEntries, relevantInsulinEntries, relevantCarbEntries, alarms, requiredCarbsToInsulin);
    return (0, exports.detectSituation)(currentTimestamp, activeProfile, analyserEntries, relevantInsulinEntries, relevantCarbEntries, alarms, requiredCarbsToInsulin, predictedSituation);
};
exports.runAnalysis = runAnalysis;
const detectSituation = (currentTimestamp, activeProfile, analyserEntries, insulinEntries, carbEntries, alarms, requiredCarbsToInsulin, predictedSituation) => {
    const latestEntry = (0, utils_1.getLatestAnalyserEntry)(analyserEntries);
    const insulinOnBoard = (0, shared_1.getInsulinOnBoard)(currentTimestamp, insulinEntries);
    const carbsOnBoard = (0, shared_1.getCarbsOnBoard)(currentTimestamp, carbEntries);
    const currentCarbsToInsulin = (0, shared_1.calculateCurrentCarbsToInsulinRatio)(carbsOnBoard, insulinOnBoard);
    const thereIsTooMuchInsulin = (0, utils_1.isThereTooMuchInsulin)(requiredCarbsToInsulin, currentCarbsToInsulin);
    const thereIsTooLittleInsulin = (0, utils_1.isThereTooLittleInsulin)(requiredCarbsToInsulin, currentCarbsToInsulin);
    /**
     * 1. CRITICAL_OUTDATED
     * If we have no data inside analysis range, or we've missed some data and
     * predicted state is bad, return critical outdated immediately
     */
    if ((0, situations_1.detectCriticalOutdated)(latestEntry, insulinOnBoard, currentTimestamp, predictedSituation)) {
        return 'CRITICAL_OUTDATED';
    }
    /**
     * 2. BAD_LOW and BAD_HIGH
     * Most critical and simple checks, must be before low and high
     */
    if ((0, situations_1.detectBadLow)(latestEntry)) {
        return 'BAD_LOW';
    }
    if ((0, situations_1.detectBadHigh)(activeProfile, latestEntry)) {
        return 'BAD_HIGH';
    }
    /**
     * 3. OUTDATED
     * This is after the critical checks, so it will never override those. This also
     * only alarms after timeSinceBgMinutes so there is a bigger delay.
     */
    if ((0, situations_1.detectOutdated)(activeProfile, latestEntry, currentTimestamp)) {
        return 'OUTDATED';
    }
    /**
     * 4. COMPRESSION_LOW
     * Must be before LOW and FALLING
     */
    if ((0, situations_1.detectCompressionLow)(activeProfile, analyserEntries, insulinOnBoard, currentTimestamp)) {
        return 'COMPRESSION_LOW';
    }
    /**
     * 5. LOW and HIGH
     * Check if we're low or high.
     */
    if ((0, situations_1.detectLow)(activeProfile, latestEntry, alarms, carbEntries, thereIsTooMuchInsulin, currentTimestamp)) {
        return 'LOW';
    }
    if ((0, situations_1.detectHigh)(activeProfile, latestEntry, alarms, insulinOnBoard, thereIsTooLittleInsulin, currentTimestamp)) {
        return 'HIGH';
    }
    /**
     * 5. FALLING and RISING
     * Check if we're going low or high soon.
     */
    if ((0, situations_1.detectFalling)(activeProfile, latestEntry, carbEntries, currentTimestamp, thereIsTooMuchInsulin, predictedSituation)) {
        return 'FALLING';
    }
    if ((0, situations_1.detectRising)(activeProfile, latestEntry, insulinOnBoard, thereIsTooLittleInsulin, predictedSituation)) {
        return 'RISING';
    }
    /**
     * 6. PERSISTENT_HIGH
     * Alarms values that are only relative high, but don't seem to be going lower
     */
    if ((0, situations_1.detectPersistentHigh)(activeProfile, latestEntry, analyserEntries, insulinOnBoard, thereIsTooLittleInsulin, currentTimestamp)) {
        return 'PERSISTENT_HIGH';
    }
    return 'NO_SITUATION';
};
exports.detectSituation = detectSituation;
//# sourceMappingURL=analyser.js.map