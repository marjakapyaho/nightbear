/** Types generated for queries found in "src/backend/db/sensorEntries/db.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

export type sensor_entry_type = 'DEXCOM_G6_SHARE';

export type DateOrString = Date | string;

/** 'Create' parameters type */
export interface ICreateParams {
  bloodGlucose: number;
  type: sensor_entry_type;
}

/** 'Create' return type */
export interface ICreateResult {
  bloodGlucose: number;
  id: string;
  timestamp: Date;
  type: sensor_entry_type;
}

/** 'Create' query type */
export interface ICreateQuery {
  params: ICreateParams;
  result: ICreateResult;
}

const createIR: any = {"usedParamSet":{"bloodGlucose":true,"type":true},"params":[{"name":"bloodGlucose","required":true,"transform":{"type":"scalar"},"locs":[{"a":57,"b":70}]},{"name":"type","required":true,"transform":{"type":"scalar"},"locs":[{"a":73,"b":78}]}],"statement":"INSERT INTO sensor_entries (blood_glucose, type)\nVALUES (:bloodGlucose!, :type!)\nRETURNING *"};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO sensor_entries (blood_glucose, type)
 * VALUES (:bloodGlucose!, :type!)
 * RETURNING *
 * ```
 */
export const create = new PreparedQuery<ICreateParams,ICreateResult>(createIR);


/** 'ByTimestamp' parameters type */
export interface IByTimestampParams {
  from: DateOrString;
  to: DateOrString;
}

/** 'ByTimestamp' return type */
export interface IByTimestampResult {
  bloodGlucose: number;
  timestamp: Date;
  type: sensor_entry_type;
}

/** 'ByTimestamp' query type */
export interface IByTimestampQuery {
  params: IByTimestampParams;
  result: IByTimestampResult;
}

const byTimestampIR: any = {"usedParamSet":{"from":true,"to":true},"params":[{"name":"from","required":true,"transform":{"type":"scalar"},"locs":[{"a":83,"b":88}]},{"name":"to","required":true,"transform":{"type":"scalar"},"locs":[{"a":107,"b":110}]}],"statement":"SELECT\n  timestamp,\n  blood_glucose,\n  type\nFROM sensor_entries\nWHERE timestamp >= :from! AND timestamp <= :to!"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *   timestamp,
 *   blood_glucose,
 *   type
 * FROM sensor_entries
 * WHERE timestamp >= :from! AND timestamp <= :to!
 * ```
 */
export const byTimestamp = new PreparedQuery<IByTimestampParams,IByTimestampResult>(byTimestampIR);


