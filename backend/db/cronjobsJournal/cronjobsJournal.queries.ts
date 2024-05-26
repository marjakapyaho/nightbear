/** Types generated for queries found in "db/cronjobsJournal/cronjobsJournal.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** 'Update' parameters type */
export interface IUpdateParams {
  dexcomShareLoginAttemptAt?: string | Date | null | void;
  dexcomShareSessionId?: string | null | void;
  previousExecutionAt?: string | Date | null | void;
}

/** 'Update' return type */
export interface IUpdateResult {
  dexcomShareLoginAttemptAt: string | null;
  dexcomShareSessionId: string | null;
  previousExecutionAt: string | null;
}

/** 'Update' query type */
export interface IUpdateQuery {
  params: IUpdateParams;
  result: IUpdateResult;
}

const updateIR: any = {"usedParamSet":{"previousExecutionAt":true,"dexcomShareSessionId":true,"dexcomShareLoginAttemptAt":true},"params":[{"name":"previousExecutionAt","required":false,"transform":{"type":"scalar"},"locs":[{"a":54,"b":73}]},{"name":"dexcomShareSessionId","required":false,"transform":{"type":"scalar"},"locs":[{"a":104,"b":124}]},{"name":"dexcomShareLoginAttemptAt","required":false,"transform":{"type":"scalar"},"locs":[{"a":161,"b":186}]}],"statement":"UPDATE cronjobs_journal\nSET\n  previous_execution_at = :previousExecutionAt,\n  dexcom_share_session_id = :dexcomShareSessionId,\n  dexcom_share_login_attempt_at = :dexcomShareLoginAttemptAt\nRETURNING *"};

/**
 * Query generated from SQL:
 * ```
 * UPDATE cronjobs_journal
 * SET
 *   previous_execution_at = :previousExecutionAt,
 *   dexcom_share_session_id = :dexcomShareSessionId,
 *   dexcom_share_login_attempt_at = :dexcomShareLoginAttemptAt
 * RETURNING *
 * ```
 */
export const update = new PreparedQuery<IUpdateParams,IUpdateResult>(updateIR);


/** 'Load' parameters type */
export type ILoadParams = void;

/** 'Load' return type */
export interface ILoadResult {
  dexcomShareLoginAttemptAt: string | null;
  dexcomShareSessionId: string | null;
  previousExecutionAt: string | null;
}

/** 'Load' query type */
export interface ILoadQuery {
  params: ILoadParams;
  result: ILoadResult;
}

const loadIR: any = {"usedParamSet":{},"params":[],"statement":"SELECT * FROM cronjobs_journal LIMIT 1"};

/**
 * Query generated from SQL:
 * ```
 * SELECT * FROM cronjobs_journal LIMIT 1
 * ```
 */
export const load = new PreparedQuery<ILoadParams,ILoadResult>(loadIR);


