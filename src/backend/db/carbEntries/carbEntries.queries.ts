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
  id: string;
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


/** 'ByTimestamp' parameters type */
export interface IByTimestampParams {
  from: string | Date;
  to: string | Date;
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

const byTimestampIR: any = {"usedParamSet":{"from":true,"to":true},"params":[{"name":"from","required":true,"transform":{"type":"scalar"},"locs":[{"a":82,"b":87}]},{"name":"to","required":true,"transform":{"type":"scalar"},"locs":[{"a":106,"b":109}]}],"statement":"SELECT\n  timestamp,\n  amount,\n  speed_factor\nFROM carb_entries\nWHERE timestamp >= :from! AND timestamp <= :to!"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *   timestamp,
 *   amount,
 *   speed_factor
 * FROM carb_entries
 * WHERE timestamp >= :from! AND timestamp <= :to!
 * ```
 */
export const byTimestamp = new PreparedQuery<IByTimestampParams,IByTimestampResult>(byTimestampIR);


