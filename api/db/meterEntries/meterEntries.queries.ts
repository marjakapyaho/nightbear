/** Types generated for queries found in "db/meterEntries/meterEntries.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** 'UpsertMeterEntry' parameters type */
export interface IUpsertMeterEntryParams {
  bloodGlucose: number;
  timestamp: string | Date;
}

/** 'UpsertMeterEntry' return type */
export interface IUpsertMeterEntryResult {
  bloodGlucose: number;
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


/** 'DeleteMeterEntry' parameters type */
export interface IDeleteMeterEntryParams {
  timestamp: string | Date;
}

/** 'DeleteMeterEntry' return type */
export interface IDeleteMeterEntryResult {
  timestamp: string;
}

/** 'DeleteMeterEntry' query type */
export interface IDeleteMeterEntryQuery {
  params: IDeleteMeterEntryParams;
  result: IDeleteMeterEntryResult;
}

const deleteMeterEntryIR: any = {"usedParamSet":{"timestamp":true},"params":[{"name":"timestamp","required":true,"transform":{"type":"scalar"},"locs":[{"a":44,"b":54}]}],"statement":"DELETE FROM meter_entries\nWHERE timestamp = :timestamp!\nRETURNING timestamp"};

/**
 * Query generated from SQL:
 * ```
 * DELETE FROM meter_entries
 * WHERE timestamp = :timestamp!
 * RETURNING timestamp
 * ```
 */
export const deleteMeterEntry = new PreparedQuery<IDeleteMeterEntryParams,IDeleteMeterEntryResult>(deleteMeterEntryIR);


/** 'CreateMeterEntries' parameters type */
export interface ICreateMeterEntriesParams {
  meterEntries: readonly ({
    bloodGlucose: number,
    timestamp: string | Date
  })[];
}

/** 'CreateMeterEntries' return type */
export interface ICreateMeterEntriesResult {
  bloodGlucose: number;
  timestamp: string;
}

/** 'CreateMeterEntries' query type */
export interface ICreateMeterEntriesQuery {
  params: ICreateMeterEntriesParams;
  result: ICreateMeterEntriesResult;
}

const createMeterEntriesIR: any = {"usedParamSet":{"meterEntries":true},"params":[{"name":"meterEntries","required":false,"transform":{"type":"pick_array_spread","keys":[{"name":"bloodGlucose","required":true},{"name":"timestamp","required":true}]},"locs":[{"a":66,"b":78}]}],"statement":"INSERT INTO meter_entries (\n  blood_glucose,\n  timestamp\n)\nVALUES :meterEntries\nRETURNING *"};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO meter_entries (
 *   blood_glucose,
 *   timestamp
 * )
 * VALUES :meterEntries
 * RETURNING *
 * ```
 */
export const createMeterEntries = new PreparedQuery<ICreateMeterEntriesParams,ICreateMeterEntriesResult>(createMeterEntriesIR);


/** 'GetMeterEntriesByTimestamp' parameters type */
export interface IGetMeterEntriesByTimestampParams {
  from: string | Date;
  to?: string | Date | null | void;
}

/** 'GetMeterEntriesByTimestamp' return type */
export interface IGetMeterEntriesByTimestampResult {
  bloodGlucose: number;
  timestamp: string;
}

/** 'GetMeterEntriesByTimestamp' query type */
export interface IGetMeterEntriesByTimestampQuery {
  params: IGetMeterEntriesByTimestampParams;
  result: IGetMeterEntriesByTimestampResult;
}

const getMeterEntriesByTimestampIR: any = {"usedParamSet":{"from":true,"to":true},"params":[{"name":"from","required":true,"transform":{"type":"scalar"},"locs":[{"a":74,"b":79}]},{"name":"to","required":false,"transform":{"type":"scalar"},"locs":[{"a":107,"b":109}]}],"statement":"SELECT\n  timestamp,\n  blood_glucose\nFROM meter_entries\nWHERE timestamp >= :from! AND timestamp <= COALESCE(:to, CURRENT_TIMESTAMP)"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *   timestamp,
 *   blood_glucose
 * FROM meter_entries
 * WHERE timestamp >= :from! AND timestamp <= COALESCE(:to, CURRENT_TIMESTAMP)
 * ```
 */
export const getMeterEntriesByTimestamp = new PreparedQuery<IGetMeterEntriesByTimestampParams,IGetMeterEntriesByTimestampResult>(getMeterEntriesByTimestampIR);


