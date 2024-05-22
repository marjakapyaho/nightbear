"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.load = exports.update = void 0;
/** Types generated for queries found in "db/cronjobsJournal/cronjobsJournal.sql" */
const runtime_1 = require("@pgtyped/runtime");
const updateIR = { "usedParamSet": { "previousExecutionAt": true, "dexcomShareSessionId": true, "dexcomShareLoginAttemptAt": true }, "params": [{ "name": "previousExecutionAt", "required": false, "transform": { "type": "scalar" }, "locs": [{ "a": 54, "b": 73 }] }, { "name": "dexcomShareSessionId", "required": false, "transform": { "type": "scalar" }, "locs": [{ "a": 104, "b": 124 }] }, { "name": "dexcomShareLoginAttemptAt", "required": false, "transform": { "type": "scalar" }, "locs": [{ "a": 161, "b": 186 }] }], "statement": "UPDATE cronjobs_journal\nSET\n  previous_execution_at = :previousExecutionAt,\n  dexcom_share_session_id = :dexcomShareSessionId,\n  dexcom_share_login_attempt_at = :dexcomShareLoginAttemptAt\nRETURNING *" };
/**
 * Query generated from SQL:
 * ```
 * UPDATE cronjobs_journal
 * SET
 *   previous_execution_at = :previousExecutionAt,
 *   dexcom_share_session_id = :dexcomShareSessionId,
 *   dexcom_share_login_attempt_at = :dexcomShareLoginAttemptAt
 * RETURNING *
 * ```
 */
exports.update = new runtime_1.PreparedQuery(updateIR);
const loadIR = { "usedParamSet": {}, "params": [], "statement": "SELECT * FROM cronjobs_journal LIMIT 1" };
/**
 * Query generated from SQL:
 * ```
 * SELECT * FROM cronjobs_journal LIMIT 1
 * ```
 */
exports.load = new runtime_1.PreparedQuery(loadIR);
//# sourceMappingURL=cronjobsJournal.queries.js.map