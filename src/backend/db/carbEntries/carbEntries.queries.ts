/** Types generated for queries found in "src/backend/db/carbEntries/carbEntries.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** 'Create' parameters type */
export interface ICreateParams {
  amount: number;
  durationFactor: number;
}

/** 'Create' return type */
export interface ICreateResult {
  amount: number;
  durationFactor: number;
  timestamp: string;
}

/** 'Create' query type */
export interface ICreateQuery {
  params: ICreateParams;
  result: ICreateResult;
}

const createIR: any = {"usedParamSet":{"amount":true,"durationFactor":true},"params":[{"name":"amount","required":true,"transform":{"type":"scalar"},"locs":[{"a":68,"b":75}]},{"name":"durationFactor","required":true,"transform":{"type":"scalar"},"locs":[{"a":80,"b":95}]}],"statement":"INSERT INTO carb_entries (\n  amount,\n  duration_factor\n)\nVALUES (\n  :amount!,\n  :durationFactor!\n)\nRETURNING *"};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO carb_entries (
 *   amount,
 *   duration_factor
 * )
 * VALUES (
 *   :amount!,
 *   :durationFactor!
 * )
 * RETURNING *
 * ```
 */
export const create = new PreparedQuery<ICreateParams,ICreateResult>(createIR);


/** 'CreateCarbEntries' parameters type */
export interface ICreateCarbEntriesParams {
  carbEntries: readonly ({
    amount: number,
    durationFactor: number,
    timestamp: string | Date
  })[];
}

/** 'CreateCarbEntries' return type */
export interface ICreateCarbEntriesResult {
  timestamp: string;
}

/** 'CreateCarbEntries' query type */
export interface ICreateCarbEntriesQuery {
  params: ICreateCarbEntriesParams;
  result: ICreateCarbEntriesResult;
}

const createCarbEntriesIR: any = {"usedParamSet":{"carbEntries":true},"params":[{"name":"carbEntries","required":false,"transform":{"type":"pick_array_spread","keys":[{"name":"amount","required":true},{"name":"durationFactor","required":true},{"name":"timestamp","required":true}]},"locs":[{"a":77,"b":88}]}],"statement":"INSERT INTO carb_entries (\n  amount,\n  duration_factor,\n  timestamp\n)\nVALUES :carbEntries\nRETURNING timestamp"};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO carb_entries (
 *   amount,
 *   duration_factor,
 *   timestamp
 * )
 * VALUES :carbEntries
 * RETURNING timestamp
 * ```
 */
export const createCarbEntries = new PreparedQuery<ICreateCarbEntriesParams,ICreateCarbEntriesResult>(createCarbEntriesIR);


/** 'ByTimestamp' parameters type */
export interface IByTimestampParams {
  from: string | Date;
  to?: string | Date | null | void;
}

/** 'ByTimestamp' return type */
export interface IByTimestampResult {
  amount: number;
  durationFactor: number;
  timestamp: string;
}

/** 'ByTimestamp' query type */
export interface IByTimestampQuery {
  params: IByTimestampParams;
  result: IByTimestampResult;
}

const byTimestampIR: any = {"usedParamSet":{"from":true,"to":true},"params":[{"name":"from","required":true,"transform":{"type":"scalar"},"locs":[{"a":85,"b":90}]},{"name":"to","required":false,"transform":{"type":"scalar"},"locs":[{"a":118,"b":120}]}],"statement":"SELECT\n  timestamp,\n  amount,\n  duration_factor\nFROM carb_entries\nWHERE timestamp >= :from! AND timestamp <= COALESCE(:to, CURRENT_TIMESTAMP)"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *   timestamp,
 *   amount,
 *   duration_factor
 * FROM carb_entries
 * WHERE timestamp >= :from! AND timestamp <= COALESCE(:to, CURRENT_TIMESTAMP)
 * ```
 */
export const byTimestamp = new PreparedQuery<IByTimestampParams,IByTimestampResult>(byTimestampIR);


/** 'UpsertCarbEntry' parameters type */
export interface IUpsertCarbEntryParams {
  amount: number;
  durationFactor: number;
  timestamp: string | Date;
}

/** 'UpsertCarbEntry' return type */
export interface IUpsertCarbEntryResult {
  amount: number;
  durationFactor: number;
  timestamp: string;
}

/** 'UpsertCarbEntry' query type */
export interface IUpsertCarbEntryQuery {
  params: IUpsertCarbEntryParams;
  result: IUpsertCarbEntryResult;
}

const upsertCarbEntryIR: any = {"usedParamSet":{"timestamp":true,"amount":true,"durationFactor":true},"params":[{"name":"timestamp","required":true,"transform":{"type":"scalar"},"locs":[{"a":81,"b":91}]},{"name":"amount","required":true,"transform":{"type":"scalar"},"locs":[{"a":96,"b":103}]},{"name":"durationFactor","required":true,"transform":{"type":"scalar"},"locs":[{"a":108,"b":123}]}],"statement":"INSERT INTO carb_entries (\n  timestamp,\n  amount,\n  duration_factor\n)\nVALUES (\n  :timestamp!,\n  :amount!,\n  :durationFactor!\n)\nON CONFLICT (timestamp) DO UPDATE SET\n  amount = EXCLUDED.amount\nRETURNING *"};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO carb_entries (
 *   timestamp,
 *   amount,
 *   duration_factor
 * )
 * VALUES (
 *   :timestamp!,
 *   :amount!,
 *   :durationFactor!
 * )
 * ON CONFLICT (timestamp) DO UPDATE SET
 *   amount = EXCLUDED.amount
 * RETURNING *
 * ```
 */
export const upsertCarbEntry = new PreparedQuery<IUpsertCarbEntryParams,IUpsertCarbEntryResult>(upsertCarbEntryIR);


