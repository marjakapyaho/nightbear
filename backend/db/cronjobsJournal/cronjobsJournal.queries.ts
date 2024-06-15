/** Types generated for queries found in "db/cronjobsJournal/cronjobsJournal.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** 'UpdateCronjobsJournal' parameters type */
export interface IUpdateCronjobsJournalParams {
  dexcomShareLoginAttemptAt?: string | Date | null | void;
  dexcomShareSessionId?: string | null | void;
  previousExecutionAt?: string | Date | null | void;
}

/** 'UpdateCronjobsJournal' return type */
export interface IUpdateCronjobsJournalResult {
  dexcomShareLoginAttemptAt: string | null;
  dexcomShareSessionId: string | null;
  previousExecutionAt: string | null;
}

/** 'UpdateCronjobsJournal' query type */
export interface IUpdateCronjobsJournalQuery {
  params: IUpdateCronjobsJournalParams;
  result: IUpdateCronjobsJournalResult;
}

const updateCronjobsJournalIR: any = {"usedParamSet":{"previousExecutionAt":true,"dexcomShareSessionId":true,"dexcomShareLoginAttemptAt":true},"params":[{"name":"previousExecutionAt","required":false,"transform":{"type":"scalar"},"locs":[{"a":54,"b":73}]},{"name":"dexcomShareSessionId","required":false,"transform":{"type":"scalar"},"locs":[{"a":104,"b":124}]},{"name":"dexcomShareLoginAttemptAt","required":false,"transform":{"type":"scalar"},"locs":[{"a":161,"b":186}]}],"statement":"UPDATE cronjobs_journal\nSET\n  previous_execution_at = :previousExecutionAt,\n  dexcom_share_session_id = :dexcomShareSessionId,\n  dexcom_share_login_attempt_at = :dexcomShareLoginAttemptAt\nRETURNING *"};

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
export const updateCronjobsJournal = new PreparedQuery<IUpdateCronjobsJournalParams,IUpdateCronjobsJournalResult>(updateCronjobsJournalIR);


/** 'LoadCronjobsJournal' parameters type */
export type ILoadCronjobsJournalParams = void;

/** 'LoadCronjobsJournal' return type */
export interface ILoadCronjobsJournalResult {
  dexcomShareLoginAttemptAt: string | null;
  dexcomShareSessionId: string | null;
  previousExecutionAt: string | null;
}

/** 'LoadCronjobsJournal' query type */
export interface ILoadCronjobsJournalQuery {
  params: ILoadCronjobsJournalParams;
  result: ILoadCronjobsJournalResult;
}

const loadCronjobsJournalIR: any = {"usedParamSet":{},"params":[],"statement":"SELECT * FROM cronjobs_journal LIMIT 1"};

/**
 * Query generated from SQL:
 * ```
 * SELECT * FROM cronjobs_journal LIMIT 1
 * ```
 */
export const loadCronjobsJournal = new PreparedQuery<ILoadCronjobsJournalParams,ILoadCronjobsJournalResult>(loadCronjobsJournalIR);


