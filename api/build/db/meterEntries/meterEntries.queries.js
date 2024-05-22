"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMeterEntriesByTimestamp = exports.createMeterEntries = exports.deleteMeterEntry = exports.upsertMeterEntry = void 0;
/** Types generated for queries found in "db/meterEntries/meterEntries.sql" */
const runtime_1 = require("@pgtyped/runtime");
const upsertMeterEntryIR = { "usedParamSet": { "timestamp": true, "bloodGlucose": true }, "params": [{ "name": "timestamp", "required": true, "transform": { "type": "scalar" }, "locs": [{ "a": 70, "b": 80 }] }, { "name": "bloodGlucose", "required": true, "transform": { "type": "scalar" }, "locs": [{ "a": 85, "b": 98 }] }], "statement": "INSERT INTO meter_entries (\n  timestamp,\n  blood_glucose\n)\nVALUES (\n  :timestamp!,\n  :bloodGlucose!\n)\nON CONFLICT (timestamp) DO UPDATE SET\n  blood_glucose = EXCLUDED.blood_glucose\nRETURNING *" };
/**
 * Query generated from SQL:
 * ```
 * INSERT INTO meter_entries (
 *   timestamp,
 *   blood_glucose
 * )
 * VALUES (
 *   :timestamp!,
 *   :bloodGlucose!
 * )
 * ON CONFLICT (timestamp) DO UPDATE SET
 *   blood_glucose = EXCLUDED.blood_glucose
 * RETURNING *
 * ```
 */
exports.upsertMeterEntry = new runtime_1.PreparedQuery(upsertMeterEntryIR);
const deleteMeterEntryIR = { "usedParamSet": { "timestamp": true }, "params": [{ "name": "timestamp", "required": true, "transform": { "type": "scalar" }, "locs": [{ "a": 44, "b": 54 }] }], "statement": "DELETE FROM meter_entries\nWHERE timestamp = :timestamp!\nRETURNING timestamp" };
/**
 * Query generated from SQL:
 * ```
 * DELETE FROM meter_entries
 * WHERE timestamp = :timestamp!
 * RETURNING timestamp
 * ```
 */
exports.deleteMeterEntry = new runtime_1.PreparedQuery(deleteMeterEntryIR);
const createMeterEntriesIR = { "usedParamSet": { "meterEntries": true }, "params": [{ "name": "meterEntries", "required": false, "transform": { "type": "pick_array_spread", "keys": [{ "name": "bloodGlucose", "required": true }, { "name": "timestamp", "required": true }] }, "locs": [{ "a": 66, "b": 78 }] }], "statement": "INSERT INTO meter_entries (\n  blood_glucose,\n  timestamp\n)\nVALUES :meterEntries\nRETURNING *" };
/**
 * Query generated from SQL:
 * ```
 * INSERT INTO meter_entries (
 *   blood_glucose,
 *   timestamp
 * )
 * VALUES :meterEntries
 * RETURNING *
 * ```
 */
exports.createMeterEntries = new runtime_1.PreparedQuery(createMeterEntriesIR);
const getMeterEntriesByTimestampIR = { "usedParamSet": { "from": true, "to": true }, "params": [{ "name": "from", "required": true, "transform": { "type": "scalar" }, "locs": [{ "a": 74, "b": 79 }] }, { "name": "to", "required": false, "transform": { "type": "scalar" }, "locs": [{ "a": 107, "b": 109 }] }], "statement": "SELECT\n  timestamp,\n  blood_glucose\nFROM meter_entries\nWHERE timestamp >= :from! AND timestamp <= COALESCE(:to, CURRENT_TIMESTAMP)" };
/**
 * Query generated from SQL:
 * ```
 * SELECT
 *   timestamp,
 *   blood_glucose
 * FROM meter_entries
 * WHERE timestamp >= :from! AND timestamp <= COALESCE(:to, CURRENT_TIMESTAMP)
 * ```
 */
exports.getMeterEntriesByTimestamp = new runtime_1.PreparedQuery(getMeterEntriesByTimestampIR);
//# sourceMappingURL=meterEntries.queries.js.map