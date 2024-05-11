/** Types generated for queries found in "src/backend/db/carbEntries/carbEntries.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

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


/** 'DeleteCarbEntry' parameters type */
export interface IDeleteCarbEntryParams {
  timestamp: string | Date;
}

/** 'DeleteCarbEntry' return type */
export interface IDeleteCarbEntryResult {
  timestamp: string;
}

/** 'DeleteCarbEntry' query type */
export interface IDeleteCarbEntryQuery {
  params: IDeleteCarbEntryParams;
  result: IDeleteCarbEntryResult;
}

const deleteCarbEntryIR: any = {"usedParamSet":{"timestamp":true},"params":[{"name":"timestamp","required":true,"transform":{"type":"scalar"},"locs":[{"a":43,"b":53}]}],"statement":"DELETE FROM carb_entries\nWHERE timestamp = :timestamp!\nRETURNING timestamp"};

/**
 * Query generated from SQL:
 * ```
 * DELETE FROM carb_entries
 * WHERE timestamp = :timestamp!
 * RETURNING timestamp
 * ```
 */
export const deleteCarbEntry = new PreparedQuery<IDeleteCarbEntryParams,IDeleteCarbEntryResult>(deleteCarbEntryIR);


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
  amount: number;
  durationFactor: number;
  timestamp: string;
}

/** 'CreateCarbEntries' query type */
export interface ICreateCarbEntriesQuery {
  params: ICreateCarbEntriesParams;
  result: ICreateCarbEntriesResult;
}

const createCarbEntriesIR: any = {"usedParamSet":{"carbEntries":true},"params":[{"name":"carbEntries","required":false,"transform":{"type":"pick_array_spread","keys":[{"name":"amount","required":true},{"name":"durationFactor","required":true},{"name":"timestamp","required":true}]},"locs":[{"a":77,"b":88}]}],"statement":"INSERT INTO carb_entries (\n  amount,\n  duration_factor,\n  timestamp\n)\nVALUES :carbEntries\nRETURNING *"};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO carb_entries (
 *   amount,
 *   duration_factor,
 *   timestamp
 * )
 * VALUES :carbEntries
 * RETURNING *
 * ```
 */
export const createCarbEntries = new PreparedQuery<ICreateCarbEntriesParams,ICreateCarbEntriesResult>(createCarbEntriesIR);


/** 'GetCarbEntriesByTimestamp' parameters type */
export interface IGetCarbEntriesByTimestampParams {
  from: string | Date;
  to?: string | Date | null | void;
}

/** 'GetCarbEntriesByTimestamp' return type */
export interface IGetCarbEntriesByTimestampResult {
  amount: number;
  durationFactor: number;
  timestamp: string;
}

/** 'GetCarbEntriesByTimestamp' query type */
export interface IGetCarbEntriesByTimestampQuery {
  params: IGetCarbEntriesByTimestampParams;
  result: IGetCarbEntriesByTimestampResult;
}

const getCarbEntriesByTimestampIR: any = {"usedParamSet":{"from":true,"to":true},"params":[{"name":"from","required":true,"transform":{"type":"scalar"},"locs":[{"a":85,"b":90}]},{"name":"to","required":false,"transform":{"type":"scalar"},"locs":[{"a":118,"b":120}]}],"statement":"SELECT\n  timestamp,\n  amount,\n  duration_factor\nFROM carb_entries\nWHERE timestamp >= :from! AND timestamp <= COALESCE(:to, CURRENT_TIMESTAMP)"};

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
export const getCarbEntriesByTimestamp = new PreparedQuery<IGetCarbEntriesByTimestampParams,IGetCarbEntriesByTimestampResult>(getCarbEntriesByTimestampIR);


