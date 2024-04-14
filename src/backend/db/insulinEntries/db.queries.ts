/** Types generated for queries found in "src/backend/db/insulinEntries/db.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

export type insulintype = 'FAST' | 'LONG';

/** 'CreateInsulinEntry' parameters type */
export interface ICreateInsulinEntryParams {
  amount: number;
  type: insulintype;
}

/** 'CreateInsulinEntry' return type */
export interface ICreateInsulinEntryResult {
  amount: number;
  timestamp: Date;
  type: insulintype;
}

/** 'CreateInsulinEntry' query type */
export interface ICreateInsulinEntryQuery {
  params: ICreateInsulinEntryParams;
  result: ICreateInsulinEntryResult;
}

const createInsulinEntryIR: any = {"usedParamSet":{"amount":true,"type":true},"params":[{"name":"amount","required":true,"transform":{"type":"scalar"},"locs":[{"a":60,"b":67}]},{"name":"type","required":true,"transform":{"type":"scalar"},"locs":[{"a":72,"b":77}]}],"statement":"INSERT INTO insulin_entries (\n  amount,\n  type\n)\nVALUES (\n  :amount!,\n  :type!\n)\nRETURNING *"};

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
export const createInsulinEntry = new PreparedQuery<ICreateInsulinEntryParams,ICreateInsulinEntryResult>(createInsulinEntryIR);


