"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCarbEntriesByTimestamp = exports.createCarbEntries = exports.deleteCarbEntry = exports.upsertCarbEntry = void 0;
/** Types generated for queries found in "db/carbEntries/carbEntries.sql" */
const runtime_1 = require("@pgtyped/runtime");
const upsertCarbEntryIR = { "usedParamSet": { "timestamp": true, "amount": true, "durationFactor": true }, "params": [{ "name": "timestamp", "required": true, "transform": { "type": "scalar" }, "locs": [{ "a": 81, "b": 91 }] }, { "name": "amount", "required": true, "transform": { "type": "scalar" }, "locs": [{ "a": 96, "b": 103 }] }, { "name": "durationFactor", "required": true, "transform": { "type": "scalar" }, "locs": [{ "a": 108, "b": 123 }] }], "statement": "INSERT INTO carb_entries (\n  timestamp,\n  amount,\n  duration_factor\n)\nVALUES (\n  :timestamp!,\n  :amount!,\n  :durationFactor!\n)\nON CONFLICT (timestamp) DO UPDATE SET\n  amount = EXCLUDED.amount\nRETURNING *" };
/**
 * Query generated from SQL:
 * ```
 * INSERT INTO carb_entries (
 *   timestamp,
 *   amount,
 *   duration_factor
 * )
 * VALUES (
 *   :timestamp!,
 *   :amount!,
 *   :durationFactor!
 * )
 * ON CONFLICT (timestamp) DO UPDATE SET
 *   amount = EXCLUDED.amount
 * RETURNING *
 * ```
 */
exports.upsertCarbEntry = new runtime_1.PreparedQuery(upsertCarbEntryIR);
const deleteCarbEntryIR = { "usedParamSet": { "timestamp": true }, "params": [{ "name": "timestamp", "required": true, "transform": { "type": "scalar" }, "locs": [{ "a": 43, "b": 53 }] }], "statement": "DELETE FROM carb_entries\nWHERE timestamp = :timestamp!\nRETURNING timestamp" };
/**
 * Query generated from SQL:
 * ```
 * DELETE FROM carb_entries
 * WHERE timestamp = :timestamp!
 * RETURNING timestamp
 * ```
 */
exports.deleteCarbEntry = new runtime_1.PreparedQuery(deleteCarbEntryIR);
const createCarbEntriesIR = { "usedParamSet": { "carbEntries": true }, "params": [{ "name": "carbEntries", "required": false, "transform": { "type": "pick_array_spread", "keys": [{ "name": "amount", "required": true }, { "name": "durationFactor", "required": true }, { "name": "timestamp", "required": true }] }, "locs": [{ "a": 77, "b": 88 }] }], "statement": "INSERT INTO carb_entries (\n  amount,\n  duration_factor,\n  timestamp\n)\nVALUES :carbEntries\nRETURNING *" };
/**
 * Query generated from SQL:
 * ```
 * INSERT INTO carb_entries (
 *   amount,
 *   duration_factor,
 *   timestamp
 * )
 * VALUES :carbEntries
 * RETURNING *
 * ```
 */
exports.createCarbEntries = new runtime_1.PreparedQuery(createCarbEntriesIR);
const getCarbEntriesByTimestampIR = { "usedParamSet": { "from": true, "to": true }, "params": [{ "name": "from", "required": true, "transform": { "type": "scalar" }, "locs": [{ "a": 85, "b": 90 }] }, { "name": "to", "required": false, "transform": { "type": "scalar" }, "locs": [{ "a": 118, "b": 120 }] }], "statement": "SELECT\n  timestamp,\n  amount,\n  duration_factor\nFROM carb_entries\nWHERE timestamp >= :from! AND timestamp <= COALESCE(:to, CURRENT_TIMESTAMP)" };
/**
 * Query generated from SQL:
 * ```
 * SELECT
 *   timestamp,
 *   amount,
 *   duration_factor
 * FROM carb_entries
 * WHERE timestamp >= :from! AND timestamp <= COALESCE(:to, CURRENT_TIMESTAMP)
 * ```
 */
exports.getCarbEntriesByTimestamp = new runtime_1.PreparedQuery(getCarbEntriesByTimestampIR);
//# sourceMappingURL=carbEntries.queries.js.map