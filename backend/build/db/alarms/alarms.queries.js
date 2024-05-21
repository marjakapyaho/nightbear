"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAlarmStateByAlarmId = exports.getAlarms = exports.markAllAlarmStatesAsProcessed = exports.markAlarmAsProcessed = exports.createAlarmState = exports.deactivateAlarm = exports.createAlarm = void 0;
/** Types generated for queries found in "db/alarms/alarms.sql" */
const runtime_1 = require("@pgtyped/runtime");
const createAlarmIR = { "usedParamSet": { "timestamp": true, "situation": true, "deactivatedAt": true }, "params": [{ "name": "timestamp", "required": false, "transform": { "type": "scalar" }, "locs": [{ "a": 86, "b": 95 }] }, { "name": "situation", "required": true, "transform": { "type": "scalar" }, "locs": [{ "a": 120, "b": 130 }] }, { "name": "deactivatedAt", "required": false, "transform": { "type": "scalar" }, "locs": [{ "a": 135, "b": 148 }] }], "statement": "INSERT INTO alarms (\n  timestamp,\n  situation,\n  deactivated_at\n)\nVALUES (\n  coalesce(:timestamp, CURRENT_TIMESTAMP),\n  :situation!,\n  :deactivatedAt\n)\nRETURNING *" };
/**
 * Query generated from SQL:
 * ```
 * INSERT INTO alarms (
 *   timestamp,
 *   situation,
 *   deactivated_at
 * )
 * VALUES (
 *   coalesce(:timestamp, CURRENT_TIMESTAMP),
 *   :situation!,
 *   :deactivatedAt
 * )
 * RETURNING *
 * ```
 */
exports.createAlarm = new runtime_1.PreparedQuery(createAlarmIR);
const deactivateAlarmIR = { "usedParamSet": { "currentTimestamp": true, "id": true }, "params": [{ "name": "currentTimestamp", "required": false, "transform": { "type": "scalar" }, "locs": [{ "a": 46, "b": 62 }] }, { "name": "id", "required": true, "transform": { "type": "scalar" }, "locs": [{ "a": 95, "b": 98 }] }], "statement": "UPDATE alarms SET\n  deactivated_at = coalesce(:currentTimestamp, CURRENT_TIMESTAMP)\nWHERE id = :id!\nRETURNING *" };
/**
 * Query generated from SQL:
 * ```
 * UPDATE alarms SET
 *   deactivated_at = coalesce(:currentTimestamp, CURRENT_TIMESTAMP)
 * WHERE id = :id!
 * RETURNING *
 * ```
 */
exports.deactivateAlarm = new runtime_1.PreparedQuery(deactivateAlarmIR);
const createAlarmStateIR = { "usedParamSet": { "timestamp": true, "alarmId": true, "alarmLevel": true, "validAfter": true, "ackedBy": true, "notificationTarget": true, "notificationReceipt": true, "notificationProcessedAt": true }, "params": [{ "name": "timestamp", "required": false, "transform": { "type": "scalar" }, "locs": [{ "a": 192, "b": 201 }] }, { "name": "alarmId", "required": true, "transform": { "type": "scalar" }, "locs": [{ "a": 227, "b": 235 }] }, { "name": "alarmLevel", "required": true, "transform": { "type": "scalar" }, "locs": [{ "a": 241, "b": 252 }] }, { "name": "validAfter", "required": false, "transform": { "type": "scalar" }, "locs": [{ "a": 267, "b": 277 }] }, { "name": "ackedBy", "required": false, "transform": { "type": "scalar" }, "locs": [{ "a": 303, "b": 310 }] }, { "name": "notificationTarget", "required": false, "transform": { "type": "scalar" }, "locs": [{ "a": 316, "b": 334 }] }, { "name": "notificationReceipt", "required": false, "transform": { "type": "scalar" }, "locs": [{ "a": 340, "b": 359 }] }, { "name": "notificationProcessedAt", "required": false, "transform": { "type": "scalar" }, "locs": [{ "a": 365, "b": 388 }] }], "statement": "INSERT INTO alarm_states (\n  timestamp,\n  alarm_id,\n  alarm_level,\n  valid_after,\n  acked_by,\n  notification_target,\n  notification_receipt,\n  notification_processed_at\n)\nVALUES (\n   coalesce(:timestamp, CURRENT_TIMESTAMP),\n   :alarmId!,\n   :alarmLevel!,\n   coalesce(:validAfter, CURRENT_TIMESTAMP),\n   :ackedBy,\n   :notificationTarget,\n   :notificationReceipt,\n   :notificationProcessedAt\n )\nRETURNING *" };
/**
 * Query generated from SQL:
 * ```
 * INSERT INTO alarm_states (
 *   timestamp,
 *   alarm_id,
 *   alarm_level,
 *   valid_after,
 *   acked_by,
 *   notification_target,
 *   notification_receipt,
 *   notification_processed_at
 * )
 * VALUES (
 *    coalesce(:timestamp, CURRENT_TIMESTAMP),
 *    :alarmId!,
 *    :alarmLevel!,
 *    coalesce(:validAfter, CURRENT_TIMESTAMP),
 *    :ackedBy,
 *    :notificationTarget,
 *    :notificationReceipt,
 *    :notificationProcessedAt
 *  )
 * RETURNING *
 * ```
 */
exports.createAlarmState = new runtime_1.PreparedQuery(createAlarmStateIR);
const markAlarmAsProcessedIR = { "usedParamSet": { "notificationReceipt": true, "currentTimestamp": true, "id": true }, "params": [{ "name": "notificationReceipt", "required": false, "transform": { "type": "scalar" }, "locs": [{ "a": 49, "b": 68 }] }, { "name": "currentTimestamp", "required": false, "transform": { "type": "scalar" }, "locs": [{ "a": 110, "b": 126 }] }, { "name": "id", "required": true, "transform": { "type": "scalar" }, "locs": [{ "a": 159, "b": 162 }] }], "statement": "UPDATE alarm_states SET\n  notification_receipt = :notificationReceipt,\n  notification_processed_at = coalesce(:currentTimestamp, CURRENT_TIMESTAMP)\nWHERE id = :id!\nRETURNING *" };
/**
 * Query generated from SQL:
 * ```
 * UPDATE alarm_states SET
 *   notification_receipt = :notificationReceipt,
 *   notification_processed_at = coalesce(:currentTimestamp, CURRENT_TIMESTAMP)
 * WHERE id = :id!
 * RETURNING *
 * ```
 */
exports.markAlarmAsProcessed = new runtime_1.PreparedQuery(markAlarmAsProcessedIR);
const markAllAlarmStatesAsProcessedIR = { "usedParamSet": { "currentTimestamp": true, "alarmId": true }, "params": [{ "name": "currentTimestamp", "required": false, "transform": { "type": "scalar" }, "locs": [{ "a": 63, "b": 79 }] }, { "name": "alarmId", "required": true, "transform": { "type": "scalar" }, "locs": [{ "a": 118, "b": 126 }] }], "statement": "UPDATE alarm_states SET\n  notification_processed_at = coalesce(:currentTimestamp, CURRENT_TIMESTAMP)\nWHERE alarm_id = :alarmId! AND notification_processed_at IS NULL\nRETURNING *" };
/**
 * Query generated from SQL:
 * ```
 * UPDATE alarm_states SET
 *   notification_processed_at = coalesce(:currentTimestamp, CURRENT_TIMESTAMP)
 * WHERE alarm_id = :alarmId! AND notification_processed_at IS NULL
 * RETURNING *
 * ```
 */
exports.markAllAlarmStatesAsProcessed = new runtime_1.PreparedQuery(markAllAlarmStatesAsProcessedIR);
const getAlarmsIR = { "usedParamSet": { "onlyActive": true, "alarmId": true, "from": true, "to": true }, "params": [{ "name": "onlyActive", "required": false, "transform": { "type": "scalar" }, "locs": [{ "a": 946, "b": 956 }, { "a": 976, "b": 986 }] }, { "name": "alarmId", "required": false, "transform": { "type": "scalar" }, "locs": [{ "a": 1031, "b": 1038 }, { "a": 1057, "b": 1064 }] }, { "name": "from", "required": false, "transform": { "type": "scalar" }, "locs": [{ "a": 1086, "b": 1090 }, { "a": 1130, "b": 1134 }] }, { "name": "to", "required": false, "transform": { "type": "scalar" }, "locs": [{ "a": 1162, "b": 1164 }] }], "statement": "WITH\n  alarm_states_query AS (\n    SELECT\n      alarm_states.alarm_id,\n      json_agg(json_build_object(\n        'id', alarm_states.id::VARCHAR,\n        'timestamp', alarm_states.timestamp,\n        'alarmLevel', alarm_states.alarm_level,\n        'validAfter', alarm_states.valid_after,\n        'ackedBy', alarm_states.acked_by,\n        'notificationTarget', alarm_states.notification_target,\n        'notificationReceipt', alarm_states.notification_receipt,\n        'notificationProcessedAt', alarm_states.notification_processed_at\n        ) ORDER BY alarm_states.timestamp) AS alarm_states\n    FROM alarm_states\n    GROUP BY alarm_states.alarm_id\n  )\nSELECT\n  alarms.id AS id,\n  timestamp,\n  situation,\n  (CASE WHEN deactivated_at IS NULL THEN true ELSE false END) AS \"is_active!\",\n  deactivated_at,\n  alarm_states_query.alarm_states AS alarm_states\nFROM alarms\n  LEFT JOIN alarm_states_query ON alarm_states_query.alarm_id = alarms.id\nWHERE\n  (:onlyActive::bool IS NULL OR (:onlyActive = TRUE AND deactivated_at IS NULL)) AND\n  (:alarmId::uuid IS NULL OR :alarmId = alarms.id) AND\n  (:from::timestamptz IS NULL OR (timestamp >= :from AND timestamp <= COALESCE(:to, CURRENT_TIMESTAMP)))" };
/**
 * Query generated from SQL:
 * ```
 * WITH
 *   alarm_states_query AS (
 *     SELECT
 *       alarm_states.alarm_id,
 *       json_agg(json_build_object(
 *         'id', alarm_states.id::VARCHAR,
 *         'timestamp', alarm_states.timestamp,
 *         'alarmLevel', alarm_states.alarm_level,
 *         'validAfter', alarm_states.valid_after,
 *         'ackedBy', alarm_states.acked_by,
 *         'notificationTarget', alarm_states.notification_target,
 *         'notificationReceipt', alarm_states.notification_receipt,
 *         'notificationProcessedAt', alarm_states.notification_processed_at
 *         ) ORDER BY alarm_states.timestamp) AS alarm_states
 *     FROM alarm_states
 *     GROUP BY alarm_states.alarm_id
 *   )
 * SELECT
 *   alarms.id AS id,
 *   timestamp,
 *   situation,
 *   (CASE WHEN deactivated_at IS NULL THEN true ELSE false END) AS "is_active!",
 *   deactivated_at,
 *   alarm_states_query.alarm_states AS alarm_states
 * FROM alarms
 *   LEFT JOIN alarm_states_query ON alarm_states_query.alarm_id = alarms.id
 * WHERE
 *   (:onlyActive::bool IS NULL OR (:onlyActive = TRUE AND deactivated_at IS NULL)) AND
 *   (:alarmId::uuid IS NULL OR :alarmId = alarms.id) AND
 *   (:from::timestamptz IS NULL OR (timestamp >= :from AND timestamp <= COALESCE(:to, CURRENT_TIMESTAMP)))
 * ```
 */
exports.getAlarms = new runtime_1.PreparedQuery(getAlarmsIR);
const getAlarmStateByAlarmIdIR = { "usedParamSet": { "alarmId": true }, "params": [{ "name": "alarmId", "required": false, "transform": { "type": "scalar" }, "locs": [{ "a": 188, "b": 195 }] }], "statement": "SELECT DISTINCT\n  id,\n  timestamp,\n  alarm_id,\n  alarm_level,\n  valid_after,\n  acked_by,\n  notification_target,\n  notification_receipt,\n  notification_processed_at\nFROM alarm_states\nWHERE :alarmId = alarm_id\nORDER BY timestamp DESC" };
/**
 * Query generated from SQL:
 * ```
 * SELECT DISTINCT
 *   id,
 *   timestamp,
 *   alarm_id,
 *   alarm_level,
 *   valid_after,
 *   acked_by,
 *   notification_target,
 *   notification_receipt,
 *   notification_processed_at
 * FROM alarm_states
 * WHERE :alarmId = alarm_id
 * ORDER BY timestamp DESC
 * ```
 */
exports.getAlarmStateByAlarmId = new runtime_1.PreparedQuery(getAlarmStateByAlarmIdIR);
//# sourceMappingURL=alarms.queries.js.map