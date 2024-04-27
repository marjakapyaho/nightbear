/** Types generated for queries found in "src/backend/db/insulinEntries/insulinEntries.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

export type insulintype = 'FAST' | 'LONG';

/** 'Create' parameters type */
export interface ICreateParams {
  amount: number;
  type: insulintype;
}

/** 'Create' return type */
export interface ICreateResult {
  amount: number;
  id: string;
  timestamp: string;
  type: insulintype;
}

/** 'Create' query type */
export interface ICreateQuery {
  params: ICreateParams;
  result: ICreateResult;
}

const createIR: any = {"usedParamSet":{"amount":true,"type":true},"params":[{"name":"amount","required":true,"transform":{"type":"scalar"},"locs":[{"a":60,"b":67}]},{"name":"type","required":true,"transform":{"type":"scalar"},"locs":[{"a":72,"b":77}]}],"statement":"INSERT INTO insulin_entries (\n  amount,\n  type\n)\nVALUES (\n  :amount!,\n  :type!\n)\nRETURNING *"};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO insulin_entries (
 *   amount,
 *   type
 * )
 * VALUES (
 *   :amount!,
 *   :type!
 * )
 * RETURNING *
 * ```
 */
export const create = new PreparedQuery<ICreateParams,ICreateResult>(createIR);


/** 'ByTimestamp' parameters type */
export interface IByTimestampParams {
  from: string | Date;
  to: string | Date;
}

/** 'ByTimestamp' return type */
export interface IByTimestampResult {
  amount: number;
  timestamp: string;
  type: insulintype;
}

/** 'ByTimestamp' query type */
export interface IByTimestampQuery {
  params: IByTimestampParams;
  result: IByTimestampResult;
}

const byTimestampIR: any = {"usedParamSet":{"from":true,"to":true},"params":[{"name":"from","required":true,"transform":{"type":"scalar"},"locs":[{"a":77,"b":82}]},{"name":"to","required":true,"transform":{"type":"scalar"},"locs":[{"a":101,"b":104}]}],"statement":"SELECT\n  timestamp,\n  amount,\n  type\nFROM insulin_entries\nWHERE timestamp >= :from! AND timestamp <= :to!"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *   timestamp,
 *   amount,
 *   type
 * FROM insulin_entries
 * WHERE timestamp >= :from! AND timestamp <= :to!
 * ```
 */
export const byTimestamp = new PreparedQuery<IByTimestampParams,IByTimestampResult>(byTimestampIR);


/** 'UpsertInsulinEntry' parameters type */
export interface IUpsertInsulinEntryParams {
  amount: number;
  timestamp: string | Date;
  type: insulintype;
}

/** 'UpsertInsulinEntry' return type */
export interface IUpsertInsulinEntryResult {
  amount: number;
  id: string;
  timestamp: string;
  type: insulintype;
}

/** 'UpsertInsulinEntry' query type */
export interface IUpsertInsulinEntryQuery {
  params: IUpsertInsulinEntryParams;
  result: IUpsertInsulinEntryResult;
}

const upsertInsulinEntryIR: any = {"usedParamSet":{"timestamp":true,"amount":true,"type":true},"params":[{"name":"timestamp","required":true,"transform":{"type":"scalar"},"locs":[{"a":73,"b":83}]},{"name":"amount","required":true,"transform":{"type":"scalar"},"locs":[{"a":88,"b":95}]},{"name":"type","required":true,"transform":{"type":"scalar"},"locs":[{"a":100,"b":105}]}],"statement":"INSERT INTO insulin_entries (\n  timestamp,\n  amount,\n  type\n)\nVALUES (\n  :timestamp!,\n  :amount!,\n  :type!\n)\nON CONFLICT (timestamp) DO UPDATE SET\n  amount = EXCLUDED.amount\nRETURNING *"};

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
export const upsertInsulinEntry = new PreparedQuery<IUpsertInsulinEntryParams,IUpsertInsulinEntryResult>(upsertInsulinEntryIR);


