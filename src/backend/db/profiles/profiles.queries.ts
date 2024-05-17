/** Types generated for queries found in "src/backend/db/profiles/profiles.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

export type stringArray = (string)[];

/** 'CreateProfileTemplate' parameters type */
export interface ICreateProfileTemplateParams {
  alarmsEnabled: boolean;
  badHigh: any;
  badLow: any;
  compressionLow: any;
  criticalOutdated: any;
  falling: any;
  high: any;
  highLevelAbs: number;
  highLevelBad: number;
  highLevelRel: number;
  low: any;
  lowLevelAbs: number;
  lowLevelRel: number;
  missingDayInsulin: any;
  notificationTargets: stringArray;
  outdated: any;
  persistentHigh: any;
  profileName?: string | null | void;
  rising: any;
  timeSinceBgMinutes: number;
}

/** 'CreateProfileTemplate' return type */
export interface ICreateProfileTemplateResult {
  alarmsEnabled: boolean;
  analyserHighLevelAbs: number;
  analyserHighLevelBad: number;
  analyserHighLevelRel: number;
  analyserLowLevelAbs: number;
  analyserLowLevelRel: number;
  analyserTimeSinceBgMinutes: number;
  id: string;
  notificationTargets: stringArray;
  profileName: string | null;
  situationBadHigh: any;
  situationBadLow: any;
  situationCompressionLow: any;
  situationCriticalOutdated: any;
  situationFalling: any;
  situationHigh: any;
  situationLow: any;
  situationMissingDayInsulin: any;
  situationOutdated: any;
  situationPersistentHigh: any;
  situationRising: any;
}

/** 'CreateProfileTemplate' query type */
export interface ICreateProfileTemplateQuery {
  params: ICreateProfileTemplateParams;
  result: ICreateProfileTemplateResult;
}

const createProfileTemplateIR: any = {"usedParamSet":{"profileName":true,"alarmsEnabled":true,"notificationTargets":true,"highLevelRel":true,"highLevelAbs":true,"highLevelBad":true,"lowLevelRel":true,"lowLevelAbs":true,"timeSinceBgMinutes":true,"outdated":true,"criticalOutdated":true,"falling":true,"rising":true,"low":true,"badLow":true,"compressionLow":true,"high":true,"badHigh":true,"persistentHigh":true,"missingDayInsulin":true},"params":[{"name":"profileName","required":false,"transform":{"type":"scalar"},"locs":[{"a":532,"b":543}]},{"name":"alarmsEnabled","required":true,"transform":{"type":"scalar"},"locs":[{"a":548,"b":562}]},{"name":"notificationTargets","required":true,"transform":{"type":"scalar"},"locs":[{"a":567,"b":587}]},{"name":"highLevelRel","required":true,"transform":{"type":"scalar"},"locs":[{"a":592,"b":605}]},{"name":"highLevelAbs","required":true,"transform":{"type":"scalar"},"locs":[{"a":610,"b":623}]},{"name":"highLevelBad","required":true,"transform":{"type":"scalar"},"locs":[{"a":628,"b":641}]},{"name":"lowLevelRel","required":true,"transform":{"type":"scalar"},"locs":[{"a":646,"b":658}]},{"name":"lowLevelAbs","required":true,"transform":{"type":"scalar"},"locs":[{"a":663,"b":675}]},{"name":"timeSinceBgMinutes","required":true,"transform":{"type":"scalar"},"locs":[{"a":680,"b":699}]},{"name":"outdated","required":true,"transform":{"type":"scalar"},"locs":[{"a":704,"b":713}]},{"name":"criticalOutdated","required":true,"transform":{"type":"scalar"},"locs":[{"a":718,"b":735}]},{"name":"falling","required":true,"transform":{"type":"scalar"},"locs":[{"a":740,"b":748}]},{"name":"rising","required":true,"transform":{"type":"scalar"},"locs":[{"a":753,"b":760}]},{"name":"low","required":true,"transform":{"type":"scalar"},"locs":[{"a":765,"b":769}]},{"name":"badLow","required":true,"transform":{"type":"scalar"},"locs":[{"a":774,"b":781}]},{"name":"compressionLow","required":true,"transform":{"type":"scalar"},"locs":[{"a":786,"b":801}]},{"name":"high","required":true,"transform":{"type":"scalar"},"locs":[{"a":806,"b":811}]},{"name":"badHigh","required":true,"transform":{"type":"scalar"},"locs":[{"a":816,"b":824}]},{"name":"persistentHigh","required":true,"transform":{"type":"scalar"},"locs":[{"a":829,"b":844}]},{"name":"missingDayInsulin","required":true,"transform":{"type":"scalar"},"locs":[{"a":849,"b":867}]}],"statement":"INSERT INTO profile_templates (\n  profile_name,\n  alarms_enabled,\n  notification_targets,\n  analyser_high_level_rel,\n  analyser_high_level_abs,\n  analyser_high_level_bad,\n  analyser_low_level_rel,\n  analyser_low_level_abs,\n  analyser_time_since_bg_minutes,\n  situation_outdated,\n  situation_critical_outdated,\n  situation_falling,\n  situation_rising,\n  situation_low,\n  situation_bad_low,\n  situation_compression_low,\n  situation_high,\n  situation_bad_high,\n  situation_persistent_high,\n  situation_missing_day_insulin\n)\nVALUES (\n  :profileName,\n  :alarmsEnabled!,\n  :notificationTargets!,\n  :highLevelRel!,\n  :highLevelAbs!,\n  :highLevelBad!,\n  :lowLevelRel!,\n  :lowLevelAbs!,\n  :timeSinceBgMinutes!,\n  :outdated!,\n  :criticalOutdated!,\n  :falling!,\n  :rising!,\n  :low!,\n  :badLow!,\n  :compressionLow!,\n  :high!,\n  :badHigh!,\n  :persistentHigh!,\n  :missingDayInsulin!\n)\nRETURNING *"};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO profile_templates (
 *   profile_name,
 *   alarms_enabled,
 *   notification_targets,
 *   analyser_high_level_rel,
 *   analyser_high_level_abs,
 *   analyser_high_level_bad,
 *   analyser_low_level_rel,
 *   analyser_low_level_abs,
 *   analyser_time_since_bg_minutes,
 *   situation_outdated,
 *   situation_critical_outdated,
 *   situation_falling,
 *   situation_rising,
 *   situation_low,
 *   situation_bad_low,
 *   situation_compression_low,
 *   situation_high,
 *   situation_bad_high,
 *   situation_persistent_high,
 *   situation_missing_day_insulin
 * )
 * VALUES (
 *   :profileName,
 *   :alarmsEnabled!,
 *   :notificationTargets!,
 *   :highLevelRel!,
 *   :highLevelAbs!,
 *   :highLevelBad!,
 *   :lowLevelRel!,
 *   :lowLevelAbs!,
 *   :timeSinceBgMinutes!,
 *   :outdated!,
 *   :criticalOutdated!,
 *   :falling!,
 *   :rising!,
 *   :low!,
 *   :badLow!,
 *   :compressionLow!,
 *   :high!,
 *   :badHigh!,
 *   :persistentHigh!,
 *   :missingDayInsulin!
 * )
 * RETURNING *
 * ```
 */
export const createProfileTemplate = new PreparedQuery<ICreateProfileTemplateParams,ICreateProfileTemplateResult>(createProfileTemplateIR);


/** 'EditProfileTemplate' parameters type */
export interface IEditProfileTemplateParams {
  alarmsEnabled: boolean;
  badHigh: any;
  badLow: any;
  compressionLow: any;
  criticalOutdated: any;
  falling: any;
  high: any;
  highLevelAbs: number;
  highLevelBad: number;
  highLevelRel: number;
  id: string;
  low: any;
  lowLevelAbs: number;
  lowLevelRel: number;
  missingDayInsulin: any;
  notificationTargets: stringArray;
  outdated: any;
  persistentHigh: any;
  profileName?: string | null | void;
  rising: any;
  timeSinceBgMinutes: number;
}

/** 'EditProfileTemplate' return type */
export interface IEditProfileTemplateResult {
  alarmsEnabled: boolean;
  analyserHighLevelAbs: number;
  analyserHighLevelBad: number;
  analyserHighLevelRel: number;
  analyserLowLevelAbs: number;
  analyserLowLevelRel: number;
  analyserTimeSinceBgMinutes: number;
  id: string;
  notificationTargets: stringArray;
  profileName: string | null;
  situationBadHigh: any;
  situationBadLow: any;
  situationCompressionLow: any;
  situationCriticalOutdated: any;
  situationFalling: any;
  situationHigh: any;
  situationLow: any;
  situationMissingDayInsulin: any;
  situationOutdated: any;
  situationPersistentHigh: any;
  situationRising: any;
}

/** 'EditProfileTemplate' query type */
export interface IEditProfileTemplateQuery {
  params: IEditProfileTemplateParams;
  result: IEditProfileTemplateResult;
}

const editProfileTemplateIR: any = {"usedParamSet":{"profileName":true,"alarmsEnabled":true,"notificationTargets":true,"highLevelRel":true,"highLevelAbs":true,"highLevelBad":true,"lowLevelRel":true,"lowLevelAbs":true,"timeSinceBgMinutes":true,"outdated":true,"criticalOutdated":true,"falling":true,"rising":true,"low":true,"badLow":true,"compressionLow":true,"high":true,"badHigh":true,"persistentHigh":true,"missingDayInsulin":true,"id":true},"params":[{"name":"profileName","required":false,"transform":{"type":"scalar"},"locs":[{"a":46,"b":57}]},{"name":"alarmsEnabled","required":true,"transform":{"type":"scalar"},"locs":[{"a":79,"b":93}]},{"name":"notificationTargets","required":true,"transform":{"type":"scalar"},"locs":[{"a":121,"b":141}]},{"name":"highLevelRel","required":true,"transform":{"type":"scalar"},"locs":[{"a":172,"b":185}]},{"name":"highLevelAbs","required":true,"transform":{"type":"scalar"},"locs":[{"a":216,"b":229}]},{"name":"highLevelBad","required":true,"transform":{"type":"scalar"},"locs":[{"a":260,"b":273}]},{"name":"lowLevelRel","required":true,"transform":{"type":"scalar"},"locs":[{"a":303,"b":315}]},{"name":"lowLevelAbs","required":true,"transform":{"type":"scalar"},"locs":[{"a":345,"b":357}]},{"name":"timeSinceBgMinutes","required":true,"transform":{"type":"scalar"},"locs":[{"a":395,"b":414}]},{"name":"outdated","required":true,"transform":{"type":"scalar"},"locs":[{"a":440,"b":449}]},{"name":"criticalOutdated","required":true,"transform":{"type":"scalar"},"locs":[{"a":484,"b":501}]},{"name":"falling","required":true,"transform":{"type":"scalar"},"locs":[{"a":526,"b":534}]},{"name":"rising","required":true,"transform":{"type":"scalar"},"locs":[{"a":558,"b":565}]},{"name":"low","required":true,"transform":{"type":"scalar"},"locs":[{"a":586,"b":590}]},{"name":"badLow","required":true,"transform":{"type":"scalar"},"locs":[{"a":615,"b":622}]},{"name":"compressionLow","required":true,"transform":{"type":"scalar"},"locs":[{"a":655,"b":670}]},{"name":"high","required":true,"transform":{"type":"scalar"},"locs":[{"a":692,"b":697}]},{"name":"badHigh","required":true,"transform":{"type":"scalar"},"locs":[{"a":723,"b":731}]},{"name":"persistentHigh","required":true,"transform":{"type":"scalar"},"locs":[{"a":764,"b":779}]},{"name":"missingDayInsulin","required":true,"transform":{"type":"scalar"},"locs":[{"a":816,"b":834}]},{"name":"id","required":true,"transform":{"type":"scalar"},"locs":[{"a":847,"b":850}]}],"statement":"UPDATE profile_templates SET\n  profile_name = :profileName,\n  alarms_enabled = :alarmsEnabled!,\n  notification_targets = :notificationTargets!,\n  analyser_high_level_rel = :highLevelRel!,\n  analyser_high_level_abs = :highLevelAbs!,\n  analyser_high_level_bad = :highLevelBad!,\n  analyser_low_level_rel = :lowLevelRel!,\n  analyser_low_level_abs = :lowLevelAbs!,\n  analyser_time_since_bg_minutes = :timeSinceBgMinutes!,\n  situation_outdated = :outdated!,\n  situation_critical_outdated = :criticalOutdated!,\n  situation_falling = :falling!,\n  situation_rising = :rising!,\n  situation_low = :low!,\n  situation_bad_low = :badLow!,\n  situation_compression_low = :compressionLow!,\n  situation_high = :high!,\n  situation_bad_high = :badHigh!,\n  situation_persistent_high = :persistentHigh!,\n  situation_missing_day_insulin = :missingDayInsulin!\nWHERE id = :id!\nRETURNING *"};

/**
 * Query generated from SQL:
 * ```
 * UPDATE profile_templates SET
 *   profile_name = :profileName,
 *   alarms_enabled = :alarmsEnabled!,
 *   notification_targets = :notificationTargets!,
 *   analyser_high_level_rel = :highLevelRel!,
 *   analyser_high_level_abs = :highLevelAbs!,
 *   analyser_high_level_bad = :highLevelBad!,
 *   analyser_low_level_rel = :lowLevelRel!,
 *   analyser_low_level_abs = :lowLevelAbs!,
 *   analyser_time_since_bg_minutes = :timeSinceBgMinutes!,
 *   situation_outdated = :outdated!,
 *   situation_critical_outdated = :criticalOutdated!,
 *   situation_falling = :falling!,
 *   situation_rising = :rising!,
 *   situation_low = :low!,
 *   situation_bad_low = :badLow!,
 *   situation_compression_low = :compressionLow!,
 *   situation_high = :high!,
 *   situation_bad_high = :badHigh!,
 *   situation_persistent_high = :persistentHigh!,
 *   situation_missing_day_insulin = :missingDayInsulin!
 * WHERE id = :id!
 * RETURNING *
 * ```
 */
export const editProfileTemplate = new PreparedQuery<IEditProfileTemplateParams,IEditProfileTemplateResult>(editProfileTemplateIR);


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
  analyserSettings: any | null;
  id: string;
  isActive: boolean;
  notificationTargets: stringArray;
  profileName: string | null;
  situationSettings: any | null;
}

/** 'GetProfiles' query type */
export interface IGetProfilesQuery {
  params: IGetProfilesParams;
  result: IGetProfilesResult;
}

const getProfilesIR: any = {"usedParamSet":{"templateId":true,"onlyActive":true},"params":[{"name":"templateId","required":false,"transform":{"type":"scalar"},"locs":[{"a":1273,"b":1283},{"a":1302,"b":1312}]},{"name":"onlyActive","required":false,"transform":{"type":"scalar"},"locs":[{"a":1345,"b":1355}]}],"statement":"WITH\n  most_recent_activation_query AS (\n    SELECT profile_template_id\n    FROM profile_activations\n    ORDER BY activated_at DESC\n    LIMIT 1\n  )\nSELECT\n  profile_templates.id AS id,\n  profile_name,\n  alarms_enabled,\n  notification_targets,\n  most_recent_activation_query.profile_template_id IS NOT NULL AS \"is_active!\",\n  json_build_object(\n    'highLevelRel', analyser_high_level_rel,\n    'highLevelAbs', analyser_high_level_abs,\n    'highLevelBad', analyser_high_level_bad,\n    'lowLevelRel', analyser_low_level_rel,\n    'lowLevelAbs', analyser_low_level_abs,\n    'timeSinceBgMinutes', analyser_time_since_bg_minutes\n  ) AS analyser_settings,\n  json_build_object(\n    'outdated', situation_outdated,\n    'criticalOutdated', situation_critical_outdated,\n    'falling', situation_falling,\n    'rising', situation_rising,\n    'low', situation_low,\n    'badLow', situation_bad_low,\n    'compressionLow', situation_compression_low,\n    'high', situation_high,\n    'badHigh', situation_bad_high,\n    'persistentHigh', situation_persistent_high,\n    'missingDayInsulin', situation_missing_day_insulin\n  ) AS situation_settings\nFROM profile_templates\n  LEFT JOIN most_recent_activation_query ON most_recent_activation_query.profile_template_id = profile_templates.id\nWHERE\n  (:templateId::uuid IS NULL OR :templateId = profile_templates.id) AND\n  (:onlyActive::bool IS NULL OR (most_recent_activation_query.profile_template_id IS NOT NULL))"};

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
 *   profile_templates.id AS id,
 *   profile_name,
 *   alarms_enabled,
 *   notification_targets,
 *   most_recent_activation_query.profile_template_id IS NOT NULL AS "is_active!",
 *   json_build_object(
 *     'highLevelRel', analyser_high_level_rel,
 *     'highLevelAbs', analyser_high_level_abs,
 *     'highLevelBad', analyser_high_level_bad,
 *     'lowLevelRel', analyser_low_level_rel,
 *     'lowLevelAbs', analyser_low_level_abs,
 *     'timeSinceBgMinutes', analyser_time_since_bg_minutes
 *   ) AS analyser_settings,
 *   json_build_object(
 *     'outdated', situation_outdated,
 *     'criticalOutdated', situation_critical_outdated,
 *     'falling', situation_falling,
 *     'rising', situation_rising,
 *     'low', situation_low,
 *     'badLow', situation_bad_low,
 *     'compressionLow', situation_compression_low,
 *     'high', situation_high,
 *     'badHigh', situation_bad_high,
 *     'persistentHigh', situation_persistent_high,
 *     'missingDayInsulin', situation_missing_day_insulin
 *   ) AS situation_settings
 * FROM profile_templates
 *   LEFT JOIN most_recent_activation_query ON most_recent_activation_query.profile_template_id = profile_templates.id
 * WHERE
 *   (:templateId::uuid IS NULL OR :templateId = profile_templates.id) AND
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


/** 'GetProfileActivationById' parameters type */
export interface IGetProfileActivationByIdParams {
  id: string;
}

/** 'GetProfileActivationById' return type */
export interface IGetProfileActivationByIdResult {
  activatedAt: string;
  deactivatedAt: string | null;
  id: string;
  profileName: string | null;
  profileTemplateId: string;
  repeatTimeInLocalTimezone: string | null;
}

/** 'GetProfileActivationById' query type */
export interface IGetProfileActivationByIdQuery {
  params: IGetProfileActivationByIdParams;
  result: IGetProfileActivationByIdResult;
}

const getProfileActivationByIdIR: any = {"usedParamSet":{"id":true},"params":[{"name":"id","required":true,"transform":{"type":"scalar"},"locs":[{"a":329,"b":332}]}],"statement":"SELECT\n  profile_activations.id,\n  profile_activations.profile_template_id,\n  profile_templates.profile_name,\n  activated_at,\n  repeat_time_in_local_timezone,\n  deactivated_at\nFROM profile_activations\n  INNER JOIN profile_templates ON profile_templates.id = profile_activations.profile_template_id\nWHERE profile_activations.id = :id!"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *   profile_activations.id,
 *   profile_activations.profile_template_id,
 *   profile_templates.profile_name,
 *   activated_at,
 *   repeat_time_in_local_timezone,
 *   deactivated_at
 * FROM profile_activations
 *   INNER JOIN profile_templates ON profile_templates.id = profile_activations.profile_template_id
 * WHERE profile_activations.id = :id!
 * ```
 */
export const getProfileActivationById = new PreparedQuery<IGetProfileActivationByIdParams,IGetProfileActivationByIdResult>(getProfileActivationByIdIR);


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


