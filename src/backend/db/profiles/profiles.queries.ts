/** Types generated for queries found in "src/backend/db/profiles/profiles.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

export type Json = null | boolean | number | string | Json[] | { [key: string]: Json };

export type stringArray = (string)[];

/** 'CreateProfileTemplate' parameters type */
export interface ICreateProfileTemplateParams {
  alarmsEnabled: boolean;
  analyserSettingsId: string;
  notificationTargets: stringArray;
  profileName?: string | null | void;
  situationSettingsId: string;
}

/** 'CreateProfileTemplate' return type */
export interface ICreateProfileTemplateResult {
  alarmsEnabled: boolean;
  analyserSettingsId: string;
  id: string;
  notificationTargets: stringArray;
  profileName: string | null;
  situationSettingsId: string;
}

/** 'CreateProfileTemplate' query type */
export interface ICreateProfileTemplateQuery {
  params: ICreateProfileTemplateParams;
  result: ICreateProfileTemplateResult;
}

const createProfileTemplateIR: any = {"usedParamSet":{"profileName":true,"alarmsEnabled":true,"analyserSettingsId":true,"situationSettingsId":true,"notificationTargets":true},"params":[{"name":"profileName","required":false,"transform":{"type":"scalar"},"locs":[{"a":161,"b":172}]},{"name":"alarmsEnabled","required":true,"transform":{"type":"scalar"},"locs":[{"a":177,"b":191}]},{"name":"analyserSettingsId","required":true,"transform":{"type":"scalar"},"locs":[{"a":196,"b":215}]},{"name":"situationSettingsId","required":true,"transform":{"type":"scalar"},"locs":[{"a":220,"b":240}]},{"name":"notificationTargets","required":true,"transform":{"type":"scalar"},"locs":[{"a":245,"b":265}]}],"statement":"INSERT INTO profile_templates (\n    profile_name,\n    alarms_enabled,\n    analyser_settings_id,\n    situation_settings_id,\n    notification_targets\n)\nVALUES (\n  :profileName,\n  :alarmsEnabled!,\n  :analyserSettingsId!,\n  :situationSettingsId!,\n  :notificationTargets!\n)\nRETURNING *"};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO profile_templates (
 *     profile_name,
 *     alarms_enabled,
 *     analyser_settings_id,
 *     situation_settings_id,
 *     notification_targets
 * )
 * VALUES (
 *   :profileName,
 *   :alarmsEnabled!,
 *   :analyserSettingsId!,
 *   :situationSettingsId!,
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
  id: string;
}

/** 'CreateAnalyserSettings' query type */
export interface ICreateAnalyserSettingsQuery {
  params: ICreateAnalyserSettingsParams;
  result: ICreateAnalyserSettingsResult;
}

const createAnalyserSettingsIR: any = {"usedParamSet":{"highLevelRel":true,"highLevelAbs":true,"highLevelBad":true,"lowLevelRel":true,"lowLevelAbs":true,"timeSinceBgMinutes":true},"params":[{"name":"highLevelRel","required":true,"transform":{"type":"scalar"},"locs":[{"a":157,"b":170}]},{"name":"highLevelAbs","required":true,"transform":{"type":"scalar"},"locs":[{"a":175,"b":188}]},{"name":"highLevelBad","required":true,"transform":{"type":"scalar"},"locs":[{"a":193,"b":206}]},{"name":"lowLevelRel","required":true,"transform":{"type":"scalar"},"locs":[{"a":211,"b":223}]},{"name":"lowLevelAbs","required":true,"transform":{"type":"scalar"},"locs":[{"a":228,"b":240}]},{"name":"timeSinceBgMinutes","required":true,"transform":{"type":"scalar"},"locs":[{"a":245,"b":264}]}],"statement":"INSERT INTO analyser_settings (\n  high_level_rel,\n  high_level_abs,\n  high_level_bad,\n  low_level_rel,\n  low_level_abs,\n  time_since_bg_minutes\n)\nVALUES (\n  :highLevelRel!,\n  :highLevelAbs!,\n  :highLevelBad!,\n  :lowLevelRel!,\n  :lowLevelAbs!,\n  :timeSinceBgMinutes!\n)\nRETURNING analyser_settings.id"};

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
 * RETURNING analyser_settings.id
 * ```
 */
export const createAnalyserSettings = new PreparedQuery<ICreateAnalyserSettingsParams,ICreateAnalyserSettingsResult>(createAnalyserSettingsIR);


/** 'CreateSituationSettings' parameters type */
export interface ICreateSituationSettingsParams {
  badHigh: Json;
  badLow: Json;
  compressionLow: Json;
  criticalOutdated: Json;
  falling: Json;
  high: Json;
  low: Json;
  outdated: Json;
  persistentHigh: Json;
  rising: Json;
}

/** 'CreateSituationSettings' return type */
export interface ICreateSituationSettingsResult {
  id: string;
}

/** 'CreateSituationSettings' query type */
export interface ICreateSituationSettingsQuery {
  params: ICreateSituationSettingsParams;
  result: ICreateSituationSettingsResult;
}

const createSituationSettingsIR: any = {"usedParamSet":{"outdated":true,"criticalOutdated":true,"falling":true,"rising":true,"low":true,"badLow":true,"compressionLow":true,"high":true,"badHigh":true,"persistentHigh":true},"params":[{"name":"outdated","required":true,"transform":{"type":"scalar"},"locs":[{"a":176,"b":185}]},{"name":"criticalOutdated","required":true,"transform":{"type":"scalar"},"locs":[{"a":191,"b":208}]},{"name":"falling","required":true,"transform":{"type":"scalar"},"locs":[{"a":214,"b":222}]},{"name":"rising","required":true,"transform":{"type":"scalar"},"locs":[{"a":228,"b":235}]},{"name":"low","required":true,"transform":{"type":"scalar"},"locs":[{"a":241,"b":245}]},{"name":"badLow","required":true,"transform":{"type":"scalar"},"locs":[{"a":251,"b":258}]},{"name":"compressionLow","required":true,"transform":{"type":"scalar"},"locs":[{"a":264,"b":279}]},{"name":"high","required":true,"transform":{"type":"scalar"},"locs":[{"a":285,"b":290}]},{"name":"badHigh","required":true,"transform":{"type":"scalar"},"locs":[{"a":296,"b":304}]},{"name":"persistentHigh","required":true,"transform":{"type":"scalar"},"locs":[{"a":310,"b":325}]}],"statement":"INSERT INTO situation_settings (\n  outdated,\n  critical_outdated,\n  falling,\n  rising,\n  low,\n  bad_low,\n  compression_low,\n  high,\n  bad_high,\n  persistent_high\n)\nVALUES (\n   :outdated!,\n   :criticalOutdated!,\n   :falling!,\n   :rising!,\n   :low!,\n   :badLow!,\n   :compressionLow!,\n   :high!,\n   :badHigh!,\n   :persistentHigh!\n)\nRETURNING situation_settings.id"};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO situation_settings (
 *   outdated,
 *   critical_outdated,
 *   falling,
 *   rising,
 *   low,
 *   bad_low,
 *   compression_low,
 *   high,
 *   bad_high,
 *   persistent_high
 * )
 * VALUES (
 *    :outdated!,
 *    :criticalOutdated!,
 *    :falling!,
 *    :rising!,
 *    :low!,
 *    :badLow!,
 *    :compressionLow!,
 *    :high!,
 *    :badHigh!,
 *    :persistentHigh!
 * )
 * RETURNING situation_settings.id
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
export interface IGetProfilesParams {
  onlyActive?: boolean | null | void;
  templateId?: string | null | void;
}

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

const getProfilesIR: any = {"usedParamSet":{"templateId":true,"onlyActive":true},"params":[{"name":"templateId","required":false,"transform":{"type":"scalar"},"locs":[{"a":2098,"b":2108},{"a":2127,"b":2137}]},{"name":"onlyActive","required":false,"transform":{"type":"scalar"},"locs":[{"a":2169,"b":2179}]}],"statement":"WITH\n  analyser_settings_query AS (\n    SELECT\n      analyser_settings.id,\n      json_build_object(\n        'id', analyser_settings.id::VARCHAR,\n        'highLevelRel', analyser_settings.high_level_rel,\n        'highLevelAbs', analyser_settings.high_level_abs,\n        'highLevelBad', analyser_settings.high_level_bad,\n        'lowLevelRel', analyser_settings.low_level_rel,\n        'lowLevelAbs', analyser_settings.low_level_abs,\n        'timeSinceBgMinutes', analyser_settings.time_since_bg_minutes\n      ) AS analyser_settings\n    FROM analyser_settings\n  ),\n  situation_settings_query AS (\n    SELECT\n      situation_settings.id,\n      json_build_object(\n        'id', situation_settings.id::VARCHAR,\n        'OUTDATED', situation_settings.outdated,\n        'CRITICAL_OUTDATED', situation_settings.critical_outdated,\n        'FALLING', situation_settings.falling,\n        'RISING', situation_settings.rising,\n        'LOW', situation_settings.low,\n        'BAD_LOW', situation_settings.bad_low,\n        'COMPRESSION_LOW', situation_settings.compression_low,\n        'HIGH', situation_settings.high,\n        'BAD_HIGH', situation_settings.bad_high,\n        'PERSISTENT_HIGH', situation_settings.persistent_high\n        ) AS situation_settings\n    FROM situation_settings\n  ),\n  most_recent_activation_query AS (\n    SELECT profile_template_id\n    FROM profile_activations\n    ORDER BY activated_at DESC\n    LIMIT 1\n  )\nSELECT\n  profile_templates.id AS id,\n  profile_name,\n  alarms_enabled,\n  notification_targets,\n  most_recent_activation_query.profile_template_id IS NOT NULL AS \"is_active!\",\n  analyser_settings_query.analyser_settings AS analyser_settings,\n  situation_settings_query.situation_settings AS situation_settings\nFROM profile_templates\n  INNER JOIN analyser_settings_query ON analyser_settings_query.id = profile_templates.analyser_settings_id\n  INNER JOIN situation_settings_query ON situation_settings_query.id = profile_templates.situation_settings_id\n  LEFT JOIN most_recent_activation_query ON most_recent_activation_query.profile_template_id = profile_templates.id\nWHERE\n  (:templateId::uuid IS NULL OR :templateId = profile_templates.id) OR\n  (:onlyActive::bool IS NULL OR (most_recent_activation_query.profile_template_id IS NOT NULL))"};

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
 *       situation_settings.id,
 *       json_build_object(
 *         'id', situation_settings.id::VARCHAR,
 *         'OUTDATED', situation_settings.outdated,
 *         'CRITICAL_OUTDATED', situation_settings.critical_outdated,
 *         'FALLING', situation_settings.falling,
 *         'RISING', situation_settings.rising,
 *         'LOW', situation_settings.low,
 *         'BAD_LOW', situation_settings.bad_low,
 *         'COMPRESSION_LOW', situation_settings.compression_low,
 *         'HIGH', situation_settings.high,
 *         'BAD_HIGH', situation_settings.bad_high,
 *         'PERSISTENT_HIGH', situation_settings.persistent_high
 *         ) AS situation_settings
 *     FROM situation_settings
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
 *   INNER JOIN situation_settings_query ON situation_settings_query.id = profile_templates.situation_settings_id
 *   LEFT JOIN most_recent_activation_query ON most_recent_activation_query.profile_template_id = profile_templates.id
 * WHERE
 *   (:templateId::uuid IS NULL OR :templateId = profile_templates.id) OR
 *   (:onlyActive::bool IS NULL OR (most_recent_activation_query.profile_template_id IS NOT NULL))
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


