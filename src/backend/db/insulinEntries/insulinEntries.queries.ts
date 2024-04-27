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


