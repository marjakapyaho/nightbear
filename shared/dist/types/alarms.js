"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Alarm = exports.AlarmState = void 0;
const utils_1 = require("../utils");
const zod_1 = require("zod");
const analyser_1 = require("./analyser");
/* eslint-disable @typescript-eslint/no-redeclare */
exports.AlarmState = zod_1.z.object({
    id: zod_1.z.string(),
    timestamp: zod_1.z.string(),
    alarmLevel: zod_1.z.number(),
    validAfter: zod_1.z.string(),
    ackedBy: (0, utils_1.nullableOptional)(zod_1.z.string()),
    notificationTarget: (0, utils_1.nullableOptional)(zod_1.z.string()),
    notificationReceipt: (0, utils_1.nullableOptional)(zod_1.z.string()),
    notificationProcessedAt: (0, utils_1.nullableOptional)(zod_1.z.string()),
});
exports.Alarm = zod_1.z.object({
    id: zod_1.z.string(),
    situation: analyser_1.Situation,
    isActive: zod_1.z.boolean(),
    deactivatedAt: (0, utils_1.nullableOptional)(zod_1.z.string()),
    alarmStates: zod_1.z.array(exports.AlarmState),
});
//# sourceMappingURL=alarms.js.map