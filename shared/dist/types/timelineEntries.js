"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TimelineEntries = exports.MeterEntry = exports.CarbEntry = exports.InsulinEntry = exports.SensorEntry = exports.BloodGlucoseEntry = exports.InsulinEntryType = exports.SensorEntryType = void 0;
const zod_1 = require("zod");
const profiles_1 = require("./profiles");
const alarms_1 = require("./alarms");
/* eslint-disable @typescript-eslint/no-redeclare */
exports.SensorEntryType = zod_1.z.enum([
    'DEXCOM_G4_UPLOADER',
    'DEXCOM_G4_UPLOADER_RAW',
    'DEXCOM_G6_UPLOADER',
    'DEXCOM_G6_SHARE',
    'LIBRE_3_LINK',
]);
exports.InsulinEntryType = zod_1.z.enum(['FAST', 'LONG']);
exports.BloodGlucoseEntry = zod_1.z.object({
    timestamp: zod_1.z.string(),
    bloodGlucose: zod_1.z.number(),
});
exports.SensorEntry = zod_1.z.object({
    timestamp: zod_1.z.string(),
    bloodGlucose: zod_1.z.number(),
    type: exports.SensorEntryType,
});
exports.InsulinEntry = zod_1.z.object({
    timestamp: zod_1.z.string(),
    amount: zod_1.z.number(),
    type: exports.InsulinEntryType,
});
exports.CarbEntry = zod_1.z.object({
    timestamp: zod_1.z.string(),
    amount: zod_1.z.number(),
    durationFactor: zod_1.z.number(),
});
exports.MeterEntry = zod_1.z.object({
    timestamp: zod_1.z.string(),
    bloodGlucose: zod_1.z.number(),
});
exports.TimelineEntries = zod_1.z.object({
    bloodGlucoseEntries: zod_1.z.array(exports.BloodGlucoseEntry),
    insulinEntries: zod_1.z.array(exports.InsulinEntry),
    carbEntries: zod_1.z.array(exports.CarbEntry),
    meterEntries: zod_1.z.array(exports.MeterEntry),
    profileActivations: zod_1.z.array(profiles_1.ProfileActivation),
    alarms: zod_1.z.array(alarms_1.Alarm),
});
//# sourceMappingURL=timelineEntries.js.map