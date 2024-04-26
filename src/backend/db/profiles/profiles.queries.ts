/** Types generated for queries found in "src/backend/db/profiles/profiles.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

export type situation = 'BAD_HIGH' | 'BAD_LOW' | 'COMPRESSION_LOW' | 'CRITICAL_OUTDATED' | 'FALLING' | 'HIGH' | 'LOW' | 'OUTDATED' | 'PERSISTENT_HIGH' | 'RISING';

export type numberArray = (number)[];

export type stringArray = (string)[];

/** 'CreateProfileTemplate' parameters type */
export interface ICreateProfileTemplateParams {
  alarmsEnabled: boolean;
  analyserSettingsId: string;
  notificationTargets: stringArray;
  profileName: string;
}

/** 'CreateProfileTemplate' return type */
export interface ICreateProfileTemplateResult {
  alarmsEnabled: boolean;
  analyserSettingsId: string;
  id: string;
  notificationTargets: stringArray;
  profileName: string | null;
}

/** 'CreateProfileTemplate' query type */
export interface ICreateProfileTemplateQuery {
  params: ICreateProfileTemplateParams;
  result: ICreateProfileTemplateResult;
}

const createProfileTemplateIR: any = {"usedParamSet":{"profileName":true,"alarmsEnabled":true,"analyserSettingsId":true,"notificationTargets":true},"params":[{"name":"profileName","required":true,"transform":{"type":"scalar"},"locs":[{"a":134,"b":146}]},{"name":"alarmsEnabled","required":true,"transform":{"type":"scalar"},"locs":[{"a":151,"b":165}]},{"name":"analyserSettingsId","required":true,"transform":{"type":"scalar"},"locs":[{"a":170,"b":189}]},{"name":"notificationTargets","required":true,"transform":{"type":"scalar"},"locs":[{"a":194,"b":214}]}],"statement":"INSERT INTO profile_templates (\n    profile_name,\n    alarms_enabled,\n    analyser_settings_id,\n    notification_targets\n)\nVALUES (\n  :profileName!,\n  :alarmsEnabled!,\n  :analyserSettingsId!,\n  :notificationTargets!\n)\nRETURNING *"};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO profile_templates (
 *     profile_name,
 *     alarms_enabled,
 *     analyser_settings_id,
 *     notification_targets
 * )
 * VALUES (
 *   :profileName!,
 *   :alarmsEnabled!,
 *   :analyserSettingsId!,
 *   :notificationTargets!
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
  escalationAfterMinutes: numberArray;
  profileTemplateId: string;
  situation: situation;
  snoozeMinutes: number;
}

/** 'CreateSituationSettings' return type */
export interface ICreateSituationSettingsResult {
  escalationAfterMinutes: numberArray;
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


