"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getInsulinEntriesByTimestamp = exports.createInsulinEntries = exports.deleteInsulinEntry = exports.upsertInsulinEntry = void 0;
/** Types generated for queries found in "db/insulinEntries/insulinEntries.sql" */
const runtime_1 = require("@pgtyped/runtime");
const upsertInsulinEntryIR = { "usedParamSet": { "timestamp": true, "amount": true, "type": true }, "params": [{ "name": "timestamp", "required": true, "transform": { "type": "scalar" }, "locs": [{ "a": 73, "b": 83 }] }, { "name": "amount", "required": true, "transform": { "type": "scalar" }, "locs": [{ "a": 88, "b": 95 }] }, { "name": "type", "required": true, "transform": { "type": "scalar" }, "locs": [{ "a": 100, "b": 105 }] }], "statement": "INSERT INTO insulin_entries (\n  timestamp,\n  amount,\n  type\n)\nVALUES (\n  :timestamp!,\n  :amount!,\n  :type!\n)\nON CONFLICT (timestamp) DO UPDATE SET\n  amount = EXCLUDED.amount\nRETURNING *" };
/**
 * Query generated from SQL:
 * ```
 * INSERT INTO insulin_entries (
 *   timestamp,
 *   amount,
 *   type
 * )
 * VALUES (
 *   :timestamp!,
 *   :amount!,
 *   :type!
 * )
 * ON CONFLICT (timestamp) DO UPDATE SET
 *   amount = EXCLUDED.amount
 * RETURNING *
 * ```
 */
exports.upsertInsulinEntry = new runtime_1.PreparedQuery(upsertInsulinEntryIR);
const deleteInsulinEntryIR = { "usedParamSet": { "timestamp": true }, "params": [{ "name": "timestamp", "required": true, "transform": { "type": "scalar" }, "locs": [{ "a": 46, "b": 56 }] }], "statement": "DELETE FROM insulin_entries\nWHERE timestamp = :timestamp!\nRETURNING timestamp" };
/**
 * Query generated from SQL:
 * ```
 * DELETE FROM insulin_entries
 * WHERE timestamp = :timestamp!
 * RETURNING timestamp
 * ```
 */
exports.deleteInsulinEntry = new runtime_1.PreparedQuery(deleteInsulinEntryIR);
const createInsulinEntriesIR = { "usedParamSet": { "insulinEntries": true }, "params": [{ "name": "insulinEntries", "required": false, "transform": { "type": "pick_array_spread", "keys": [{ "name": "amount", "required": true }, { "name": "type", "required": true }, { "name": "timestamp", "required": true }] }, "locs": [{ "a": 69, "b": 83 }] }], "statement": "INSERT INTO insulin_entries (\n  amount,\n  type,\n  timestamp\n)\nVALUES :insulinEntries\nRETURNING *" };
/**
 * Query generated from SQL:
 * ```
 * INSERT INTO insulin_entries (
 *   amount,
 *   type,
 *   timestamp
 * )
 * VALUES :insulinEntries
 * RETURNING *
 * ```
 */
exports.createInsulinEntries = new runtime_1.PreparedQuery(createInsulinEntriesIR);
const getInsulinEntriesByTimestampIR = { "usedParamSet": { "from": true, "to": true }, "params": [{ "name": "from", "required": true, "transform": { "type": "scalar" }, "locs": [{ "a": 77, "b": 82 }] }, { "name": "to", "required": false, "transform": { "type": "scalar" }, "locs": [{ "a": 110, "b": 112 }] }], "statement": "SELECT\n  timestamp,\n  amount,\n  type\nFROM insulin_entries\nWHERE timestamp >= :from! AND timestamp <= COALESCE(:to, CURRENT_TIMESTAMP)" };
/**
 * Query generated from SQL:
 * ```
 * SELECT
 *   timestamp,
 *   amount,
 *   type
 * FROM insulin_entries
 * WHERE timestamp >= :from! AND timestamp <= COALESCE(:to, CURRENT_TIMESTAMP)
 * ```
 */
exports.getInsulinEntriesByTimestamp = new runtime_1.PreparedQuery(getInsulinEntriesByTimestampIR);
//# sourceMappingURL=insulinEntries.queries.js.map