"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProfileActivation = exports.Profile = exports.SituationSettings = exports.AlarmSettings = exports.AnalyserSettings = void 0;
const types_1 = require("../utils/types");
const zod_1 = require("zod");
/* eslint-disable @typescript-eslint/no-redeclare */
exports.AnalyserSettings = zod_1.z.object({
    highLevelRel: zod_1.z.number(),
    highLevelAbs: zod_1.z.number(),
    highLevelBad: zod_1.z.number(),
    lowLevelRel: zod_1.z.number(),
    lowLevelAbs: zod_1.z.number(),
    timeSinceBgMinutes: zod_1.z.number(),
});
exports.AlarmSettings = zod_1.z.object({
    escalationAfterMinutes: zod_1.z.array(zod_1.z.number()),
    snoozeMinutes: zod_1.z.number(),
});
exports.SituationSettings = zod_1.z.object({
    outdated: exports.AlarmSettings,
    criticalOutdated: exports.AlarmSettings,
    falling: exports.AlarmSettings,
    rising: exports.AlarmSettings,
    low: exports.AlarmSettings,
    badLow: exports.AlarmSettings,
    compressionLow: exports.AlarmSettings,
    high: exports.AlarmSettings,
    badHigh: exports.AlarmSettings,
    persistentHigh: exports.AlarmSettings,
    missingDayInsulin: exports.AlarmSettings,
});
exports.Profile = zod_1.z.object({
    id: zod_1.z.string(),
    profileName: (0, types_1.nullableOptional)(zod_1.z.string()),
    isActive: zod_1.z.boolean(),
    alarmsEnabled: zod_1.z.boolean(),
    repeatTimeInLocalTimezone: (0, types_1.nullableOptional)(zod_1.z.string()),
    notificationTargets: zod_1.z.array(zod_1.z.string()),
    analyserSettings: exports.AnalyserSettings,
    situationSettings: exports.SituationSettings,
});
exports.ProfileActivation = zod_1.z.object({
    id: zod_1.z.string(),
    profileTemplateId: zod_1.z.string(),
    profileName: (0, types_1.nullableOptional)(zod_1.z.string()),
    activatedAt: zod_1.z.string(),
    deactivatedAt: (0, types_1.nullableOptional)(zod_1.z.string()),
});
//# sourceMappingURL=profiles.js.map