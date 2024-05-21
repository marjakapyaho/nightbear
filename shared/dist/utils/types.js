"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.nullableOptional = void 0;
const zod_1 = require("zod");
/**
 * This marks model properties that are optional.
 *
 * In TS, that means they can be omitted.
 *
 * In SQL, that means they're nullable.
 *
 * For the time being, this allows also null on the TS side, but ideally we'd do the translation
 * transparently between the two. But it's a bit complicated, if we want to keep the pg-typed types
 * and our validator types compatible. Maybe one day!
 */
function nullableOptional(schema) {
    return zod_1.z.preprocess(val => (val === null ? undefined : val), schema.optional().nullable());
}
exports.nullableOptional = nullableOptional;
//# sourceMappingURL=types.js.map