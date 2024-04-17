/** Types generated for queries found in "src/backend/db/profiles/db.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

export type situation = 'BAD_HIGH' | 'BAD_LOW' | 'COMPRESSION_LOW' | 'FALLING' | 'HIGH' | 'LOW' | 'OUTDATED' | 'PERSISTENT_HIGH' | 'RISING';

/** 'CreateProfileTemplate' parameters type */
export interface ICreateProfileTemplateParams {
  alarmsEnabled: boolean;
  analyserSettingsId: string;
  profileName: string;
}

/** 'CreateProfileTemplate' return type */
export interface ICreateProfileTemplateResult {
  alarmsEnabled: boolean;
  analyserSettingsId: string;
  id: string;
  profileName: string | null;
}

/** 'CreateProfileTemplate' query type */
export interface ICreateProfileTemplateQuery {
  params: ICreateProfileTemplateParams;
  result: ICreateProfileTemplateResult;
}

const createProfileTemplateIR: any = {"usedParamSet":{"profileName":true,"alarmsEnabled":true,"analyserSettingsId":true},"params":[{"name":"profileName","required":true,"transform":{"type":"scalar"},"locs":[{"a":108,"b":120}]},{"name":"alarmsEnabled","required":true,"transform":{"type":"scalar"},"locs":[{"a":125,"b":139}]},{"name":"analyserSettingsId","required":true,"transform":{"type":"scalar"},"locs":[{"a":144,"b":163}]}],"statement":"INSERT INTO profile_templates (\n    profile_name,\n    alarms_enabled,\n    analyser_settings_id\n)\nVALUES (\n  :profileName!,\n  :alarmsEnabled!,\n  :analyserSettingsId!\n)\nRETURNING *"};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO profile_templates (
 *     profile_name,
 *     alarms_enabled,
 *     analyser_settings_id
 * )
 * VALUES (
 *   :profileName!,
 *   :alarmsEnabled!,
 *   :analyserSettingsId!
 * )
 * RETURNING *
 * ```
 */
export const createProfileTemplate = new PreparedQuery<ICreateProfileTemplateParams,ICreateProfileTemplateResult>(createProfileTemplateIR);


/** 'CreateAnalyserSettings' parameters type */
export interface ICreateAnalyserSettingsParams {
  highCorrectionSuppressionMinutes: number;
  highLevelAbs: number;
  highLevelBad: number;
  highLevelRel: number;
  lowLevelAbs: number;
  lowLevelBad: number;
  lowLevelRel: number;
  timeSinceBgMinutes: number;
}

/** 'CreateAnalyserSettings' return type */
export interface ICreateAnalyserSettingsResult {
  highCorrectionSuppressionMinutes: number;
  highLevelAbs: number;
  highLevelBad: number;
  highLevelRel: number;
  id: string;
  lowLevelAbs: number;
  lowLevelBad: number;
  lowLevelRel: number;
  timeSinceBgMinutes: number;
}

/** 'CreateAnalyserSettings' query type */
export interface ICreateAnalyserSettingsQuery {
  params: ICreateAnalyserSettingsParams;
  result: ICreateAnalyserSettingsResult;
}

const createAnalyserSettingsIR: any = {"usedParamSet":{"highLevelRel":true,"highLevelAbs":true,"highLevelBad":true,"lowLevelRel":true,"lowLevelAbs":true,"lowLevelBad":true,"timeSinceBgMinutes":true,"highCorrectionSuppressionMinutes":true},"params":[{"name":"highLevelRel","required":true,"transform":{"type":"scalar"},"locs":[{"a":213,"b":226}]},{"name":"highLevelAbs","required":true,"transform":{"type":"scalar"},"locs":[{"a":231,"b":244}]},{"name":"highLevelBad","required":true,"transform":{"type":"scalar"},"locs":[{"a":249,"b":262}]},{"name":"lowLevelRel","required":true,"transform":{"type":"scalar"},"locs":[{"a":267,"b":279}]},{"name":"lowLevelAbs","required":true,"transform":{"type":"scalar"},"locs":[{"a":284,"b":296}]},{"name":"lowLevelBad","required":true,"transform":{"type":"scalar"},"locs":[{"a":301,"b":313}]},{"name":"timeSinceBgMinutes","required":true,"transform":{"type":"scalar"},"locs":[{"a":318,"b":337}]},{"name":"highCorrectionSuppressionMinutes","required":true,"transform":{"type":"scalar"},"locs":[{"a":342,"b":375}]}],"statement":"INSERT INTO analyser_settings (\n  high_level_rel,\n  high_level_abs,\n  high_level_bad,\n  low_level_rel,\n  low_level_abs,\n  low_level_bad,\n  time_since_bg_minutes,\n  high_correction_suppression_minutes\n)\nVALUES (\n  :highLevelRel!,\n  :highLevelAbs!,\n  :highLevelBad!,\n  :lowLevelRel!,\n  :lowLevelAbs!,\n  :lowLevelBad!,\n  :timeSinceBgMinutes!,\n  :highCorrectionSuppressionMinutes!\n)\nRETURNING *"};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO analyser_settings (
 *   high_level_rel,
 *   high_level_abs,
 *   high_level_bad,
 *   low_level_rel,
 *   low_level_abs,
 *   low_level_bad,
 *   time_since_bg_minutes,
 *   high_correction_suppression_minutes
 * )
 * VALUES (
 *   :highLevelRel!,
 *   :highLevelAbs!,
 *   :highLevelBad!,
 *   :lowLevelRel!,
 *   :lowLevelAbs!,
 *   :lowLevelBad!,
 *   :timeSinceBgMinutes!,
 *   :highCorrectionSuppressionMinutes!
 * )
 * RETURNING *
 * ```
 */
export const createAnalyserSettings = new PreparedQuery<ICreateAnalyserSettingsParams,ICreateAnalyserSettingsResult>(createAnalyserSettingsIR);


/** 'CreateSituationSettings' parameters type */
export interface ICreateSituationSettingsParams {
  escalationAfterMinutes: number;
  profileTemplateId: string;
  situation: situation;
  snoozeMinutes: number;
}

/** 'CreateSituationSettings' return type */
export interface ICreateSituationSettingsResult {
  escalationAfterMinutes: number;
  profileTemplateId: string;
  situation: situation;
  snoozeMinutes: number;
}

/** 'CreateSituationSettings' query type */
export interface ICreateSituationSettingsQuery {
  params: ICreateSituationSettingsParams;
  result: ICreateSituationSettingsResult;
}

const createSituationSettingsIR: any = {"usedParamSet":{"situation":true,"profileTemplateId":true,"escalationAfterMinutes":true,"snoozeMinutes":true},"params":[{"name":"situation","required":true,"transform":{"type":"scalar"},"locs":[{"a":128,"b":138}]},{"name":"profileTemplateId","required":true,"transform":{"type":"scalar"},"locs":[{"a":144,"b":162}]},{"name":"escalationAfterMinutes","required":true,"transform":{"type":"scalar"},"locs":[{"a":168,"b":191}]},{"name":"snoozeMinutes","required":true,"transform":{"type":"scalar"},"locs":[{"a":197,"b":211}]}],"statement":"INSERT INTO situation_settings (\n  situation,\n  profile_template_id,\n  escalation_after_minutes,\n  snooze_minutes\n)\nVALUES (\n   :situation!,\n   :profileTemplateId!,\n   :escalationAfterMinutes!,\n   :snoozeMinutes!\n)\nRETURNING *"};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO situation_settings (
 *   situation,
 *   profile_template_id,
 *   escalation_after_minutes,
 *   snooze_minutes
 * )
 * VALUES (
 *    :situation!,
 *    :profileTemplateId!,
 *    :escalationAfterMinutes!,
 *    :snoozeMinutes!
 * )
 * RETURNING *
 * ```
 */
export const createSituationSettings = new PreparedQuery<ICreateSituationSettingsParams,ICreateSituationSettingsResult>(createSituationSettingsIR);


/** 'CreatePushoverTargets' parameters type */
export interface ICreatePushoverTargetsParams {
  name: string;
  profileTemplateId: string;
}

/** 'CreatePushoverTargets' return type */
export interface ICreatePushoverTargetsResult {
  id: string;
  name: string;
  profileTemplateId: string;
}

/** 'CreatePushoverTargets' query type */
export interface ICreatePushoverTargetsQuery {
  params: ICreatePushoverTargetsParams;
  result: ICreatePushoverTargetsResult;
}

const createPushoverTargetsIR: any = {"usedParamSet":{"profileTemplateId":true,"name":true},"params":[{"name":"profileTemplateId","required":true,"transform":{"type":"scalar"},"locs":[{"a":74,"b":92}]},{"name":"name","required":true,"transform":{"type":"scalar"},"locs":[{"a":98,"b":103}]}],"statement":"INSERT INTO pushover_levels (\n  profile_template_id,\n  name\n)\nVALUES (\n   :profileTemplateId!,\n   :name!\n)\nRETURNING *"};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO pushover_levels (
 *   profile_template_id,
 *   name
 * )
 * VALUES (
 *    :profileTemplateId!,
 *    :name!
 * )
 * RETURNING *
 * ```
 */
export const createPushoverTargets = new PreparedQuery<ICreatePushoverTargetsParams,ICreatePushoverTargetsResult>(createPushoverTargetsIR);


