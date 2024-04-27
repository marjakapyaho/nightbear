/** Types generated for queries found in "src/backend/db/alarms/alarms.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

export type situation = 'BAD_HIGH' | 'BAD_LOW' | 'COMPRESSION_LOW' | 'CRITICAL_OUTDATED' | 'FALLING' | 'HIGH' | 'LOW' | 'OUTDATED' | 'PERSISTENT_HIGH' | 'RISING';

export type Json = null | boolean | number | string | Json[] | { [key: string]: Json };

/** 'CreateAlarm' parameters type */
export interface ICreateAlarmParams {
  deactivatedAt?: string | Date | null | void;
  situation: situation;
}

/** 'CreateAlarm' return type */
export interface ICreateAlarmResult {
  deactivatedAt: string | null;
  id: string;
  situation: situation;
}

/** 'CreateAlarm' query type */
export interface ICreateAlarmQuery {
  params: ICreateAlarmParams;
  result: ICreateAlarmResult;
}

const createAlarmIR: any = {"usedParamSet":{"situation":true,"deactivatedAt":true},"params":[{"name":"situation","required":true,"transform":{"type":"scalar"},"locs":[{"a":64,"b":74}]},{"name":"deactivatedAt","required":false,"transform":{"type":"scalar"},"locs":[{"a":79,"b":92}]}],"statement":"INSERT INTO alarms (\n  situation,\n  deactivated_at\n)\nVALUES (\n  :situation!,\n  :deactivatedAt\n)\nRETURNING *"};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO alarms (
 *   situation,
 *   deactivated_at
 * )
 * VALUES (
 *   :situation!,
 *   :deactivatedAt
 * )
 * RETURNING *
 * ```
 */
export const createAlarm = new PreparedQuery<ICreateAlarmParams,ICreateAlarmResult>(createAlarmIR);


/** 'DeactivateAlarm' parameters type */
export interface IDeactivateAlarmParams {
  id: string;
}

/** 'DeactivateAlarm' return type */
export interface IDeactivateAlarmResult {
  deactivatedAt: string | null;
  id: string;
  situation: situation;
}

/** 'DeactivateAlarm' query type */
export interface IDeactivateAlarmQuery {
  params: IDeactivateAlarmParams;
  result: IDeactivateAlarmResult;
}

const deactivateAlarmIR: any = {"usedParamSet":{"id":true},"params":[{"name":"id","required":true,"transform":{"type":"scalar"},"locs":[{"a":66,"b":69}]}],"statement":"UPDATE alarms SET\n  deactivated_at = CURRENT_TIMESTAMP\nWHERE id = :id!\nRETURNING *"};

/**
 * Query generated from SQL:
 * ```
 * UPDATE alarms SET
 *   deactivated_at = CURRENT_TIMESTAMP
 * WHERE id = :id!
 * RETURNING *
 * ```
 */
export const deactivateAlarm = new PreparedQuery<IDeactivateAlarmParams,IDeactivateAlarmResult>(deactivateAlarmIR);


/** 'CreateAlarmState' parameters type */
export interface ICreateAlarmStateParams {
  ackedBy?: string | null | void;
  alarmId: string;
  alarmLevel: number;
  notificationProcessedAt?: string | Date | null | void;
  notificationReceipt?: string | null | void;
  notificationTarget?: string | null | void;
  validAfter: string | Date;
}

/** 'CreateAlarmState' return type */
export interface ICreateAlarmStateResult {
  ackedBy: string | null;
  alarmId: string;
  alarmLevel: number;
  id: string;
  notificationProcessedAt: string | null;
  notificationReceipt: string | null;
  notificationTarget: string | null;
  timestamp: string;
  validAfter: string;
}

/** 'CreateAlarmState' query type */
export interface ICreateAlarmStateQuery {
  params: ICreateAlarmStateParams;
  result: ICreateAlarmStateResult;
}

const createAlarmStateIR: any = {"usedParamSet":{"alarmId":true,"alarmLevel":true,"validAfter":true,"ackedBy":true,"notificationTarget":true,"notificationReceipt":true,"notificationProcessedAt":true},"params":[{"name":"alarmId","required":true,"transform":{"type":"scalar"},"locs":[{"a":170,"b":178}]},{"name":"alarmLevel","required":true,"transform":{"type":"scalar"},"locs":[{"a":184,"b":195}]},{"name":"validAfter","required":true,"transform":{"type":"scalar"},"locs":[{"a":201,"b":212}]},{"name":"ackedBy","required":false,"transform":{"type":"scalar"},"locs":[{"a":218,"b":225}]},{"name":"notificationTarget","required":false,"transform":{"type":"scalar"},"locs":[{"a":231,"b":249}]},{"name":"notificationReceipt","required":false,"transform":{"type":"scalar"},"locs":[{"a":255,"b":274}]},{"name":"notificationProcessedAt","required":false,"transform":{"type":"scalar"},"locs":[{"a":280,"b":303}]}],"statement":"INSERT INTO alarm_states (\n  alarm_id,\n  alarm_level,\n  valid_after,\n  acked_by,\n  notification_target,\n  notification_receipt,\n  notification_processed_at\n)\nVALUES (\n   :alarmId!,\n   :alarmLevel!,\n   :validAfter!,\n   :ackedBy,\n   :notificationTarget,\n   :notificationReceipt,\n   :notificationProcessedAt\n )\nRETURNING *"};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO alarm_states (
 *   alarm_id,
 *   alarm_level,
 *   valid_after,
 *   acked_by,
 *   notification_target,
 *   notification_receipt,
 *   notification_processed_at
 * )
 * VALUES (
 *    :alarmId!,
 *    :alarmLevel!,
 *    :validAfter!,
 *    :ackedBy,
 *    :notificationTarget,
 *    :notificationReceipt,
 *    :notificationProcessedAt
 *  )
 * RETURNING *
 * ```
 */
export const createAlarmState = new PreparedQuery<ICreateAlarmStateParams,ICreateAlarmStateResult>(createAlarmStateIR);


/** 'MarkAlarmAsProcessed' parameters type */
export interface IMarkAlarmAsProcessedParams {
  id: string;
  notificationReceipt?: string | null | void;
}

/** 'MarkAlarmAsProcessed' return type */
export interface IMarkAlarmAsProcessedResult {
  ackedBy: string | null;
  alarmId: string;
  alarmLevel: number;
  id: string;
  notificationProcessedAt: string | null;
  notificationReceipt: string | null;
  notificationTarget: string | null;
  timestamp: string;
  validAfter: string;
}

/** 'MarkAlarmAsProcessed' query type */
export interface IMarkAlarmAsProcessedQuery {
  params: IMarkAlarmAsProcessedParams;
  result: IMarkAlarmAsProcessedResult;
}

const markAlarmAsProcessedIR: any = {"usedParamSet":{"notificationReceipt":true,"id":true},"params":[{"name":"notificationReceipt","required":false,"transform":{"type":"scalar"},"locs":[{"a":49,"b":68}]},{"name":"id","required":true,"transform":{"type":"scalar"},"locs":[{"a":130,"b":133}]}],"statement":"UPDATE alarm_states SET\n  notification_receipt = :notificationReceipt,\n  notification_processed_at = CURRENT_TIMESTAMP\nWHERE id = :id!\nRETURNING *"};

/**
 * Query generated from SQL:
 * ```
 * UPDATE alarm_states SET
 *   notification_receipt = :notificationReceipt,
 *   notification_processed_at = CURRENT_TIMESTAMP
 * WHERE id = :id!
 * RETURNING *
 * ```
 */
export const markAlarmAsProcessed = new PreparedQuery<IMarkAlarmAsProcessedParams,IMarkAlarmAsProcessedResult>(markAlarmAsProcessedIR);


/** 'MarkAllAlarmStatesAsProcessed' parameters type */
export interface IMarkAllAlarmStatesAsProcessedParams {
  alarmId: string;
}

/** 'MarkAllAlarmStatesAsProcessed' return type */
export interface IMarkAllAlarmStatesAsProcessedResult {
  ackedBy: string | null;
  alarmId: string;
  alarmLevel: number;
  id: string;
  notificationProcessedAt: string | null;
  notificationReceipt: string | null;
  notificationTarget: string | null;
  timestamp: string;
  validAfter: string;
}

/** 'MarkAllAlarmStatesAsProcessed' query type */
export interface IMarkAllAlarmStatesAsProcessedQuery {
  params: IMarkAllAlarmStatesAsProcessedParams;
  result: IMarkAllAlarmStatesAsProcessedResult;
}

const markAllAlarmStatesAsProcessedIR: any = {"usedParamSet":{"alarmId":true},"params":[{"name":"alarmId","required":true,"transform":{"type":"scalar"},"locs":[{"a":89,"b":97}]}],"statement":"UPDATE alarm_states SET\n  notification_processed_at = CURRENT_TIMESTAMP\nWHERE alarm_id = :alarmId! AND notification_processed_at IS NULL\nRETURNING *"};

/**
 * Query generated from SQL:
 * ```
 * UPDATE alarm_states SET
 *   notification_processed_at = CURRENT_TIMESTAMP
 * WHERE alarm_id = :alarmId! AND notification_processed_at IS NULL
 * RETURNING *
 * ```
 */
export const markAllAlarmStatesAsProcessed = new PreparedQuery<IMarkAllAlarmStatesAsProcessedParams,IMarkAllAlarmStatesAsProcessedResult>(markAllAlarmStatesAsProcessedIR);


/** 'GetActiveAlarm' parameters type */
export type IGetActiveAlarmParams = void;

/** 'GetActiveAlarm' return type */
export interface IGetActiveAlarmResult {
  alarmStates: Json | null;
  deactivatedAt: string | null;
  id: string;
  isActive: boolean;
  situation: situation;
}

/** 'GetActiveAlarm' query type */
export interface IGetActiveAlarmQuery {
  params: IGetActiveAlarmParams;
  result: IGetActiveAlarmResult;
}

const getActiveAlarmIR: any = {"usedParamSet":{},"params":[],"statement":"WITH\n  alarm_states_query AS (\n    SELECT\n      alarm_states.alarm_id,\n      json_agg(json_build_object(\n        'id', alarm_states.id::VARCHAR,\n        'timestamp', alarm_states.timestamp,\n        'alarmLevel', alarm_states.alarm_level,\n        'validAfter', alarm_states.valid_after,\n        'ackedBy', alarm_states.acked_by,\n        'notificationTarget', alarm_states.notification_target,\n        'notificationReceipt', alarm_states.notification_receipt,\n        'notificationProcessedAt', alarm_states.notification_processed_at\n        ) ORDER BY alarm_states.timestamp) AS alarm_states\n    FROM alarm_states\n    GROUP BY alarm_states.alarm_id\n  )\nSELECT\n  alarms.id AS id,\n  situation,\n  (CASE WHEN deactivated_at IS NULL THEN true ELSE false END) AS \"is_active!\",\n  deactivated_at,\n  alarm_states_query.alarm_states AS alarm_states\nFROM alarms\n  LEFT JOIN alarm_states_query ON alarm_states_query.alarm_id = alarms.id\nWHERE deactivated_at IS NULL"};

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
 *   situation,
 *   (CASE WHEN deactivated_at IS NULL THEN true ELSE false END) AS "is_active!",
 *   deactivated_at,
 *   alarm_states_query.alarm_states AS alarm_states
 * FROM alarms
 *   LEFT JOIN alarm_states_query ON alarm_states_query.alarm_id = alarms.id
 * WHERE deactivated_at IS NULL
 * ```
 */
export const getActiveAlarm = new PreparedQuery<IGetActiveAlarmParams,IGetActiveAlarmResult>(getActiveAlarmIR);


