"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TimestampReturnType = exports.IdReturnType = void 0;
const zod_1 = require("zod");
/* eslint-disable @typescript-eslint/no-redeclare */
exports.IdReturnType = zod_1.z.object({
    id: zod_1.z.string(),
});
exports.TimestampReturnType = zod_1.z.object({
    timestamp: zod_1.z.string(),
});
//# sourceMappingURL=shared.js.map