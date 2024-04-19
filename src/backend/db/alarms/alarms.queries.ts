/** Types generated for queries found in "src/backend/db/alarms/alarms.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

export type situation = 'BAD_HIGH' | 'BAD_LOW' | 'COMPRESSION_LOW' | 'FALLING' | 'HIGH' | 'LOW' | 'OUTDATED' | 'PERSISTENT_HIGH' | 'RISING';

/** 'CreateAlarm' parameters type */
export interface ICreateAlarmParams {
  deactivatedAt?: string | null | void;
  isActive: boolean;
  situation: situation;
}

/** 'CreateAlarm' return type */
export interface ICreateAlarmResult {
  deactivatedAt: string | null;
  id: string;
  isActive: boolean;
  situation: situation;
  timestamp: string;
}

/** 'CreateAlarm' query type */
export interface ICreateAlarmQuery {
  params: ICreateAlarmParams;
  result: ICreateAlarmResult;
}

const createAlarmIR: any = {"usedParamSet":{"situation":true,"isActive":true,"deactivatedAt":true},"params":[{"name":"situation","required":true,"transform":{"type":"scalar"},"locs":[{"a":77,"b":87}]},{"name":"isActive","required":true,"transform":{"type":"scalar"},"locs":[{"a":92,"b":101}]},{"name":"deactivatedAt","required":false,"transform":{"type":"scalar"},"locs":[{"a":106,"b":119}]}],"statement":"INSERT INTO alarms (\n  situation,\n  is_active,\n  deactivated_at\n)\nVALUES (\n  :situation!,\n  :isActive!,\n  :deactivatedAt\n)\nRETURNING *"};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO alarms (
 *   situation,
 *   is_active,
 *   deactivated_at
 * )
 * VALUES (
 *   :situation!,
 *   :isActive!,
 *   :deactivatedAt
 * )
 * RETURNING *
 * ```
 */
export const createAlarm = new PreparedQuery<ICreateAlarmParams,ICreateAlarmResult>(createAlarmIR);


/** 'CreateAlarms' parameters type */
export interface ICreateAlarmsParams {
  alarms: readonly ({
    situation: situation,
    isActive: boolean,
    deactivatedAt: string | null | void
  })[];
}

/** 'CreateAlarms' return type */
export interface ICreateAlarmsResult {
  deactivatedAt: string | null;
  id: string;
  isActive: boolean;
  situation: situation;
  timestamp: string;
}

/** 'CreateAlarms' query type */
export interface ICreateAlarmsQuery {
  params: ICreateAlarmsParams;
  result: ICreateAlarmsResult;
}

const createAlarmsIR: any = {"usedParamSet":{"alarms":true},"params":[{"name":"alarms","required":false,"transform":{"type":"pick_array_spread","keys":[{"name":"situation","required":true},{"name":"isActive","required":true},{"name":"deactivatedAt","required":false}]},"locs":[{"a":73,"b":79}]}],"statement":"INSERT INTO alarms (\n  situation,\n  is_active,\n  deactivated_at\n) VALUES :alarms\nRETURNING *"};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO alarms (
 *   situation,
 *   is_active,
 *   deactivated_at
 * ) VALUES :alarms
 * RETURNING *
 * ```
 */
export const createAlarms = new PreparedQuery<ICreateAlarmsParams,ICreateAlarmsResult>(createAlarmsIR);


/** 'CreateAlarmState' parameters type */
export interface ICreateAlarmStateParams {
  ackedBy?: string | null | void;
  alarmId: string;
  alarmLevel: number;
  validAfterTimestamp: string;
}

/** 'CreateAlarmState' return type */
export interface ICreateAlarmStateResult {
  ackedBy: string | null;
  alarmId: string;
  alarmLevel: number;
  id: string;
  validAfterTimestamp: string;
}

/** 'CreateAlarmState' query type */
export interface ICreateAlarmStateQuery {
  params: ICreateAlarmStateParams;
  result: ICreateAlarmStateResult;
}

const createAlarmStateIR: any = {"usedParamSet":{"alarmId":true,"alarmLevel":true,"validAfterTimestamp":true,"ackedBy":true},"params":[{"name":"alarmId","required":true,"transform":{"type":"scalar"},"locs":[{"a":102,"b":110}]},{"name":"alarmLevel","required":true,"transform":{"type":"scalar"},"locs":[{"a":114,"b":125}]},{"name":"validAfterTimestamp","required":true,"transform":{"type":"scalar"},"locs":[{"a":129,"b":149}]},{"name":"ackedBy","required":false,"transform":{"type":"scalar"},"locs":[{"a":153,"b":160}]}],"statement":"INSERT INTO alarm_states (\n  alarm_id,\n  alarm_level,\n  valid_after_timestamp,\n  acked_by\n)\nVALUES (\n :alarmId!,\n :alarmLevel!,\n :validAfterTimestamp!,\n :ackedBy\n)\nRETURNING *"};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO alarm_states (
 *   alarm_id,
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

