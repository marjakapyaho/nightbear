"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DexcomG6ShareEntry = void 0;
const zod_1 = require("zod");
/* eslint-disable @typescript-eslint/no-redeclare */
exports.DexcomG6ShareEntry = zod_1.z.object({
    id: zod_1.z.string(),
    timestamp: zod_1.z.string(),
    bloodGlucose: zod_1.z.number(),
    signalStrength: zod_1.z.number(),
    noiseLevel: zod_1.z.number(),
});
//# sourceMappingURL=dexcom.js.map