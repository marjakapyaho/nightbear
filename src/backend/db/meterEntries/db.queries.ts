/** Types generated for queries found in "src/backend/db/meterEntries/db.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** 'CreateMeterEntry' parameters type */
export interface ICreateMeterEntryParams {
  bloodGlucose: number;
}

/** 'CreateMeterEntry' return type */
export interface ICreateMeterEntryResult {
  bloodGlucose: number;
  timestamp: Date;
}

/** 'CreateMeterEntry' query type */
export interface ICreateMeterEntryQuery {
  params: ICreateMeterEntryParams;
  result: ICreateMeterEntryResult;
}

const createMeterEntryIR: any = {"usedParamSet":{"bloodGlucose":true},"params":[{"name":"bloodGlucose","required":true,"transform":{"type":"scalar"},"locs":[{"a":50,"b":63}]}],"statement":"INSERT INTO meter_entries (blood_glucose)\nVALUES (:bloodGlucose!)\nRETURNING *"};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO meter_entries (blood_glucose)
 * VALUES (:bloodGlucose!)
 * RETURNING *
 * ```
 */
export const createMeterEntry = new PreparedQuery<ICreateMeterEntryParams,ICreateMeterEntryResult>(createMeterEntryIR);


