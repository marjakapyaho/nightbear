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


