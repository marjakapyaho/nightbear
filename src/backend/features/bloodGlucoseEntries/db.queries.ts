/** Types generated for queries found in "src/backend/features/bloodGlucoseEntries/db.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** 'Create' parameters type */
export interface ICreateParams {
  bloodGlucose: number;
  type: string;
}

/** 'Create' return type */
export interface ICreateResult {
  bloodGlucose: number;
  id: string;
  timestamp: Date;
  type: string;
}

/** 'Create' query type */
export interface ICreateQuery {
  params: ICreateParams;
  result: ICreateResult;
}

const createIR: any = {"usedParamSet":{"type":true,"bloodGlucose":true},"params":[{"name":"type","required":true,"transform":{"type":"scalar"},"locs":[{"a":64,"b":69}]},{"name":"bloodGlucose","required":true,"transform":{"type":"scalar"},"locs":[{"a":72,"b":85}]}],"statement":"INSERT INTO blood_glucose_entries (type, blood_glucose)\nVALUES (:type!, :bloodGlucose!)\nRETURNING *"};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO blood_glucose_entries (type, blood_glucose)
 * VALUES (:type!, :bloodGlucose!)
 * RETURNING *
 * ```
 */
export const create = new PreparedQuery<ICreateParams,ICreateResult>(createIR);


