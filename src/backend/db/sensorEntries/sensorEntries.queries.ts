/** Types generated for queries found in "src/backend/db/sensorEntries/sensorEntries.sql" */
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
  timestamp: string;
  type: string;
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
  from: string | Date;
  to: string | Date;
}

/** 'ByTimestamp' return type */
export interface IByTimestampResult {
  bloodGlucose: number;
  timestamp: string;
  type: string;
}

/** 'ByTimestamp' query type */
export interface IByTimestampQuery {
  params: IByTimestampParams;
  result: IByTimestampResult;
}

const byTimestampIR: any = {"usedParamSet":{"from":true,"to":true},"params":[{"name":"from","required":true,"transform":{"type":"scalar"},"locs":[{"a":48,"b":53}]},{"name":"to","required":true,"transform":{"type":"scalar"},"locs":[{"a":72,"b":75}]}],"statement":"SELECT *\nFROM sensor_entries\nWHERE timestamp >= :from! AND timestamp <= :to!"};

/**
 * Query generated from SQL:
 * ```
 * SELECT *
 * FROM sensor_entries
 * WHERE timestamp >= :from! AND timestamp <= :to!
 * ```
 */
export const byTimestamp = new PreparedQuery<IByTimestampParams,IByTimestampResult>(byTimestampIR);


/** 'Latest' parameters type */
export type ILatestParams = void;

/** 'Latest' return type */
export interface ILatestResult {
  bloodGlucose: number;
  timestamp: string;
  type: string;
}

/** 'Latest' query type */
export interface ILatestQuery {
  params: ILatestParams;
  result: ILatestResult;
}

const latestIR: any = {"usedParamSet":{},"params":[],"statement":"SELECT *\nFROM sensor_entries\nORDER BY timestamp DESC\nLIMIT 1"};

/**
 * Query generated from SQL:
 * ```
 * SELECT *
 * FROM sensor_entries
 * ORDER BY timestamp DESC
 * LIMIT 1
 * ```
 */
export const latest = new PreparedQuery<ILatestParams,ILatestResult>(latestIR);


