/** Types generated for queries found in "src/backend/db/profiles/profiles.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

export type situation = 'BAD_HIGH' | 'BAD_LOW' | 'COMPRESSION_LOW' | 'CRITICAL_OUTDATED' | 'FALLING' | 'HIGH' | 'LOW' | 'OUTDATED' | 'PERSISTENT_HIGH' | 'RISING';

export type Json = null | boolean | number | string | Json[] | { [key: string]: Json };

export type numberArray = (number)[];

export type stringArray = (string)[];

/** 'CreateProfileTemplate' parameters type */
export interface ICreateProfileTemplateParams {
  alarmsEnabled: boolean;
  analyserSettingsId: string;
  notificationTargets: stringArray;
  profileName?: string | null | void;
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

const createProfileTemplateIR: any = {"usedParamSet":{"profileName":true,"alarmsEnabled":true,"analyserSettingsId":true,"notificationTargets":true},"params":[{"name":"profileName","required":false,"transform":{"type":"scalar"},"locs":[{"a":134,"b":145}]},{"name":"alarmsEnabled","required":true,"transform":{"type":"scalar"},"locs":[{"a":150,"b":164}]},{"name":"analyserSettingsId","required":true,"transform":{"type":"scalar"},"locs":[{"a":169,"b":188}]},{"name":"notificationTargets","required":true,"transform":{"type":"scalar"},"locs":[{"a":193,"b":213}]}],"statement":"INSERT INTO profile_templates (\n    profile_name,\n    alarms_enabled,\n    analyser_settings_id,\n    notification_targets\n)\nVALUES (\n  :profileName,\n  :alarmsEnabled!,\n  :analyserSettingsId!,\n  :notificationTargets!\n)\nRETURNING *"};

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
 *   :profileName,
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
  highLevelAbs: number;
  highLevelBad: number;
  highLevelRel: number;
  lowLevelAbs: number;
  lowLevelRel: number;
  timeSinceBgMinutes: number;
}

/** 'CreateAnalyserSettings' return type */
export interface ICreateAnalyserSettingsResult {
  highLevelAbs: number;
  highLevelBad: number;
  highLevelRel: number;
  id: string;
  lowLevelAbs: number;
  lowLevelRel: number;
  timeSinceBgMinutes: number;
}

/** 'CreateAnalyserSettings' query type */
export interface ICreateAnalyserSettingsQuery {
  params: ICreateAnalyserSettingsParams;
  result: ICreateAnalyserSettingsResult;
}

const createAnalyserSettingsIR: any = {"usedParamSet":{"highLevelRel":true,"highLevelAbs":true,"highLevelBad":true,"lowLevelRel":true,"lowLevelAbs":true,"timeSinceBgMinutes":true},"params":[{"name":"highLevelRel","required":true,"transform":{"type":"scalar"},"locs":[{"a":157,"b":170}]},{"name":"highLevelAbs","required":true,"transform":{"type":"scalar"},"locs":[{"a":175,"b":188}]},{"name":"highLevelBad","required":true,"transform":{"type":"scalar"},"locs":[{"a":193,"b":206}]},{"name":"lowLevelRel","required":true,"transform":{"type":"scalar"},"locs":[{"a":211,"b":223}]},{"name":"lowLevelAbs","required":true,"transform":{"type":"scalar"},"locs":[{"a":228,"b":240}]},{"name":"timeSinceBgMinutes","required":true,"transform":{"type":"scalar"},"locs":[{"a":245,"b":264}]}],"statement":"INSERT INTO analyser_settings (\n  high_level_rel,\n  high_level_abs,\n  high_level_bad,\n  low_level_rel,\n  low_level_abs,\n  time_since_bg_minutes\n)\nVALUES (\n  :highLevelRel!,\n  :highLevelAbs!,\n  :highLevelBad!,\n  :lowLevelRel!,\n  :lowLevelAbs!,\n  :timeSinceBgMinutes!\n)\nRETURNING *"};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO analyser_settings (
 *   high_level_rel,
 *   high_level_abs,
 *   high_level_bad,
 *   low_level_rel,
 *   low_level_abs,
 *   time_since_bg_minutes
 * )
 * VALUES (
 *   :highLevelRel!,
 *   :highLevelAbs!,
 *   :highLevelBad!,
 *   :lowLevelRel!,
 *   :lowLevelAbs!,
 *   :timeSinceBgMinutes!
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


/** 'CreateProfileActivation' parameters type */
export interface ICreateProfileActivationParams {
  activatedAt: string | Date;
  deactivatedAt?: string | Date | null | void;
  profileTemplateId: string;
  repeatTimeInLocalTimezone?: string | null | void;
}

/** 'CreateProfileActivation' return type */
export interface ICreateProfileActivationResult {
  activatedAt: string;
  deactivatedAt: string | null;
  id: string;
  profileTemplateId: string;
  repeatTimeInLocalTimezone: string | null;
}

/** 'CreateProfileActivation' query type */
export interface ICreateProfileActivationQuery {
  params: ICreateProfileActivationParams;
  result: ICreateProfileActivationResult;
}

const createProfileActivationIR: any = {"usedParamSet":{"profileTemplateId":true,"activatedAt":true,"repeatTimeInLocalTimezone":true,"deactivatedAt":true},"params":[{"name":"profileTemplateId","required":true,"transform":{"type":"scalar"},"locs":[{"a":137,"b":155}]},{"name":"activatedAt","required":true,"transform":{"type":"scalar"},"locs":[{"a":161,"b":173}]},{"name":"repeatTimeInLocalTimezone","required":false,"transform":{"type":"scalar"},"locs":[{"a":179,"b":204}]},{"name":"deactivatedAt","required":false,"transform":{"type":"scalar"},"locs":[{"a":210,"b":223}]}],"statement":"INSERT INTO profile_activations (\n  profile_template_id,\n  activated_at,\n  repeat_time_in_local_timezone,\n  deactivated_at\n)\nVALUES (\n   :profileTemplateId!,\n   :activatedAt!,\n   :repeatTimeInLocalTimezone,\n   :deactivatedAt\n )\nRETURNING *"};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO profile_activations (
 *   profile_template_id,
 *   activated_at,
 *   repeat_time_in_local_timezone,
 *   deactivated_at
 * )
 * VALUES (
 *    :profileTemplateId!,
 *    :activatedAt!,
 *    :repeatTimeInLocalTimezone,
 *    :deactivatedAt
 *  )
 * RETURNING *
 * ```
 */
export const createProfileActivation = new PreparedQuery<ICreateProfileActivationParams,ICreateProfileActivationResult>(createProfileActivationIR);


/** 'GetProfiles' parameters type */
export type IGetProfilesParams = void;

/** 'GetProfiles' return type */
export interface IGetProfilesResult {
  alarmsEnabled: boolean;
  analyserSettings: Json | null;
  id: string;
  isActive: boolean;
  notificationTargets: stringArray;
  profileName: string | null;
  situationSettings: Json | null;
}

/** 'GetProfiles' query type */
export interface IGetProfilesQuery {
  params: IGetProfilesParams;
  result: IGetProfilesResult;
}

const getProfilesIR: any = {"usedParamSet":{},"params":[],"statement":"WITH\n  analyser_settings_query AS (\n    SELECT\n      analyser_settings.id,\n      json_build_object(\n        'id', analyser_settings.id::VARCHAR,\n        'highLevelRel', analyser_settings.high_level_rel,\n        'highLevelAbs', analyser_settings.high_level_abs,\n        'highLevelBad', analyser_settings.high_level_bad,\n        'lowLevelRel', analyser_settings.low_level_rel,\n        'lowLevelAbs', analyser_settings.low_level_abs,\n        'timeSinceBgMinutes', analyser_settings.time_since_bg_minutes\n      ) AS analyser_settings\n    FROM analyser_settings\n  ),\n  situation_settings_query AS (\n    SELECT\n      situation_settings.profile_template_id,\n      json_agg(json_build_object(\n         'situation', situation_settings.situation,\n         'escalationAfterMinutes', situation_settings.escalation_after_minutes,\n         'snoozeMinutes', situation_settings.snooze_minutes\n       )) AS situation_settings\n    FROM situation_settings\n    GROUP BY situation_settings.profile_template_id\n  ),\n  most_recent_activation_query AS (\n    SELECT profile_template_id\n    FROM profile_activations\n    ORDER BY activated_at DESC\n    LIMIT 1\n  )\nSELECT\n  profile_templates.id AS id,\n  profile_name,\n  alarms_enabled,\n  notification_targets,\n  most_recent_activation_query.profile_template_id IS NOT NULL AS \"is_active!\",\n  analyser_settings_query.analyser_settings AS analyser_settings,\n  situation_settings_query.situation_settings AS situation_settings\nFROM profile_templates\n  INNER JOIN analyser_settings_query ON analyser_settings_query.id = profile_templates.analyser_settings_id\n  INNER JOIN situation_settings_query ON situation_settings_query.profile_template_id = profile_templates.id\n  LEFT JOIN most_recent_activation_query ON most_recent_activation_query.profile_template_id = profile_templates.id"};

/**
 * Query generated from SQL:
 * ```
 * WITH
 *   analyser_settings_query AS (
 *     SELECT
 *       analyser_settings.id,
 *       json_build_object(
 *         'id', analyser_settings.id::VARCHAR,
 *         'highLevelRel', analyser_settings.high_level_rel,
 *         'highLevelAbs', analyser_settings.high_level_abs,
 *         'highLevelBad', analyser_settings.high_level_bad,
 *         'lowLevelRel', analyser_settings.low_level_rel,
 *         'lowLevelAbs', analyser_settings.low_level_abs,
 *         'timeSinceBgMinutes', analyser_settings.time_since_bg_minutes
 *       ) AS analyser_settings
 *     FROM analyser_settings
 *   ),
 *   situation_settings_query AS (
 *     SELECT
 *       situation_settings.profile_template_id,
 *       json_agg(json_build_object(
 *          'situation', situation_settings.situation,
 *          'escalationAfterMinutes', situation_settings.escalation_after_minutes,
 *          'snoozeMinutes', situation_settings.snooze_minutes
 *        )) AS situation_settings
 *     FROM situation_settings
 *     GROUP BY situation_settings.profile_template_id
 *   ),
 *   most_recent_activation_query AS (
 *     SELECT profile_template_id
 *     FROM profile_activations
 *     ORDER BY activated_at DESC
 *     LIMIT 1
 *   )
 * SELECT
 *   profile_templates.id AS id,
 *   profile_name,
 *   alarms_enabled,
 *   notification_targets,
 *   most_recent_activation_query.profile_template_id IS NOT NULL AS "is_active!",
 *   analyser_settings_query.analyser_settings AS analyser_settings,
 *   situation_settings_query.situation_settings AS situation_settings
 * FROM profile_templates
 *   INNER JOIN analyser_settings_query ON analyser_settings_query.id = profile_templates.analyser_settings_id
 *   INNER JOIN situation_settings_query ON situation_settings_query.profile_template_id = profile_templates.id
 *   LEFT JOIN most_recent_activation_query ON most_recent_activation_query.profile_template_id = profile_templates.id
 * ```
 */
export const getProfiles = new PreparedQuery<IGetProfilesParams,IGetProfilesResult>(getProfilesIR);


/** 'GetRelevantProfileActivations' parameters type */
export type IGetRelevantProfileActivationsParams = void;

/** 'GetRelevantProfileActivations' return type */
export interface IGetRelevantProfileActivationsResult {
  activatedAt: string;
  deactivatedAt: string | null;
  id: string;
  profileName: string | null;
  profileTemplateId: string;
  repeatTimeInLocalTimezone: string | null;
}

/** 'GetRelevantProfileActivations' query type */
export interface IGetRelevantProfileActivationsQuery {
  params: IGetRelevantProfileActivationsParams;
  result: IGetRelevantProfileActivationsResult;
}

const getRelevantProfileActivationsIR: any = {"usedParamSet":{},"params":[],"statement":"WITH\n  most_recent_activation_query AS (\n    SELECT profile_template_id\n    FROM profile_activations\n    ORDER BY activated_at DESC\n    LIMIT 1\n  )\nSELECT\n  profile_activations.id,\n  profile_activations.profile_template_id,\n  profile_templates.profile_name,\n  activated_at,\n  repeat_time_in_local_timezone,\n  deactivated_at\nFROM profile_activations\n  INNER JOIN profile_templates ON profile_templates.id = profile_activations.profile_template_id\n  LEFT JOIN most_recent_activation_query ON most_recent_activation_query.profile_template_id = profile_templates.id\nWHERE repeat_time_in_local_timezone IS NOT NULL OR most_recent_activation_query.profile_template_id IS NOT NULL"};

/**
 * Query generated from SQL:
 * ```
 * WITH
 *   most_recent_activation_query AS (
 *     SELECT profile_template_id
 *     FROM profile_activations
 *     ORDER BY activated_at DESC
 *     LIMIT 1
 *   )
 * SELECT
 *   profile_activations.id,
 *   profile_activations.profile_template_id,
 *   profile_templates.profile_name,
 *   activated_at,
 *   repeat_time_in_local_timezone,
 *   deactivated_at
 * FROM profile_activations
 *   INNER JOIN profile_templates ON profile_templates.id = profile_activations.profile_template_id
 *   LEFT JOIN most_recent_activation_query ON most_recent_activation_query.profile_template_id = profile_templates.id
 * WHERE repeat_time_in_local_timezone IS NOT NULL OR most_recent_activation_query.profile_template_id IS NOT NULL
 * ```
 */
export const getRelevantProfileActivations = new PreparedQuery<IGetRelevantProfileActivationsParams,IGetRelevantProfileActivationsResult>(getRelevantProfileActivationsIR);


/** 'ReactivateProfileActivation' parameters type */
export interface IReactivateProfileActivationParams {
  id: string;
}

/** 'ReactivateProfileActivation' return type */
export interface IReactivateProfileActivationResult {
  activatedAt: string;
  deactivatedAt: string | null;
  id: string;
  profileTemplateId: string;
  repeatTimeInLocalTimezone: string | null;
}

/** 'ReactivateProfileActivation' query type */
export interface IReactivateProfileActivationQuery {
  params: IReactivateProfileActivationParams;
  result: IReactivateProfileActivationResult;
}

const reactivateProfileActivationIR: any = {"usedParamSet":{"id":true},"params":[{"name":"id","required":true,"transform":{"type":"scalar"},"locs":[{"a":77,"b":80}]}],"statement":"UPDATE profile_activations SET\n  activated_at = CURRENT_TIMESTAMP\nWHERE id = :id!\nRETURNING *"};

/**
 * Query generated from SQL:
 * ```
 * UPDATE profile_activations SET
 *   activated_at = CURRENT_TIMESTAMP
 * WHERE id = :id!
 * RETURNING *
 * ```
 */
export const reactivateProfileActivation = new PreparedQuery<IReactivateProfileActivationParams,IReactivateProfileActivationResult>(reactivateProfileActivationIR);


