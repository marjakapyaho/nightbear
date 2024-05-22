"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLatestSensorEntry = exports.getSensorEntriesByTimestamp = exports.createSensorEntries = exports.createSensorEntry = void 0;
/** Types generated for queries found in "db/sensorEntries/sensorEntries.sql" */
const runtime_1 = require("@pgtyped/runtime");
const createSensorEntryIR = { "usedParamSet": { "bloodGlucose": true, "type": true }, "params": [{ "name": "bloodGlucose", "required": true, "transform": { "type": "scalar" }, "locs": [{ "a": 57, "b": 70 }] }, { "name": "type", "required": true, "transform": { "type": "scalar" }, "locs": [{ "a": 73, "b": 78 }] }], "statement": "INSERT INTO sensor_entries (blood_glucose, type)\nVALUES (:bloodGlucose!, :type!)\nRETURNING *" };
/**
 * Query generated from SQL:
 * ```
 * INSERT INTO sensor_entries (blood_glucose, type)
 * VALUES (:bloodGlucose!, :type!)
 * RETURNING *
 * ```
 */
exports.createSensorEntry = new runtime_1.PreparedQuery(createSensorEntryIR);
const createSensorEntriesIR = { "usedParamSet": { "sensorEntries": true }, "params": [{ "name": "sensorEntries", "required": false, "transform": { "type": "pick_array_spread", "keys": [{ "name": "bloodGlucose", "required": true }, { "name": "type", "required": true }, { "name": "timestamp", "required": true }] }, "locs": [{ "a": 75, "b": 88 }] }], "statement": "INSERT INTO sensor_entries (\n  blood_glucose,\n  type,\n  timestamp\n)\nVALUES :sensorEntries\nRETURNING *" };
/**
 * Query generated from SQL:
 * ```
 * INSERT INTO sensor_entries (
 *   blood_glucose,
 *   type,
 *   timestamp
 * )
 * VALUES :sensorEntries
 * RETURNING *
 * ```
 */
exports.createSensorEntries = new runtime_1.PreparedQuery(createSensorEntriesIR);
const getSensorEntriesByTimestampIR = { "usedParamSet": { "from": true, "to": true }, "params": [{ "name": "from", "required": true, "transform": { "type": "scalar" }, "locs": [{ "a": 48, "b": 53 }] }, { "name": "to", "required": false, "transform": { "type": "scalar" }, "locs": [{ "a": 81, "b": 83 }] }], "statement": "SELECT *\nFROM sensor_entries\nWHERE timestamp >= :from! AND timestamp <= COALESCE(:to, CURRENT_TIMESTAMP)" };
/**
 * Query generated from SQL:
 * ```
 * SELECT *
 * FROM sensor_entries
 * WHERE timestamp >= :from! AND timestamp <= COALESCE(:to, CURRENT_TIMESTAMP)
 * ```
 */
exports.getSensorEntriesByTimestamp = new runtime_1.PreparedQuery(getSensorEntriesByTimestampIR);
const getLatestSensorEntryIR = { "usedParamSet": {}, "params": [], "statement": "SELECT *\nFROM sensor_entries\nORDER BY timestamp DESC\nLIMIT 1" };
/**
 * Query generated from SQL:
 * ```
 * SELECT *
 * FROM sensor_entries
 * ORDER BY timestamp DESC
 * LIMIT 1
 * ```
 */
exports.getLatestSensorEntry = new runtime_1.PreparedQuery(getLatestSensorEntryIR);
//# sourceMappingURL=sensorEntries.queries.js.map