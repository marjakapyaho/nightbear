/** Types generated for queries found in "src/backend/db/meterEntries/meterEntries.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** 'Create' parameters type */
export interface ICreateParams {
  bloodGlucose: number;
}

/** 'Create' return type */
export interface ICreateResult {
  bloodGlucose: number;
  id: string;
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


/** 'ByTimestamp' parameters type */
export interface IByTimestampParams {
  from: string | Date;
  to: string | Date;
}

/** 'ByTimestamp' return type */
export interface IByTimestampResult {
  bloodGlucose: number;
  timestamp: string;
}

/** 'ByTimestamp' query type */
export interface IByTimestampQuery {
  params: IByTimestampParams;
  result: IByTimestampResult;
}

const byTimestampIR: any = {"usedParamSet":{"from":true,"to":true},"params":[{"name":"from","required":true,"transform":{"type":"scalar"},"locs":[{"a":74,"b":79}]},{"name":"to","required":true,"transform":{"type":"scalar"},"locs":[{"a":98,"b":101}]}],"statement":"SELECT\n  timestamp,\n  blood_glucose\nFROM meter_entries\nWHERE timestamp >= :from! AND timestamp <= :to!"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *   timestamp,
 *   blood_glucose
 * FROM meter_entries
 * WHERE timestamp >= :from! AND timestamp <= :to!
 * ```
 */
export const byTimestamp = new PreparedQuery<IByTimestampParams,IByTimestampResult>(byTimestampIR);


/** 'UpsertMeterEntry' parameters type */
export interface IUpsertMeterEntryParams {
  bloodGlucose: number;
  timestamp: string | Date;
}

/** 'UpsertMeterEntry' return type */
export interface IUpsertMeterEntryResult {
  bloodGlucose: number;
  id: string;
  timestamp: string;
}

/** 'UpsertMeterEntry' query type */
export interface IUpsertMeterEntryQuery {
  params: IUpsertMeterEntryParams;
  result: IUpsertMeterEntryResult;
}

const upsertMeterEntryIR: any = {"usedParamSet":{"timestamp":true,"bloodGlucose":true},"params":[{"name":"timestamp","required":true,"transform":{"type":"scalar"},"locs":[{"a":70,"b":80}]},{"name":"bloodGlucose","required":true,"transform":{"type":"scalar"},"locs":[{"a":85,"b":98}]}],"statement":"INSERT INTO meter_entries (\n  timestamp,\n  blood_glucose\n)\nVALUES (\n  :timestamp!,\n  :bloodGlucose!\n)\nON CONFLICT (timestamp) DO UPDATE SET\n  blood_glucose = EXCLUDED.blood_glucose\nRETURNING *"};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO meter_entries (
 *   timestamp,
 *   blood_glucose
 * )
 * VALUES (
 *   :timestamp!,
 *   :bloodGlucose!
 * )
 * ON CONFLICT (timestamp) DO UPDATE SET
 *   blood_glucose = EXCLUDED.blood_glucose
 * RETURNING *
 * ```
 */
export const upsertMeterEntry = new PreparedQuery<IUpsertMeterEntryParams,IUpsertMeterEntryResult>(upsertMeterEntryIR);


