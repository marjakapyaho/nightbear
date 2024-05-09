/** Types generated for queries found in "src/backend/db/sensorEntries/sensorEntries.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

export type sensor_entry_type = 'DEXCOM_G4_UPLOADER' | 'DEXCOM_G4_UPLOADER_RAW' | 'DEXCOM_G6_SHARE' | 'DEXCOM_G6_UPLOADER' | 'LIBRE_3_LINK';

/** 'CreateSensorEntry' parameters type */
export interface ICreateSensorEntryParams {
  bloodGlucose: number;
  type: sensor_entry_type;
}

/** 'CreateSensorEntry' return type */
export interface ICreateSensorEntryResult {
  bloodGlucose: number;
  timestamp: string;
  type: sensor_entry_type;
}

/** 'CreateSensorEntry' query type */
export interface ICreateSensorEntryQuery {
  params: ICreateSensorEntryParams;
  result: ICreateSensorEntryResult;
}

const createSensorEntryIR: any = {"usedParamSet":{"bloodGlucose":true,"type":true},"params":[{"name":"bloodGlucose","required":true,"transform":{"type":"scalar"},"locs":[{"a":57,"b":70}]},{"name":"type","required":true,"transform":{"type":"scalar"},"locs":[{"a":73,"b":78}]}],"statement":"INSERT INTO sensor_entries (blood_glucose, type)\nVALUES (:bloodGlucose!, :type!)\nRETURNING *"};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO sensor_entries (blood_glucose, type)
 * VALUES (:bloodGlucose!, :type!)
 * RETURNING *
 * ```
 */
export const createSensorEntry = new PreparedQuery<ICreateSensorEntryParams,ICreateSensorEntryResult>(createSensorEntryIR);


/** 'CreateSensorEntries' parameters type */
export interface ICreateSensorEntriesParams {
  sensorEntries: readonly ({
    bloodGlucose: number,
    type: sensor_entry_type,
    timestamp: string | Date
  })[];
}

/** 'CreateSensorEntries' return type */
export interface ICreateSensorEntriesResult {
  bloodGlucose: number;
  timestamp: string;
  type: sensor_entry_type;
}

/** 'CreateSensorEntries' query type */
export interface ICreateSensorEntriesQuery {
  params: ICreateSensorEntriesParams;
  result: ICreateSensorEntriesResult;
}

const createSensorEntriesIR: any = {"usedParamSet":{"sensorEntries":true},"params":[{"name":"sensorEntries","required":false,"transform":{"type":"pick_array_spread","keys":[{"name":"bloodGlucose","required":true},{"name":"type","required":true},{"name":"timestamp","required":true}]},"locs":[{"a":75,"b":88}]}],"statement":"INSERT INTO sensor_entries (\n  blood_glucose,\n  type,\n  timestamp\n)\nVALUES :sensorEntries\nRETURNING *"};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO sensor_entries (
 *   blood_glucose,
 *   type,
 *   timestamp
 * )
 * VALUES :sensorEntries
 * RETURNING *
 * ```
 */
export const createSensorEntries = new PreparedQuery<ICreateSensorEntriesParams,ICreateSensorEntriesResult>(createSensorEntriesIR);


/** 'GetSensorEntriesByTimestamp' parameters type */
export interface IGetSensorEntriesByTimestampParams {
  from: string | Date;
  to?: string | Date | null | void;
}

/** 'GetSensorEntriesByTimestamp' return type */
export interface IGetSensorEntriesByTimestampResult {
  bloodGlucose: number;
  timestamp: string;
  type: sensor_entry_type;
}

/** 'GetSensorEntriesByTimestamp' query type */
export interface IGetSensorEntriesByTimestampQuery {
  params: IGetSensorEntriesByTimestampParams;
  result: IGetSensorEntriesByTimestampResult;
}

const getSensorEntriesByTimestampIR: any = {"usedParamSet":{"from":true,"to":true},"params":[{"name":"from","required":true,"transform":{"type":"scalar"},"locs":[{"a":48,"b":53}]},{"name":"to","required":false,"transform":{"type":"scalar"},"locs":[{"a":81,"b":83}]}],"statement":"SELECT *\nFROM sensor_entries\nWHERE timestamp >= :from! AND timestamp <= COALESCE(:to, CURRENT_TIMESTAMP)"};

/**
 * Query generated from SQL:
 * ```
 * SELECT *
 * FROM sensor_entries
 * WHERE timestamp >= :from! AND timestamp <= COALESCE(:to, CURRENT_TIMESTAMP)
 * ```
 */
export const getSensorEntriesByTimestamp = new PreparedQuery<IGetSensorEntriesByTimestampParams,IGetSensorEntriesByTimestampResult>(getSensorEntriesByTimestampIR);


/** 'GetLatestSensorEntry' parameters type */
export type IGetLatestSensorEntryParams = void;

/** 'GetLatestSensorEntry' return type */
export interface IGetLatestSensorEntryResult {
  bloodGlucose: number;
  timestamp: string;
  type: sensor_entry_type;
}

/** 'GetLatestSensorEntry' query type */
export interface IGetLatestSensorEntryQuery {
  params: IGetLatestSensorEntryParams;
  result: IGetLatestSensorEntryResult;
}

const getLatestSensorEntryIR: any = {"usedParamSet":{},"params":[],"statement":"SELECT *\nFROM sensor_entries\nORDER BY timestamp DESC\nLIMIT 1"};

/**
 * Query generated from SQL:
 * ```
 * SELECT *
 * FROM sensor_entries
 * ORDER BY timestamp DESC
 * LIMIT 1
 * ```
 */
export const getLatestSensorEntry = new PreparedQuery<IGetLatestSensorEntryParams,IGetLatestSensorEntryResult>(getLatestSensorEntryIR);


