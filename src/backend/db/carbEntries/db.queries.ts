/** Types generated for queries found in "src/backend/db/carbEntries/db.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** 'CreateCarbEntry' parameters type */
export interface ICreateCarbEntryParams {
  amount: number;
  speedFactor: number;
}

/** 'CreateCarbEntry' return type */
export interface ICreateCarbEntryResult {
  amount: number;
  speedFactor: number;
  timestamp: Date;
}

/** 'CreateCarbEntry' query type */
export interface ICreateCarbEntryQuery {
  params: ICreateCarbEntryParams;
  result: ICreateCarbEntryResult;
}

const createCarbEntryIR: any = {"usedParamSet":{"amount":true,"speedFactor":true},"params":[{"name":"amount","required":true,"transform":{"type":"scalar"},"locs":[{"a":65,"b":72}]},{"name":"speedFactor","required":true,"transform":{"type":"scalar"},"locs":[{"a":77,"b":89}]}],"statement":"INSERT INTO carb_entries (\n  amount,\n  speed_factor\n)\nVALUES (\n  :amount!,\n  :speedFactor!\n)\nRETURNING *"};

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
export const createCarbEntry = new PreparedQuery<ICreateCarbEntryParams,ICreateCarbEntryResult>(createCarbEntryIR);


