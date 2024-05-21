"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sensorEntries2 = exports.sensorEntries1 = void 0;
const calculations_1 = require("./calculations");
const time_1 = require("./time");
const vitest_1 = require("vitest");
const mocks_1 = require("../mocks");
const mocks_2 = require("../mocks");
const currentTimestamp = 1508672249758;
exports.sensorEntries1 = [
    {
        timestamp: (0, time_1.getTimeMinusTime)(currentTimestamp, 35),
        bloodGlucose: 6,
        type: 'DEXCOM_G6_SHARE',
    },
    {
        timestamp: (0, time_1.getTimeMinusTime)(currentTimestamp, 30),
        bloodGlucose: 6,
        type: 'DEXCOM_G6_SHARE',
    },
    {
        timestamp: (0, time_1.getTimeMinusTime)(currentTimestamp, 25),
        bloodGlucose: 6,
        type: 'DEXCOM_G6_SHARE',
    },
    {
        timestamp: (0, time_1.getTimeMinusTime)(currentTimestamp, 20),
        bloodGlucose: 8,
        type: 'DEXCOM_G6_SHARE',
    },
    {
        timestamp: (0, time_1.getTimeMinusTime)(currentTimestamp, 15),
        bloodGlucose: 7,
        type: 'DEXCOM_G6_SHARE',
    },
    {
        timestamp: (0, time_1.getTimeMinusTime)(currentTimestamp, 10),
        bloodGlucose: 7,
        type: 'DEXCOM_G6_SHARE',
    },
    {
        timestamp: (0, time_1.getTimeMinusTime)(currentTimestamp, 5),
        bloodGlucose: 8,
        type: 'DEXCOM_G6_SHARE',
    },
];
exports.sensorEntries2 = [
    {
        timestamp: (0, time_1.getTimeMinusTime)(currentTimestamp, 35),
        bloodGlucose: 14,
        type: 'DEXCOM_G6_SHARE',
    },
    {
        timestamp: (0, time_1.getTimeMinusTime)(currentTimestamp, 30),
        bloodGlucose: 11,
        type: 'DEXCOM_G6_SHARE',
    },
    {
        timestamp: (0, time_1.getTimeMinusTime)(currentTimestamp, 25),
        bloodGlucose: 11.5,
        type: 'DEXCOM_G6_SHARE',
    },
    {
        timestamp: (0, time_1.getTimeMinusTime)(currentTimestamp, 20),
        bloodGlucose: 12.5,
        type: 'DEXCOM_G6_SHARE',
    },
    {
        timestamp: (0, time_1.getTimeMinusTime)(currentTimestamp, 15),
        bloodGlucose: 13.1,
        type: 'DEXCOM_G6_SHARE',
    },
    {
        timestamp: (0, time_1.getTimeMinusTime)(currentTimestamp, 10),
        bloodGlucose: 12,
        type: 'DEXCOM_G6_SHARE',
    },
    {
        timestamp: (0, time_1.getTimeMinusTime)(currentTimestamp, 5),
        bloodGlucose: 10,
        type: 'DEXCOM_G6_SHARE',
    },
];
(0, vitest_1.describe)('@nightbear/shared/calculations', () => {
    (0, vitest_1.it)('changeBloodGlucoseUnitToMmoll', () => {
        (0, vitest_1.expect)((0, calculations_1.changeBloodGlucoseUnitToMmoll)(160)).toEqual(8.9);
        (0, vitest_1.expect)((0, calculations_1.changeBloodGlucoseUnitToMmoll)(60)).toEqual(3.3);
        (0, vitest_1.expect)((0, calculations_1.changeBloodGlucoseUnitToMmoll)(450)).toEqual(25.0);
    });
    (0, vitest_1.it)('changeBloodGlucoseUnitToMgdl', () => {
        (0, vitest_1.expect)((0, calculations_1.changeBloodGlucoseUnitToMgdl)(2.8)).toEqual(50);
        (0, vitest_1.expect)((0, calculations_1.changeBloodGlucoseUnitToMgdl)(11.0)).toEqual(198);
        (0, vitest_1.expect)((0, calculations_1.changeBloodGlucoseUnitToMgdl)(20.8)).toEqual(374);
    });
    (0, vitest_1.it)('calculateRaw', () => {
        const testObj1 = {
            unfiltered: 204960,
            slope: 681.4329083181542,
            intercept: 30000,
            scale: 0.9977203313342593,
        };
        (0, vitest_1.expect)((0, calculations_1.calculateRaw)(testObj1.unfiltered, testObj1.slope, testObj1.intercept, testObj1.scale)).toEqual(14.2);
        const testObj2 = {
            unfiltered: 148224,
            slope: 645.2005532503458,
            intercept: 30000,
            scale: 1,
        };
        (0, vitest_1.expect)((0, calculations_1.calculateRaw)(testObj2.unfiltered, testObj2.slope, testObj2.intercept, testObj2.scale)).toEqual(10.2);
        const testObj3 = {
            unfiltered: 213408,
            slope: 0,
            intercept: 30000,
            scale: 0.9977203313342593,
        };
        (0, vitest_1.expect)((0, calculations_1.calculateRaw)(testObj3.unfiltered, testObj3.slope, testObj3.intercept, testObj3.scale)).toBeNull();
    });
    (0, vitest_1.it)('isDexcomEntryValid', () => {
        (0, vitest_1.expect)((0, calculations_1.isDexcomEntryValid)(4, 10)).toEqual(false); // Too much noise, too low bg
        (0, vitest_1.expect)((0, calculations_1.isDexcomEntryValid)(2, 10)).toEqual(false); // Too low bg
        (0, vitest_1.expect)((0, calculations_1.isDexcomEntryValid)(5, 100)).toEqual(false); // Too much noise
        (0, vitest_1.expect)((0, calculations_1.isDexcomEntryValid)(3, 80)).toEqual(true);
    });
    (0, vitest_1.it)('roundTo2Decimals', () => {
        (0, vitest_1.expect)((0, calculations_1.roundTo2Decimals)(34.0879)).toEqual(34.09);
        (0, vitest_1.expect)((0, calculations_1.roundTo2Decimals)(5.9999)).toEqual(6.0);
        (0, vitest_1.expect)((0, calculations_1.roundTo2Decimals)(2.457)).toEqual(2.46);
    });
    (0, vitest_1.it)('calculateHba1c', () => {
        (0, vitest_1.expect)((0, calculations_1.calculateHba1c)(exports.sensorEntries1)).toEqual(5.3278247884519665);
        (0, vitest_1.expect)((0, calculations_1.calculateHba1c)(exports.sensorEntries2)).toEqual(8.56326530612245);
    });
    (0, vitest_1.it)('calculateTimeInRange', () => {
        (0, vitest_1.expect)((0, calculations_1.calculateTimeInRange)(exports.sensorEntries1)).toEqual(100);
        (0, vitest_1.expect)((0, calculations_1.calculateTimeInRange)(exports.sensorEntries2)).toEqual(14);
    });
    (0, vitest_1.it)('calculateTimeLow', () => {
        (0, vitest_1.expect)((0, calculations_1.calculateTimeLow)(exports.sensorEntries1)).toEqual(0);
        (0, vitest_1.expect)((0, calculations_1.calculateTimeLow)(exports.sensorEntries2)).toEqual(0);
    });
    (0, vitest_1.it)('calculateTimeHigh', () => {
        (0, vitest_1.expect)((0, calculations_1.calculateTimeHigh)(exports.sensorEntries1)).toEqual(0);
        (0, vitest_1.expect)((0, calculations_1.calculateTimeHigh)(exports.sensorEntries2)).toEqual(86);
    });
    (0, vitest_1.it)('countSituations', () => {
        (0, vitest_1.expect)((0, calculations_1.countSituations)(exports.sensorEntries1, 7.5, true)).toEqual(2);
        (0, vitest_1.expect)((0, calculations_1.countSituations)(exports.sensorEntries2, 13, false)).toEqual(2);
    });
    (0, vitest_1.it)('getBgAverage', () => {
        (0, vitest_1.expect)((0, calculations_1.getBgAverage)(exports.sensorEntries1)).toEqual('6.9');
        (0, vitest_1.expect)((0, calculations_1.getBgAverage)(exports.sensorEntries2)).toEqual('12.0');
    });
    // TODO: check these
    (0, vitest_1.it)('calculateDailyAmounts', () => {
        (0, vitest_1.expect)((0, calculations_1.calculateDailyAmounts)(mocks_2.mockCarbEntries, 2, (0, time_1.getTimeInMillis)(mocks_1.mockNow))).toEqual([
            { timestamp: (0, time_1.getDateWithoutTimeMs)((0, time_1.getTimeInMillis)(mocks_1.mockNow) - 24 * calculations_1.HOUR_IN_MS), total: null },
            { timestamp: (0, time_1.getDateWithoutTime)(mocks_1.mockNow), total: 40 },
        ]);
    });
    // TODO: check these
    (0, vitest_1.it)('calculateDailyAverageBgs', () => {
        (0, vitest_1.expect)((0, calculations_1.calculateDailyAverageBgs)(mocks_2.mockBloodGlucoseEntries, 2, (0, time_1.getTimeInMillis)(mocks_1.mockNow))).toEqual([
            {
                timestamp: (0, time_1.getDateWithoutTimeMs)((0, time_1.getTimeInMillis)(mocks_1.mockNow) - 24 * calculations_1.HOUR_IN_MS),
                average: null,
            },
            { timestamp: (0, time_1.getDateWithoutTime)(mocks_1.mockNow), average: 4.855555555555555 },
        ]);
    });
    (0, vitest_1.it)('getPercentOfInsulinRemaining', () => {
        (0, vitest_1.expect)((0, calculations_1.getPercentOfInsulinRemaining)(mocks_1.mockNow, mocks_1.mockNow)).toEqual(1);
        (0, vitest_1.expect)((0, calculations_1.getPercentOfInsulinRemaining)((0, time_1.getTimeMinusMinutes)(mocks_1.mockNow, 10), mocks_1.mockNow)).toEqual(0.984412149586579);
        (0, vitest_1.expect)((0, calculations_1.getPercentOfInsulinRemaining)((0, time_1.getTimeMinusMinutes)(mocks_1.mockNow, 30), mocks_1.mockNow)).toEqual(0.8885478448395222);
        (0, vitest_1.expect)((0, calculations_1.getPercentOfInsulinRemaining)((0, time_1.getTimeMinusMinutes)(mocks_1.mockNow, 60), mocks_1.mockNow)).toEqual(0.6807104906555019);
        (0, vitest_1.expect)((0, calculations_1.getPercentOfInsulinRemaining)((0, time_1.getTimeMinusMinutes)(mocks_1.mockNow, 120), mocks_1.mockNow)).toEqual(0.3143821335622309);
        (0, vitest_1.expect)((0, calculations_1.getPercentOfInsulinRemaining)((0, time_1.getTimeMinusMinutes)(mocks_1.mockNow, 150), mocks_1.mockNow)).toEqual(0.19543068101103533);
        (0, vitest_1.expect)((0, calculations_1.getPercentOfInsulinRemaining)((0, time_1.getTimeMinusMinutes)(mocks_1.mockNow, 180), mocks_1.mockNow)).toEqual(0.11466084114529174);
        (0, vitest_1.expect)((0, calculations_1.getPercentOfInsulinRemaining)((0, time_1.getTimeMinusMinutes)(mocks_1.mockNow, 240), mocks_1.mockNow)).toEqual(0.03158858427303446);
        (0, vitest_1.expect)((0, calculations_1.getPercentOfInsulinRemaining)((0, time_1.getTimeMinusMinutes)(mocks_1.mockNow, 360), mocks_1.mockNow)).toEqual(0);
        (0, vitest_1.expect)((0, calculations_1.getPercentOfInsulinRemaining)((0, time_1.getTimeMinusMinutes)(mocks_1.mockNow, 400), mocks_1.mockNow)).toEqual(0);
        (0, vitest_1.expect)((0, calculations_1.getPercentOfInsulinRemaining)((0, time_1.getTimeMinusMinutes)(mocks_1.mockNow, 800), mocks_1.mockNow)).toEqual(0);
    });
    (0, vitest_1.it)('getInsulinOnBoard', () => {
        (0, vitest_1.expect)((0, calculations_1.getInsulinOnBoard)(mocks_1.mockNow, [
            {
                timestamp: mocks_1.mockNow,
                amount: 7,
                type: 'FAST',
            },
        ])).toEqual(7);
        (0, vitest_1.expect)((0, calculations_1.getInsulinOnBoard)(mocks_1.mockNow, [
            {
                timestamp: (0, time_1.getTimeMinusMinutes)(mocks_1.mockNow, 60),
                amount: 7,
                type: 'FAST',
            },
        ])).toEqual(4.764973434588514);
        (0, vitest_1.expect)((0, calculations_1.getInsulinOnBoard)(mocks_1.mockNow, [
            {
                timestamp: (0, time_1.getTimeMinusMinutes)(mocks_1.mockNow, 120),
                amount: 4,
                type: 'FAST',
            },
        ])).toEqual(1.2575285342489235);
        (0, vitest_1.expect)((0, calculations_1.getInsulinOnBoard)(mocks_1.mockNow, [
            {
                timestamp: (0, time_1.getTimeMinusMinutes)(mocks_1.mockNow, 120),
                amount: 4,
                type: 'FAST',
            },
            {
                timestamp: (0, time_1.getTimeMinusMinutes)(mocks_1.mockNow, 60),
                amount: 2,
                type: 'FAST',
            },
        ])).toEqual(2.6189495155599274);
        (0, vitest_1.expect)((0, calculations_1.getInsulinOnBoard)(mocks_1.mockNow, [
            {
                timestamp: (0, time_1.getTimeMinusMinutes)(mocks_1.mockNow, 120),
                amount: 4,
                type: 'FAST',
            },
            {
                timestamp: (0, time_1.getTimeMinusMinutes)(mocks_1.mockNow, 60),
                amount: 2,
                type: 'FAST',
            },
        ])).toEqual(2.6189495155599274);
        (0, vitest_1.expect)((0, calculations_1.getInsulinOnBoard)(mocks_1.mockNow, [
            {
                timestamp: (0, time_1.getTimeMinusMinutes)(mocks_1.mockNow, 180),
                amount: 8,
                type: 'FAST',
            },
            {
                timestamp: (0, time_1.getTimeMinusMinutes)(mocks_1.mockNow, 120),
                amount: 5,
                type: 'FAST',
            },
            {
                timestamp: (0, time_1.getTimeMinusMinutes)(mocks_1.mockNow, 60),
                amount: 3,
                type: 'FAST',
            },
        ])).toEqual(4.531328868939994);
        (0, vitest_1.expect)((0, calculations_1.getInsulinOnBoard)(mocks_1.mockNow, [
            {
                timestamp: (0, time_1.getTimeMinusMinutes)(mocks_1.mockNow, 130),
                amount: 23,
                type: 'LONG', // Not counted
            },
            {
                timestamp: (0, time_1.getTimeMinusMinutes)(mocks_1.mockNow, 120),
                amount: 5,
                type: 'FAST',
            },
            {
                timestamp: (0, time_1.getTimeMinusMinutes)(mocks_1.mockNow, 60),
                amount: 3,
                type: 'FAST',
            },
        ])).toEqual(3.61404213977766);
        (0, vitest_1.expect)((0, calculations_1.getInsulinOnBoard)(mocks_1.mockNow, [
            {
                timestamp: (0, time_1.getTimeMinusMinutes)(mocks_1.mockNow, 400),
                amount: 9,
                type: 'FAST',
            },
            {
                timestamp: (0, time_1.getTimeMinusMinutes)(mocks_1.mockNow, 360),
                amount: 9,
                type: 'FAST',
            },
        ])).toEqual(0);
    });
    (0, vitest_1.it)('getPercentOfCarbsRemaining', () => {
        // Different duration factors at 0 hours
        (0, vitest_1.expect)((0, calculations_1.getPercentOfCarbsRemaining)(mocks_1.mockNow, mocks_1.mockNow, 1)).toEqual(1);
        (0, vitest_1.expect)((0, calculations_1.getPercentOfCarbsRemaining)(mocks_1.mockNow, mocks_1.mockNow, 2)).toEqual(1);
        (0, vitest_1.expect)((0, calculations_1.getPercentOfCarbsRemaining)(mocks_1.mockNow, mocks_1.mockNow, 3)).toEqual(1);
        (0, vitest_1.expect)((0, calculations_1.getPercentOfCarbsRemaining)(mocks_1.mockNow, mocks_1.mockNow, 4)).toEqual(1);
        // Different duration factors at 1 hour
        (0, vitest_1.expect)((0, calculations_1.getPercentOfCarbsRemaining)((0, time_1.getTimeMinusMinutes)(mocks_1.mockNow, 60), mocks_1.mockNow, 1)).toEqual(0);
        (0, vitest_1.expect)((0, calculations_1.getPercentOfCarbsRemaining)((0, time_1.getTimeMinusMinutes)(mocks_1.mockNow, 60), mocks_1.mockNow, 2)).toEqual(0.3627927518708771);
        (0, vitest_1.expect)((0, calculations_1.getPercentOfCarbsRemaining)((0, time_1.getTimeMinusMinutes)(mocks_1.mockNow, 60), mocks_1.mockNow, 3)).toEqual(0.6208273667349686);
        (0, vitest_1.expect)((0, calculations_1.getPercentOfCarbsRemaining)((0, time_1.getTimeMinusMinutes)(mocks_1.mockNow, 60), mocks_1.mockNow, 4)).toEqual(0.75383496994724);
        // Different duration factors at 2 hours
        (0, vitest_1.expect)((0, calculations_1.getPercentOfCarbsRemaining)((0, time_1.getTimeMinusMinutes)(mocks_1.mockNow, 120), mocks_1.mockNow, 1)).toEqual(0);
        (0, vitest_1.expect)((0, calculations_1.getPercentOfCarbsRemaining)((0, time_1.getTimeMinusMinutes)(mocks_1.mockNow, 120), mocks_1.mockNow, 2)).toEqual(0);
        (0, vitest_1.expect)((0, calculations_1.getPercentOfCarbsRemaining)((0, time_1.getTimeMinusMinutes)(mocks_1.mockNow, 120), mocks_1.mockNow, 3)).toEqual(0.1608677119365367);
        (0, vitest_1.expect)((0, calculations_1.getPercentOfCarbsRemaining)((0, time_1.getTimeMinusMinutes)(mocks_1.mockNow, 120), mocks_1.mockNow, 4)).toEqual(0.3627927518708771);
        // Different duration factors at 3 hours
        (0, vitest_1.expect)((0, calculations_1.getPercentOfCarbsRemaining)((0, time_1.getTimeMinusMinutes)(mocks_1.mockNow, 180), mocks_1.mockNow, 1)).toEqual(0);
        (0, vitest_1.expect)((0, calculations_1.getPercentOfCarbsRemaining)((0, time_1.getTimeMinusMinutes)(mocks_1.mockNow, 180), mocks_1.mockNow, 2)).toEqual(0);
        (0, vitest_1.expect)((0, calculations_1.getPercentOfCarbsRemaining)((0, time_1.getTimeMinusMinutes)(mocks_1.mockNow, 180), mocks_1.mockNow, 3)).toEqual(0);
        (0, vitest_1.expect)((0, calculations_1.getPercentOfCarbsRemaining)((0, time_1.getTimeMinusMinutes)(mocks_1.mockNow, 180), mocks_1.mockNow, 4)).toEqual(0.08942351916577251);
        // Different duration factors at 4 hours
        (0, vitest_1.expect)((0, calculations_1.getPercentOfCarbsRemaining)((0, time_1.getTimeMinusMinutes)(mocks_1.mockNow, 240), mocks_1.mockNow, 1)).toEqual(0);
        (0, vitest_1.expect)((0, calculations_1.getPercentOfCarbsRemaining)((0, time_1.getTimeMinusMinutes)(mocks_1.mockNow, 240), mocks_1.mockNow, 2)).toEqual(0);
        (0, vitest_1.expect)((0, calculations_1.getPercentOfCarbsRemaining)((0, time_1.getTimeMinusMinutes)(mocks_1.mockNow, 240), mocks_1.mockNow, 3)).toEqual(0);
        (0, vitest_1.expect)((0, calculations_1.getPercentOfCarbsRemaining)((0, time_1.getTimeMinusMinutes)(mocks_1.mockNow, 240), mocks_1.mockNow, 4)).toEqual(0);
    });
    (0, vitest_1.it)('getCarbsOnBoard', () => {
        (0, vitest_1.expect)((0, calculations_1.getCarbsOnBoard)(mocks_1.mockNow, [
            {
                timestamp: mocks_1.mockNow,
                amount: 60,
                durationFactor: 1,
            },
        ])).toEqual(60);
        (0, vitest_1.expect)((0, calculations_1.getCarbsOnBoard)(mocks_1.mockNow, [
            {
                timestamp: (0, time_1.getTimeMinusMinutes)(mocks_1.mockNow, 60),
                amount: 60,
                durationFactor: 1,
            },
        ])).toEqual(0);
        (0, vitest_1.expect)((0, calculations_1.getCarbsOnBoard)(mocks_1.mockNow, [
            {
                timestamp: (0, time_1.getTimeMinusMinutes)(mocks_1.mockNow, 120),
                amount: 60,
                durationFactor: 4,
            },
            {
                timestamp: (0, time_1.getTimeMinusMinutes)(mocks_1.mockNow, 60),
                amount: 30,
                durationFactor: 2,
            },
        ])).toEqual(32.65134766837894);
    });
    (0, vitest_1.it)('calculateCurrentCarbsToInsulinRatio', () => {
        (0, vitest_1.expect)((0, calculations_1.calculateCurrentCarbsToInsulinRatio)(50, 5)).toEqual(10);
        (0, vitest_1.expect)((0, calculations_1.calculateCurrentCarbsToInsulinRatio)(50, 10)).toEqual(5);
        (0, vitest_1.expect)((0, calculations_1.calculateCurrentCarbsToInsulinRatio)(40, 2)).toEqual(20);
        (0, vitest_1.expect)((0, calculations_1.calculateCurrentCarbsToInsulinRatio)(40, 1)).toEqual(40);
        (0, vitest_1.expect)((0, calculations_1.calculateCurrentCarbsToInsulinRatio)(80, 2)).toEqual(40);
    });
    (0, vitest_1.it)('calculateRequiredCarbsToInsulinRatio', () => {
        (0, vitest_1.expect)((0, calculations_1.calculateRequiredCarbsToInsulinRatio)((0, time_1.getTimeMinusHours)(mocks_1.mockNow, 3), [], [])).toEqual(null);
        // Only entries over 2 hours old are considered
        (0, vitest_1.expect)((0, calculations_1.calculateRequiredCarbsToInsulinRatio)(mocks_1.mockNow, [{ timestamp: (0, time_1.getTimeMinusHours)(mocks_1.mockNow, 1), amount: 70, durationFactor: 4 }], [{ timestamp: (0, time_1.getTimeMinusHours)(mocks_1.mockNow, 1), amount: 7, type: 'FAST' }])).toEqual(null);
        (0, vitest_1.expect)((0, calculations_1.calculateRequiredCarbsToInsulinRatio)(mocks_1.mockNow, [], [{ timestamp: (0, time_1.getTimeMinusHours)(mocks_1.mockNow, 3), amount: 5, type: 'FAST' }])).toEqual(0);
        (0, vitest_1.expect)((0, calculations_1.calculateRequiredCarbsToInsulinRatio)(mocks_1.mockNow, [{ timestamp: (0, time_1.getTimeMinusHours)(mocks_1.mockNow, 3), amount: 70, durationFactor: 4 }], [{ timestamp: (0, time_1.getTimeMinusHours)(mocks_1.mockNow, 3), amount: 7, type: 'FAST' }])).toEqual(10);
        (0, vitest_1.expect)((0, calculations_1.calculateRequiredCarbsToInsulinRatio)(mocks_1.mockNow, [
            { timestamp: (0, time_1.getTimeMinusHours)(mocks_1.mockNow, 8), amount: 70, durationFactor: 4 },
            { timestamp: (0, time_1.getTimeMinusHours)(mocks_1.mockNow, 5), amount: 80, durationFactor: 4 },
            { timestamp: (0, time_1.getTimeMinusHours)(mocks_1.mockNow, 3), amount: 40, durationFactor: 1 },
        ], [
            { timestamp: (0, time_1.getTimeMinusHours)(mocks_1.mockNow, 8), amount: 3, type: 'FAST' },
            { timestamp: (0, time_1.getTimeMinusHours)(mocks_1.mockNow, 5), amount: 4, type: 'FAST' },
            { timestamp: (0, time_1.getTimeMinusHours)(mocks_1.mockNow, 3), amount: 1, type: 'FAST' },
        ])).toEqual(23.75);
        (0, vitest_1.expect)((0, calculations_1.calculateRequiredCarbsToInsulinRatio)(mocks_1.mockNow, [
            { timestamp: (0, time_1.getTimeMinusHours)(mocks_1.mockNow, 8), amount: 30, durationFactor: 4 },
            { timestamp: (0, time_1.getTimeMinusHours)(mocks_1.mockNow, 5), amount: 50, durationFactor: 4 },
            { timestamp: (0, time_1.getTimeMinusHours)(mocks_1.mockNow, 3), amount: 40, durationFactor: 1 },
        ], [
            { timestamp: (0, time_1.getTimeMinusHours)(mocks_1.mockNow, 8), amount: 9, type: 'FAST' },
            { timestamp: (0, time_1.getTimeMinusHours)(mocks_1.mockNow, 5), amount: 10, type: 'FAST' },
            { timestamp: (0, time_1.getTimeMinusHours)(mocks_1.mockNow, 3), amount: 6, type: 'FAST' },
        ])).toEqual(4.8);
    });
});
//# sourceMappingURL=calculations.test.js.map