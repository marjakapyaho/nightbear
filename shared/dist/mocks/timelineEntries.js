"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mockTimelineEntries = exports.mockMeterEntries = exports.mockCarbEntries = exports.mockInsulinEntries = exports.mockBloodGlucoseEntries = void 0;
const dates_1 = require("./dates");
const utils_1 = require("../utils");
const profiles_1 = require("./profiles");
const alarms_1 = require("./alarms");
exports.mockBloodGlucoseEntries = [
    { bloodGlucose: 4.6, timestamp: (0, utils_1.getTimeMinusMinutes)(dates_1.mockNowSlot, 40) },
    { bloodGlucose: 4.3, timestamp: (0, utils_1.getTimeMinusMinutes)(dates_1.mockNowSlot, 35) },
    { bloodGlucose: 3.8, timestamp: (0, utils_1.getTimeMinusMinutes)(dates_1.mockNowSlot, 30) },
    { bloodGlucose: 4.3, timestamp: (0, utils_1.getTimeMinusMinutes)(dates_1.mockNowSlot, 25) },
    { bloodGlucose: 4.7, timestamp: (0, utils_1.getTimeMinusMinutes)(dates_1.mockNowSlot, 20) },
    { bloodGlucose: 4.8, timestamp: (0, utils_1.getTimeMinusMinutes)(dates_1.mockNowSlot, 15) },
    { bloodGlucose: 5.9, timestamp: (0, utils_1.getTimeMinusMinutes)(dates_1.mockNowSlot, 10) },
    { bloodGlucose: 5.3, timestamp: (0, utils_1.getTimeMinusMinutes)(dates_1.mockNowSlot, 5) },
    { bloodGlucose: 6, timestamp: dates_1.mockNowSlot },
];
exports.mockInsulinEntries = [
    {
        timestamp: dates_1.mockNowSlot,
        amount: 7,
        type: 'FAST',
    },
];
exports.mockCarbEntries = [
    {
        timestamp: (0, utils_1.getTimeMinusMinutes)(dates_1.mockNowSlot, 15),
        amount: 40,
        durationFactor: 1,
    },
];
exports.mockMeterEntries = [
    {
        timestamp: (0, utils_1.getTimeMinusMinutes)(dates_1.mockNowSlot, 25),
        bloodGlucose: 6.5,
    },
];
exports.mockTimelineEntries = {
    bloodGlucoseEntries: exports.mockBloodGlucoseEntries,
    insulinEntries: exports.mockInsulinEntries,
    carbEntries: exports.mockCarbEntries,
    meterEntries: exports.mockMeterEntries,
    profileActivations: profiles_1.mockProfileActivations,
    alarms: alarms_1.mockAlarms,
};
//# sourceMappingURL=timelineEntries.js.map