/** Types generated for queries found in "src/backend/db/insulinEntries/insulinEntries.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

export type insulin_type = 'FAST' | 'LONG';

/** 'UpsertInsulinEntry' parameters type */
export interface IUpsertInsulinEntryParams {
  amount: number;
  timestamp: string | Date;
  type: insulin_type;
}

/** 'UpsertInsulinEntry' return type */
export interface IUpsertInsulinEntryResult {
  amount: number;
  timestamp: string;
  type: insulin_type;
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


/** 'CreateInsulinEntries' parameters type */
export interface ICreateInsulinEntriesParams {
  insulinEntries: readonly ({
    amount: number,
    type: insulin_type,
    timestamp: string | Date
  })[];
}

/** 'CreateInsulinEntries' return type */
export interface ICreateInsulinEntriesResult {
  amount: number;
  timestamp: string;
  type: insulin_type;
}

/** 'CreateInsulinEntries' query type */
export interface ICreateInsulinEntriesQuery {
  params: ICreateInsulinEntriesParams;
  result: ICreateInsulinEntriesResult;
}

const createInsulinEntriesIR: any = {"usedParamSet":{"insulinEntries":true},"params":[{"name":"insulinEntries","required":false,"transform":{"type":"pick_array_spread","keys":[{"name":"amount","required":true},{"name":"type","required":true},{"name":"timestamp","required":true}]},"locs":[{"a":69,"b":83}]}],"statement":"INSERT INTO insulin_entries (\n  amount,\n  type,\n  timestamp\n)\nVALUES :insulinEntries\nRETURNING *"};

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
export const createInsulinEntries = new PreparedQuery<ICreateInsulinEntriesParams,ICreateInsulinEntriesResult>(createInsulinEntriesIR);


/** 'GetInsulinEntriesByTimestamp' parameters type */
export interface IGetInsulinEntriesByTimestampParams {
  from: string | Date;
  to?: string | Date | null | void;
}

/** 'GetInsulinEntriesByTimestamp' return type */
export interface IGetInsulinEntriesByTimestampResult {
  amount: number;
  timestamp: string;
  type: insulin_type;
}

/** 'GetInsulinEntriesByTimestamp' query type */
export interface IGetInsulinEntriesByTimestampQuery {
  params: IGetInsulinEntriesByTimestampParams;
  result: IGetInsulinEntriesByTimestampResult;
}

const getInsulinEntriesByTimestampIR: any = {"usedParamSet":{"from":true,"to":true},"params":[{"name":"from","required":true,"transform":{"type":"scalar"},"locs":[{"a":77,"b":82}]},{"name":"to","required":false,"transform":{"type":"scalar"},"locs":[{"a":110,"b":112}]}],"statement":"SELECT\n  timestamp,\n  amount,\n  type\nFROM insulin_entries\nWHERE timestamp >= :from! AND timestamp <= COALESCE(:to, CURRENT_TIMESTAMP)"};

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
export const getInsulinEntriesByTimestamp = new PreparedQuery<IGetInsulinEntriesByTimestampParams,IGetInsulinEntriesByTimestampResult>(getInsulinEntriesByTimestampIR);


