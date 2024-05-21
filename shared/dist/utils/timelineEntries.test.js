"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const test_1 = require("./test");
const mocks_1 = require("../mocks");
const time_1 = require("./time");
const calculations_1 = require("./calculations");
const timelineEntries_1 = require("./timelineEntries");
const vitest_1 = require("vitest");
const lodash_1 = require("lodash");
const mocks_2 = require("../mocks");
(0, vitest_1.describe)('../calculations', () => {
    (0, vitest_1.it)('getMergedBgEntries', () => {
        const sensorEntries = (0, test_1.generateSensorEntries)({
            currentTimestamp: mocks_1.mockNow,
            bloodGlucoseHistory: [4.6, 4.3, 3.8, 4.0, 4.4, 4.8, 5.2, 5.3, 5.5],
        });
        // Preparing for Libre entries
        const extraSensorEntries = [
            {
                timestamp: (0, time_1.getTimeMinusTime)(mocks_1.mockNow, 17 * calculations_1.MIN_IN_MS),
                bloodGlucose: 5.0,
                type: 'LIBRE_3_LINK',
            },
            {
                timestamp: (0, time_1.getTimeMinusTime)(mocks_1.mockNow, 22 * calculations_1.MIN_IN_MS),
                bloodGlucose: 4.5,
                type: 'LIBRE_3_LINK',
            },
        ];
        const allEntries = (0, lodash_1.sortBy)([...sensorEntries, ...extraSensorEntries], 'timestamp');
        const meterEntries = [
            {
                timestamp: mocks_1.mockNow,
                bloodGlucose: 6.5,
            },
            {
                timestamp: (0, time_1.getTimeMinusTime)(mocks_1.mockNow, 10 * calculations_1.MIN_IN_MS),
                bloodGlucose: 6.5,
            },
        ];
        (0, vitest_1.expect)((0, timelineEntries_1.getMergedBgEntries)(allEntries, meterEntries)).toEqual([
            { bloodGlucose: 4.6, timestamp: '2024-04-27T13:35:00.000Z' },
            { bloodGlucose: 4.3, timestamp: '2024-04-27T13:40:00.000Z' },
            { bloodGlucose: 3.8, timestamp: '2024-04-27T13:45:00.000Z' },
            { bloodGlucose: 4.3, timestamp: '2024-04-27T13:50:00.000Z' }, // Average of 4.0 and 4.5
            { bloodGlucose: 4.7, timestamp: '2024-04-27T13:55:00.000Z' }, // Average of 4.4 and 5.0
            { bloodGlucose: 4.8, timestamp: '2024-04-27T14:00:00.000Z' },
            { bloodGlucose: 5.9, timestamp: '2024-04-27T14:05:00.000Z' }, // Average of 5.2 and 6.5 (rounded)
            { bloodGlucose: 5.3, timestamp: '2024-04-27T14:10:00.000Z' },
            { bloodGlucose: 6, timestamp: '2024-04-27T14:15:00.000Z' }, // Average of 5.5 and 6.5
        ]);
        (0, vitest_1.expect)((0, timelineEntries_1.getMergedBgEntries)([], [])).toEqual([]);
    });
    (0, vitest_1.it)('mapTimelineEntriesToGraphPoints', () => {
        (0, vitest_1.expect)((0, timelineEntries_1.mapTimelineEntriesToGraphPoints)(mocks_2.mockTimelineEntries, calculations_1.HOUR_IN_MS, mocks_1.mockNow)).toEqual([
            {
                isoTimestamp: (0, time_1.getTimeMinusMinutes)(mocks_1.mockNowSlot, 55),
                timestamp: (0, time_1.getTimeInMillis)((0, time_1.getTimeMinusMinutes)(mocks_1.mockNowSlot, 55)),
                val: null,
                color: 'white',
            },
            {
                isoTimestamp: (0, time_1.getTimeMinusMinutes)(mocks_1.mockNowSlot, 50),
                timestamp: (0, time_1.getTimeInMillis)((0, time_1.getTimeMinusMinutes)(mocks_1.mockNowSlot, 50)),
                val: null,
                color: 'white',
            },
            {
                isoTimestamp: (0, time_1.getTimeMinusMinutes)(mocks_1.mockNowSlot, 45),
                timestamp: (0, time_1.getTimeInMillis)((0, time_1.getTimeMinusMinutes)(mocks_1.mockNowSlot, 45)),
                val: null,
                color: 'white',
            },
            {
                isoTimestamp: (0, time_1.getTimeMinusMinutes)(mocks_1.mockNowSlot, 40),
                timestamp: (0, time_1.getTimeInMillis)((0, time_1.getTimeMinusMinutes)(mocks_1.mockNowSlot, 40)),
                val: 4.6,
                color: '#54c87e',
            },
            {
                isoTimestamp: (0, time_1.getTimeMinusMinutes)(mocks_1.mockNowSlot, 35),
                timestamp: (0, time_1.getTimeInMillis)((0, time_1.getTimeMinusMinutes)(mocks_1.mockNowSlot, 35)),
                val: 4.3,
                color: '#54c87e',
            },
            {
                isoTimestamp: (0, time_1.getTimeMinusMinutes)(mocks_1.mockNowSlot, 30),
                timestamp: (0, time_1.getTimeInMillis)((0, time_1.getTimeMinusMinutes)(mocks_1.mockNowSlot, 30)),
                val: 3.8,
                color: '#ee5a36',
            },
            {
                isoTimestamp: (0, time_1.getTimeMinusMinutes)(mocks_1.mockNowSlot, 25),
                timestamp: (0, time_1.getTimeInMillis)((0, time_1.getTimeMinusMinutes)(mocks_1.mockNowSlot, 25)),
                val: 4.3,
                color: '#54c87e',
                meterEntry: {
                    timestamp: (0, time_1.getTimeMinusMinutes)(mocks_1.mockNowSlot, 25),
                    bloodGlucose: 6.5,
                },
            },
            {
                isoTimestamp: (0, time_1.getTimeMinusMinutes)(mocks_1.mockNowSlot, 20),
                timestamp: (0, time_1.getTimeInMillis)((0, time_1.getTimeMinusMinutes)(mocks_1.mockNowSlot, 20)),
                val: 4.7,
                color: '#54c87e',
            },
            {
                isoTimestamp: (0, time_1.getTimeMinusMinutes)(mocks_1.mockNowSlot, 15),
                timestamp: (0, time_1.getTimeInMillis)((0, time_1.getTimeMinusMinutes)(mocks_1.mockNowSlot, 15)),
                val: 4.8,
                color: '#54c87e',
                carbEntry: {
                    timestamp: (0, time_1.getTimeMinusMinutes)(mocks_1.mockNowSlot, 15),
                    amount: 40,
                    durationFactor: 1,
                },
            },
            {
                isoTimestamp: (0, time_1.getTimeMinusMinutes)(mocks_1.mockNowSlot, 10),
                timestamp: (0, time_1.getTimeInMillis)((0, time_1.getTimeMinusMinutes)(mocks_1.mockNowSlot, 10)),
                val: 5.9,
                color: '#54c87e',
            },
            {
                isoTimestamp: (0, time_1.getTimeMinusMinutes)(mocks_1.mockNowSlot, 5),
                timestamp: (0, time_1.getTimeInMillis)((0, time_1.getTimeMinusMinutes)(mocks_1.mockNowSlot, 5)),
                val: 5.3,
                color: '#54c87e',
            },
            {
                isoTimestamp: mocks_1.mockNowSlot,
                timestamp: (0, time_1.getTimeInMillis)(mocks_1.mockNowSlot),
                val: 6,
                color: '#54c87e',
                insulinEntry: { timestamp: mocks_1.mockNowSlot, amount: 7, type: 'FAST' },
            },
        ]);
    });
});
//# sourceMappingURL=timelineEntries.test.js.map