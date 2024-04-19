/** Types generated for queries found in "src/backend/db/meterEntries/meterEntries.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** 'Create' parameters type */
export interface ICreateParams {
  bloodGlucose: number;
}

/** 'Create' return type */
export interface ICreateResult {
  bloodGlucose: number;
  timestamp: string;
}

/** 'Create' query type */
export interface ICreateQuery {
  params: ICreateParams;
  result: ICreateResult;
}

const createIR: any = {"usedParamSet":{"bloodGlucose":true},"params":[{"name":"bloodGlucose","required":true,"transform":{"type":"scalar"},"locs":[{"a":50,"b":63}]}],"statement":"INSERT INTO meter_entries (blood_glucose)\nVALUES (:bloodGlucose!)\nRETURNING *"};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO meter_entries (blood_glucose)
 * VALUES (:bloodGlucose!)
 * RETURNING *
 * ```
 */
export const create = new PreparedQuery<ICreateParams,ICreateResult>(createIR);


