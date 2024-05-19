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
  repeatTimeInLocalTimezone?: string | null | void;
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
  repeatTimeInLocalTimezone: string | null;
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

const createProfileTemplateIR: any = {"usedParamSet":{"profileName":true,"alarmsEnabled":true,"repeatTimeInLocalTimezone":true,"notificationTargets":true,"highLevelRel":true,"highLevelAbs":true,"highLevelBad":true,"lowLevelRel":true,"lowLevelAbs":true,"timeSinceBgMinutes":true,"outdated":true,"criticalOutdated":true,"falling":true,"rising":true,"low":true,"badLow":true,"compressionLow":true,"high":true,"badHigh":true,"persistentHigh":true,"missingDayInsulin":true},"params":[{"name":"profileName","required":false,"transform":{"type":"scalar"},"locs":[{"a":565,"b":576}]},{"name":"alarmsEnabled","required":true,"transform":{"type":"scalar"},"locs":[{"a":581,"b":595}]},{"name":"repeatTimeInLocalTimezone","required":false,"transform":{"type":"scalar"},"locs":[{"a":600,"b":625}]},{"name":"notificationTargets","required":true,"transform":{"type":"scalar"},"locs":[{"a":630,"b":650}]},{"name":"highLevelRel","required":true,"transform":{"type":"scalar"},"locs":[{"a":655,"b":668}]},{"name":"highLevelAbs","required":true,"transform":{"type":"scalar"},"locs":[{"a":673,"b":686}]},{"name":"highLevelBad","required":true,"transform":{"type":"scalar"},"locs":[{"a":691,"b":704}]},{"name":"lowLevelRel","required":true,"transform":{"type":"scalar"},"locs":[{"a":709,"b":721}]},{"name":"lowLevelAbs","required":true,"transform":{"type":"scalar"},"locs":[{"a":726,"b":738}]},{"name":"timeSinceBgMinutes","required":true,"transform":{"type":"scalar"},"locs":[{"a":743,"b":762}]},{"name":"outdated","required":true,"transform":{"type":"scalar"},"locs":[{"a":767,"b":776}]},{"name":"criticalOutdated","required":true,"transform":{"type":"scalar"},"locs":[{"a":781,"b":798}]},{"name":"falling","required":true,"transform":{"type":"scalar"},"locs":[{"a":803,"b":811}]},{"name":"rising","required":true,"transform":{"type":"scalar"},"locs":[{"a":816,"b":823}]},{"name":"low","required":true,"transform":{"type":"scalar"},"locs":[{"a":828,"b":832}]},{"name":"badLow","required":true,"transform":{"type":"scalar"},"locs":[{"a":837,"b":844}]},{"name":"compressionLow","required":true,"transform":{"type":"scalar"},"locs":[{"a":849,"b":864}]},{"name":"high","required":true,"transform":{"type":"scalar"},"locs":[{"a":869,"b":874}]},{"name":"badHigh","required":true,"transform":{"type":"scalar"},"locs":[{"a":879,"b":887}]},{"name":"persistentHigh","required":true,"transform":{"type":"scalar"},"locs":[{"a":892,"b":907}]},{"name":"missingDayInsulin","required":true,"transform":{"type":"scalar"},"locs":[{"a":912,"b":930}]}],"statement":"INSERT INTO profile_templates (\n  profile_name,\n  alarms_enabled,\n  repeat_time_in_local_timezone,\n  notification_targets,\n  analyser_high_level_rel,\n  analyser_high_level_abs,\n  analyser_high_level_bad,\n  analyser_low_level_rel,\n  analyser_low_level_abs,\n  analyser_time_since_bg_minutes,\n  situation_outdated,\n  situation_critical_outdated,\n  situation_falling,\n  situation_rising,\n  situation_low,\n  situation_bad_low,\n  situation_compression_low,\n  situation_high,\n  situation_bad_high,\n  situation_persistent_high,\n  situation_missing_day_insulin\n)\nVALUES (\n  :profileName,\n  :alarmsEnabled!,\n  :repeatTimeInLocalTimezone,\n  :notificationTargets!,\n  :highLevelRel!,\n  :highLevelAbs!,\n  :highLevelBad!,\n  :lowLevelRel!,\n  :lowLevelAbs!,\n  :timeSinceBgMinutes!,\n  :outdated!,\n  :criticalOutdated!,\n  :falling!,\n  :rising!,\n  :low!,\n  :badLow!,\n  :compressionLow!,\n  :high!,\n  :badHigh!,\n  :persistentHigh!,\n  :missingDayInsulin!\n)\nRETURNING *"};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO profile_templates (
 *   profile_name,
 *   alarms_enabled,
 *   repeat_time_in_local_timezone,
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
 *   :repeatTimeInLocalTimezone,
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
  repeatTimeInLocalTimezone?: string | null | void;
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
  repeatTimeInLocalTimezone: string | null;
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

const editProfileTemplateIR: any = {"usedParamSet":{"profileName":true,"alarmsEnabled":true,"repeatTimeInLocalTimezone":true,"notificationTargets":true,"highLevelRel":true,"highLevelAbs":true,"highLevelBad":true,"lowLevelRel":true,"lowLevelAbs":true,"timeSinceBgMinutes":true,"outdated":true,"criticalOutdated":true,"falling":true,"rising":true,"low":true,"badLow":true,"compressionLow":true,"high":true,"badHigh":true,"persistentHigh":true,"missingDayInsulin":true,"id":true},"params":[{"name":"profileName","required":false,"transform":{"type":"scalar"},"locs":[{"a":46,"b":57}]},{"name":"alarmsEnabled","required":true,"transform":{"type":"scalar"},"locs":[{"a":79,"b":93}]},{"name":"repeatTimeInLocalTimezone","required":false,"transform":{"type":"scalar"},"locs":[{"a":130,"b":155}]},{"name":"notificationTargets","required":true,"transform":{"type":"scalar"},"locs":[{"a":183,"b":203}]},{"name":"highLevelRel","required":true,"transform":{"type":"scalar"},"locs":[{"a":234,"b":247}]},{"name":"highLevelAbs","required":true,"transform":{"type":"scalar"},"locs":[{"a":278,"b":291}]},{"name":"highLevelBad","required":true,"transform":{"type":"scalar"},"locs":[{"a":322,"b":335}]},{"name":"lowLevelRel","required":true,"transform":{"type":"scalar"},"locs":[{"a":365,"b":377}]},{"name":"lowLevelAbs","required":true,"transform":{"type":"scalar"},"locs":[{"a":407,"b":419}]},{"name":"timeSinceBgMinutes","required":true,"transform":{"type":"scalar"},"locs":[{"a":457,"b":476}]},{"name":"outdated","required":true,"transform":{"type":"scalar"},"locs":[{"a":502,"b":511}]},{"name":"criticalOutdated","required":true,"transform":{"type":"scalar"},"locs":[{"a":546,"b":563}]},{"name":"falling","required":true,"transform":{"type":"scalar"},"locs":[{"a":588,"b":596}]},{"name":"rising","required":true,"transform":{"type":"scalar"},"locs":[{"a":620,"b":627}]},{"name":"low","required":true,"transform":{"type":"scalar"},"locs":[{"a":648,"b":652}]},{"name":"badLow","required":true,"transform":{"type":"scalar"},"locs":[{"a":677,"b":684}]},{"name":"compressionLow","required":true,"transform":{"type":"scalar"},"locs":[{"a":717,"b":732}]},{"name":"high","required":true,"transform":{"type":"scalar"},"locs":[{"a":754,"b":759}]},{"name":"badHigh","required":true,"transform":{"type":"scalar"},"locs":[{"a":785,"b":793}]},{"name":"persistentHigh","required":true,"transform":{"type":"scalar"},"locs":[{"a":826,"b":841}]},{"name":"missingDayInsulin","required":true,"transform":{"type":"scalar"},"locs":[{"a":878,"b":896}]},{"name":"id","required":true,"transform":{"type":"scalar"},"locs":[{"a":909,"b":912}]}],"statement":"UPDATE profile_templates SET\n  profile_name = :profileName,\n  alarms_enabled = :alarmsEnabled!,\n  repeat_time_in_local_timezone = :repeatTimeInLocalTimezone,\n  notification_targets = :notificationTargets!,\n  analyser_high_level_rel = :highLevelRel!,\n  analyser_high_level_abs = :highLevelAbs!,\n  analyser_high_level_bad = :highLevelBad!,\n  analyser_low_level_rel = :lowLevelRel!,\n  analyser_low_level_abs = :lowLevelAbs!,\n  analyser_time_since_bg_minutes = :timeSinceBgMinutes!,\n  situation_outdated = :outdated!,\n  situation_critical_outdated = :criticalOutdated!,\n  situation_falling = :falling!,\n  situation_rising = :rising!,\n  situation_low = :low!,\n  situation_bad_low = :badLow!,\n  situation_compression_low = :compressionLow!,\n  situation_high = :high!,\n  situation_bad_high = :badHigh!,\n  situation_persistent_high = :persistentHigh!,\n  situation_missing_day_insulin = :missingDayInsulin!\nWHERE id = :id!\nRETURNING *"};

/**
 * Query generated from SQL:
 * ```
 * UPDATE profile_templates SET
 *   profile_name = :profileName,
 *   alarms_enabled = :alarmsEnabled!,
 *   repeat_time_in_local_timezone = :repeatTimeInLocalTimezone,
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
  repeatTimeInLocalTimezone: string | null;
  situationSettings: any | null;
}

/** 'GetProfiles' query type */
export interface IGetProfilesQuery {
  params: IGetProfilesParams;
  result: IGetProfilesResult;
}

const getProfilesIR: any = {"usedParamSet":{"templateId":true,"onlyActive":true},"params":[{"name":"templateId","required":false,"transform":{"type":"scalar"},"locs":[{"a":1405,"b":1415},{"a":1434,"b":1444}]},{"name":"onlyActive","required":false,"transform":{"type":"scalar"},"locs":[{"a":1477,"b":1487}]}],"statement":"WITH\n  most_recent_activation_query AS (\n    SELECT profile_template_id\n    FROM profile_activations\n    ORDER BY activated_at DESC\n    LIMIT 1\n  )\nSELECT\n  profile_templates.id AS id,\n  profile_name,\n  alarms_enabled,\n  repeat_time_in_local_timezone,\n  notification_targets,\n  most_recent_activation_query.profile_template_id IS NOT NULL AS \"is_active!\",\n  json_build_object(\n    'highLevelRel', analyser_high_level_rel,\n    'highLevelAbs', analyser_high_level_abs,\n    'highLevelBad', analyser_high_level_bad,\n    'lowLevelRel', analyser_low_level_rel,\n    'lowLevelAbs', analyser_low_level_abs,\n    'timeSinceBgMinutes', analyser_time_since_bg_minutes\n  ) AS analyser_settings,\n  json_build_object(\n    'outdated', situation_outdated,\n    'criticalOutdated', situation_critical_outdated,\n    'falling', situation_falling,\n    'rising', situation_rising,\n    'low', situation_low,\n    'badLow', situation_bad_low,\n    'compressionLow', situation_compression_low,\n    'high', situation_high,\n    'badHigh', situation_bad_high,\n    'persistentHigh', situation_persistent_high,\n    'missingDayInsulin', situation_missing_day_insulin\n  ) AS situation_settings\nFROM profile_templates\n  LEFT JOIN most_recent_activation_query ON most_recent_activation_query.profile_template_id = profile_templates.id\nWHERE\n  (profile_name IS NOT NULL OR (most_recent_activation_query.profile_template_id IS NOT NULL)) AND\n  (:templateId::uuid IS NULL OR :templateId = profile_templates.id) AND\n  (:onlyActive::bool IS NULL OR (most_recent_activation_query.profile_template_id IS NOT NULL))"};

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
 *   repeat_time_in_local_timezone,
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
 *   (profile_name IS NOT NULL OR (most_recent_activation_query.profile_template_id IS NOT NULL)) AND
 *   (:templateId::uuid IS NULL OR :templateId = profile_templates.id) AND
 *   (:onlyActive::bool IS NULL OR (most_recent_activation_query.profile_template_id IS NOT NULL))
 * ```
 */
export const getProfiles = new PreparedQuery<IGetProfilesParams,IGetProfilesResult>(getProfilesIR);


/** 'CreateProfileActivation' parameters type */
export interface ICreateProfileActivationParams {
  activatedAt: string | Date;
  deactivatedAt?: string | Date | null | void;
  profileTemplateId: string;
}

/** 'CreateProfileActivation' return type */
export interface ICreateProfileActivationResult {
  activatedAt: string;
  deactivatedAt: string | null;
  id: string;
  profileTemplateId: string;
}

/** 'CreateProfileActivation' query type */
export interface ICreateProfileActivationQuery {
  params: ICreateProfileActivationParams;
  result: ICreateProfileActivationResult;
}

const createProfileActivationIR: any = {"usedParamSet":{"profileTemplateId":true,"activatedAt":true,"deactivatedAt":true},"params":[{"name":"profileTemplateId","required":true,"transform":{"type":"scalar"},"locs":[{"a":102,"b":120}]},{"name":"activatedAt","required":true,"transform":{"type":"scalar"},"locs":[{"a":124,"b":136}]},{"name":"deactivatedAt","required":false,"transform":{"type":"scalar"},"locs":[{"a":140,"b":153}]}],"statement":"INSERT INTO profile_activations (\n  profile_template_id,\n  activated_at,\n  deactivated_at\n)\nVALUES (\n :profileTemplateId!,\n :activatedAt!,\n :deactivatedAt\n)\nRETURNING *"};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO profile_activations (
 *   profile_template_id,
 *   activated_at,
 *   deactivated_at
 * )
 * VALUES (
 *  :profileTemplateId!,
 *  :activatedAt!,
 *  :deactivatedAt
 * )
 * RETURNING *
 * ```
 */
export const createProfileActivation = new PreparedQuery<ICreateProfileActivationParams,ICreateProfileActivationResult>(createProfileActivationIR);


/** 'GetLatestProfileActivation' parameters type */
export type IGetLatestProfileActivationParams = void;

/** 'GetLatestProfileActivation' return type */
export interface IGetLatestProfileActivationResult {
  activatedAt: string;
  deactivatedAt: string | null;
  id: string;
  profileName: string | null;
  profileTemplateId: string;
}

/** 'GetLatestProfileActivation' query type */
export interface IGetLatestProfileActivationQuery {
  params: IGetLatestProfileActivationParams;
  result: IGetLatestProfileActivationResult;
}

const getLatestProfileActivationIR: any = {"usedParamSet":{},"params":[],"statement":"SELECT\n  profile_activations.id,\n  profile_template_id,\n  activated_at,\n  deactivated_at,\n  profile_templates.profile_name\nFROM profile_activations\n  INNER JOIN profile_templates ON profile_templates.id = profile_activations.profile_template_id\nORDER BY activated_at DESC\nLIMIT 1"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *   profile_activations.id,
 *   profile_template_id,
 *   activated_at,
 *   deactivated_at,
 *   profile_templates.profile_name
 * FROM profile_activations
 *   INNER JOIN profile_templates ON profile_templates.id = profile_activations.profile_template_id
 * ORDER BY activated_at DESC
 * LIMIT 1
 * ```
 */
export const getLatestProfileActivation = new PreparedQuery<IGetLatestProfileActivationParams,IGetLatestProfileActivationResult>(getLatestProfileActivationIR);


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
}

/** 'GetProfileActivationById' query type */
export interface IGetProfileActivationByIdQuery {
  params: IGetProfileActivationByIdParams;
  result: IGetProfileActivationByIdResult;
}

const getProfileActivationByIdIR: any = {"usedParamSet":{"id":true},"params":[{"name":"id","required":true,"transform":{"type":"scalar"},"locs":[{"a":276,"b":279}]}],"statement":"SELECT\n  profile_activations.id,\n  profile_template_id,\n  activated_at,\n  deactivated_at,\n  profile_templates.profile_name\nFROM profile_activations\n  INNER JOIN profile_templates ON profile_templates.id = profile_activations.profile_template_id\nWHERE profile_activations.id = :id!"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *   profile_activations.id,
 *   profile_template_id,
 *   activated_at,
 *   deactivated_at,
 *   profile_templates.profile_name
 * FROM profile_activations
 *   INNER JOIN profile_templates ON profile_templates.id = profile_activations.profile_template_id
 * WHERE profile_activations.id = :id!
 * ```
 */
export const getProfileActivationById = new PreparedQuery<IGetProfileActivationByIdParams,IGetProfileActivationByIdResult>(getProfileActivationByIdIR);


/** 'GetProfileActivationsByTimestamp' parameters type */
export interface IGetProfileActivationsByTimestampParams {
  from: string | Date;
  to?: string | Date | null | void;
}

/** 'GetProfileActivationsByTimestamp' return type */
export interface IGetProfileActivationsByTimestampResult {
  activatedAt: string;
  deactivatedAt: string | null;
  id: string;
  profileName: string | null;
  profileTemplateId: string;
}

/** 'GetProfileActivationsByTimestamp' query type */
export interface IGetProfileActivationsByTimestampQuery {
  params: IGetProfileActivationsByTimestampParams;
  result: IGetProfileActivationsByTimestampResult;
}

const getProfileActivationsByTimestampIR: any = {"usedParamSet":{"from":true,"to":true},"params":[{"name":"from","required":true,"transform":{"type":"scalar"},"locs":[{"a":267,"b":272}]},{"name":"to","required":false,"transform":{"type":"scalar"},"locs":[{"a":303,"b":305}]}],"statement":"SELECT\n  profile_activations.id,\n  profile_template_id,\n  activated_at,\n  deactivated_at,\n  profile_templates.profile_name\nFROM profile_activations\n  INNER JOIN profile_templates ON profile_templates.id = profile_activations.profile_template_id\nWHERE activated_at >= :from! AND activated_at <= COALESCE(:to, CURRENT_TIMESTAMP)"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *   profile_activations.id,
 *   profile_template_id,
 *   activated_at,
 *   deactivated_at,
 *   profile_templates.profile_name
 * FROM profile_activations
 *   INNER JOIN profile_templates ON profile_templates.id = profile_activations.profile_template_id
 * WHERE activated_at >= :from! AND activated_at <= COALESCE(:to, CURRENT_TIMESTAMP)
 * ```
 */
export const getProfileActivationsByTimestamp = new PreparedQuery<IGetProfileActivationsByTimestampParams,IGetProfileActivationsByTimestampResult>(getProfileActivationsByTimestampIR);


