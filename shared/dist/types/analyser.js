"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Situation = exports.AnalyserEntry = void 0;
const utils_1 = require("../utils");
const zod_1 = require("zod");
/* eslint-disable @typescript-eslint/no-redeclare */
exports.AnalyserEntry = zod_1.z.object({
    timestamp: zod_1.z.string(),
    bloodGlucose: zod_1.z.number(),
    slope: (0, utils_1.nullableOptional)(zod_1.z.number()),
    rawSlope: (0, utils_1.nullableOptional)(zod_1.z.number()),
});
exports.Situation = zod_1.z.enum([
    'CRITICAL_OUTDATED',
    'BAD_LOW',
    'BAD_HIGH',
    'OUTDATED',
    'COMPRESSION_LOW',
    'LOW',
    'HIGH',
    'FALLING',
    'RISING',
    'PERSISTENT_HIGH',
    'MISSING_DAY_INSULIN',
]);
//# sourceMappingURL=analyser.js.map