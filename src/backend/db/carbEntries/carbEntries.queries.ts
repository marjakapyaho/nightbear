/** Types generated for queries found in "src/backend/db/carbEntries/carbEntries.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** 'Create' parameters type */
export interface ICreateParams {
  amount: number;
  speedFactor: number;
}

/** 'Create' return type */
export interface ICreateResult {
  amount: number;
  speedFactor: number;
  timestamp: string;
}

/** 'Create' query type */
export interface ICreateQuery {
  params: ICreateParams;
  result: ICreateResult;
}

const createIR: any = {"usedParamSet":{"amount":true,"speedFactor":true},"params":[{"name":"amount","required":true,"transform":{"type":"scalar"},"locs":[{"a":65,"b":72}]},{"name":"speedFactor","required":true,"transform":{"type":"scalar"},"locs":[{"a":77,"b":89}]}],"statement":"INSERT INTO carb_entries (\n  amount,\n  speed_factor\n)\nVALUES (\n  :amount!,\n  :speedFactor!\n)\nRETURNING *"};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO carb_entries (
 *   amount,
 *   speed_factor
 * )
 * VALUES (
 *   :amount!,
 *   :speedFactor!
 * )
 * RETURNING *
 * ```
 */
export const create = new PreparedQuery<ICreateParams,ICreateResult>(createIR);


/** 'CreateCarbEntries' parameters type */
export interface ICreateCarbEntriesParams {
  carbEntries: readonly ({
    amount: number,
    speedFactor: number,
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

const createCarbEntriesIR: any = {"usedParamSet":{"carbEntries":true},"params":[{"name":"carbEntries","required":false,"transform":{"type":"pick_array_spread","keys":[{"name":"amount","required":true},{"name":"speedFactor","required":true},{"name":"timestamp","required":true}]},"locs":[{"a":74,"b":85}]}],"statement":"INSERT INTO carb_entries (\n  amount,\n  speed_factor,\n  timestamp\n)\nVALUES :carbEntries\nRETURNING timestamp"};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO carb_entries (
 *   amount,
 *   speed_factor,
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
  speedFactor: number;
  timestamp: string;
}

/** 'ByTimestamp' query type */
export interface IByTimestampQuery {
  params: IByTimestampParams;
  result: IByTimestampResult;
}

const byTimestampIR: any = {"usedParamSet":{"from":true,"to":true},"params":[{"name":"from","required":true,"transform":{"type":"scalar"},"locs":[{"a":82,"b":87}]},{"name":"to","required":false,"transform":{"type":"scalar"},"locs":[{"a":115,"b":117}]}],"statement":"SELECT\n  timestamp,\n  amount,\n  speed_factor\nFROM carb_entries\nWHERE timestamp >= :from! AND timestamp <= COALESCE(:to, CURRENT_TIMESTAMP)"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *   timestamp,
 *   amount,
 *   speed_factor
 * FROM carb_entries
 * WHERE timestamp >= :from! AND timestamp <= COALESCE(:to, CURRENT_TIMESTAMP)
 * ```
 */
export const byTimestamp = new PreparedQuery<IByTimestampParams,IByTimestampResult>(byTimestampIR);


/** 'UpsertCarbEntry' parameters type */
export interface IUpsertCarbEntryParams {
  amount: number;
  speedFactor: number;
  timestamp: string | Date;
}

/** 'UpsertCarbEntry' return type */
export interface IUpsertCarbEntryResult {
  amount: number;
  speedFactor: number;
  timestamp: string;
}

/** 'UpsertCarbEntry' query type */
export interface IUpsertCarbEntryQuery {
  params: IUpsertCarbEntryParams;
  result: IUpsertCarbEntryResult;
}

const upsertCarbEntryIR: any = {"usedParamSet":{"timestamp":true,"amount":true,"speedFactor":true},"params":[{"name":"timestamp","required":true,"transform":{"type":"scalar"},"locs":[{"a":78,"b":88}]},{"name":"amount","required":true,"transform":{"type":"scalar"},"locs":[{"a":93,"b":100}]},{"name":"speedFactor","required":true,"transform":{"type":"scalar"},"locs":[{"a":105,"b":117}]}],"statement":"INSERT INTO carb_entries (\n  timestamp,\n  amount,\n  speed_factor\n)\nVALUES (\n  :timestamp!,\n  :amount!,\n  :speedFactor!\n)\nON CONFLICT (timestamp) DO UPDATE SET\n  amount = EXCLUDED.amount\nRETURNING *"};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO carb_entries (
 *   timestamp,
 *   amount,
 *   speed_factor
 * )
 * VALUES (
 *   :timestamp!,
 *   :amount!,
 *   :speedFactor!
 * )
 * ON CONFLICT (timestamp) DO UPDATE SET
 *   amount = EXCLUDED.amount
 * RETURNING *
 * ```
 */
export const upsertCarbEntry = new PreparedQuery<IUpsertCarbEntryParams,IUpsertCarbEntryResult>(upsertCarbEntryIR);


