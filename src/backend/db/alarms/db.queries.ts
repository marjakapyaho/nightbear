/** Types generated for queries found in "src/backend/db/alarms/db.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

export type situation = 'BAD_HIGH' | 'BAD_LOW' | 'COMPRESSION_LOW' | 'FALLING' | 'HIGH' | 'LOW' | 'OUTDATED' | 'PERSISTENT_HIGH' | 'RISING';

export type DateOrString = Date | string;

/** 'CreateAlarm' parameters type */
export interface ICreateAlarmParams {
  deactivatedAt?: DateOrString | null | void;
  isActive: boolean;
  situation: situation;
  timestamp: DateOrString;
}

/** 'CreateAlarm' return type */
export interface ICreateAlarmResult {
  deactivatedAt: Date | null;
  id: string;
  isActive: boolean;
  situation: situation;
  timestamp: Date;
}

/** 'CreateAlarm' query type */
export interface ICreateAlarmQuery {
  params: ICreateAlarmParams;
  result: ICreateAlarmResult;
}

const createAlarmIR: any = {"usedParamSet":{"timestamp":true,"situation":true,"isActive":true,"deactivatedAt":true},"params":[{"name":"timestamp","required":true,"transform":{"type":"scalar"},"locs":[{"a":90,"b":100}]},{"name":"situation","required":true,"transform":{"type":"scalar"},"locs":[{"a":105,"b":115}]},{"name":"isActive","required":true,"transform":{"type":"scalar"},"locs":[{"a":120,"b":129}]},{"name":"deactivatedAt","required":false,"transform":{"type":"scalar"},"locs":[{"a":134,"b":147}]}],"statement":"INSERT INTO alarms (\n  timestamp,\n  situation,\n  is_active,\n  deactivated_at\n)\nVALUES (\n  :timestamp!,\n  :situation!,\n  :isActive!,\n  :deactivatedAt\n)\nRETURNING *"};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO alarms (
 *   timestamp,
 *   situation,
 *   is_active,
 *   deactivated_at
 * )
 * VALUES (
 *   :timestamp!,
 *   :situation!,
 *   :isActive!,
 *   :deactivatedAt
 * )
 * RETURNING *
 * ```
 */
export const createAlarm = new PreparedQuery<ICreateAlarmParams,ICreateAlarmResult>(createAlarmIR);


/** 'CreateAlarmState' parameters type */
export interface ICreateAlarmStateParams {
  ackedBy?: string | null | void;
  alarmId: string;
  alarmLevel: number;
  validAfterTimestamp: DateOrString;
}

/** 'CreateAlarmState' return type */
export interface ICreateAlarmStateResult {
  ackedBy: string | null;
  alarmId: string;
  alarmLevel: number;
  id: string;
  validAfterTimestamp: Date;
}

/** 'CreateAlarmState' query type */
export interface ICreateAlarmStateQuery {
  params: ICreateAlarmStateParams;
  result: ICreateAlarmStateResult;
}

const createAlarmStateIR: any = {"usedParamSet":{"alarmId":true,"alarmLevel":true,"validAfterTimestamp":true,"ackedBy":true},"params":[{"name":"alarmId","required":true,"transform":{"type":"scalar"},"locs":[{"a":102,"b":110}]},{"name":"alarmLevel","required":true,"transform":{"type":"scalar"},"locs":[{"a":114,"b":125}]},{"name":"validAfterTimestamp","required":true,"transform":{"type":"scalar"},"locs":[{"a":129,"b":149}]},{"name":"ackedBy","required":false,"transform":{"type":"scalar"},"locs":[{"a":153,"b":160}]}],"statement":"INSERT INTO alarm_states (\n  alarm_Id,\n  alarm_level,\n  valid_after_timestamp,\n  acked_by\n)\nVALUES (\n :alarmId!,\n :alarmLevel!,\n :validAfterTimestamp!,\n :ackedBy\n)\nRETURNING *"};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO alarm_states (
 *   alarm_Id,
 *   alarm_level,
 *   valid_after_timestamp,
 *   acked_by
 * )
 * VALUES (
 *  :alarmId!,
 *  :alarmLevel!,
 *  :validAfterTimestamp!,
 *  :ackedBy
 * )
 * RETURNING *
 * ```
 */
export const createAlarmState = new PreparedQuery<ICreateAlarmStateParams,ICreateAlarmStateResult>(createAlarmStateIR);


/** 'CreatePushoverReceipt' parameters type */
export interface ICreatePushoverReceiptParams {
  alarmStateId: string;
  receipt: string;
}

/** 'CreatePushoverReceipt' return type */
export interface ICreatePushoverReceiptResult {
  alarmStateId: string;
  id: string;
  receipt: string;
}

/** 'CreatePushoverReceipt' query type */
export interface ICreatePushoverReceiptQuery {
  params: ICreatePushoverReceiptParams;
  result: ICreatePushoverReceiptResult;
}

const createPushoverReceiptIR: any = {"usedParamSet":{"alarmStateId":true,"receipt":true},"params":[{"name":"alarmStateId","required":true,"transform":{"type":"scalar"},"locs":[{"a":72,"b":85}]},{"name":"receipt","required":true,"transform":{"type":"scalar"},"locs":[{"a":89,"b":97}]}],"statement":"INSERT INTO pushover_receipts (\n  alarm_state_id,\n  receipt\n)\nVALUES (\n :alarmStateId!,\n :receipt!\n)\nRETURNING *"};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO pushover_receipts (
 *   alarm_state_id,
 *   receipt
 * )
 * VALUES (
 *  :alarmStateId!,
 *  :receipt!
 * )
 * RETURNING *
 * ```
 */
export const createPushoverReceipt = new PreparedQuery<ICreatePushoverReceiptParams,ICreatePushoverReceiptResult>(createPushoverReceiptIR);


