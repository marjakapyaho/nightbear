/** Types generated for queries found in "src/backend/db/profiles/db.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** 'CreateProfileTemplate' parameters type */
export interface ICreateProfileTemplateParams {
  alarmsEnabled: boolean;
  alarmSettingsId: string;
  analyserSettingsId: string;
  profileName: string;
}

/** 'CreateProfileTemplate' return type */
export interface ICreateProfileTemplateResult {
  alarmsEnabled: boolean;
  alarmSettingsId: string;
  analyserSettingsId: string;
  id: string;
  profileName: string | null;
}

/** 'CreateProfileTemplate' query type */
export interface ICreateProfileTemplateQuery {
  params: ICreateProfileTemplateParams;
  result: ICreateProfileTemplateResult;
}

const createProfileTemplateIR: any = {"usedParamSet":{"profileName":true,"alarmsEnabled":true,"analyserSettingsId":true,"alarmSettingsId":true},"params":[{"name":"profileName","required":true,"transform":{"type":"scalar"},"locs":[{"a":131,"b":143}]},{"name":"alarmsEnabled","required":true,"transform":{"type":"scalar"},"locs":[{"a":148,"b":162}]},{"name":"analyserSettingsId","required":true,"transform":{"type":"scalar"},"locs":[{"a":167,"b":186}]},{"name":"alarmSettingsId","required":true,"transform":{"type":"scalar"},"locs":[{"a":191,"b":207}]}],"statement":"INSERT INTO profile_templates (\n    profile_name,\n    alarms_enabled,\n    analyser_settings_id,\n    alarm_settings_id\n)\nVALUES (\n  :profileName!,\n  :alarmsEnabled!,\n  :analyserSettingsId!,\n  :alarmSettingsId!\n)\nRETURNING *"};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO profile_templates (
 *     profile_name,
 *     alarms_enabled,
 *     analyser_settings_id,
 *     alarm_settings_id
 * )
 * VALUES (
 *   :profileName!,
 *   :alarmsEnabled!,
 *   :analyserSettingsId!,
 *   :alarmSettingsId!
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
  snoozeMinutes: number;
}

/** 'CreateSituationSettings' return type */
export interface ICreateSituationSettingsResult {
  escalationAfterMinutes: number;
  id: string;
  snoozeMinutes: number;
}

/** 'CreateSituationSettings' query type */
export interface ICreateSituationSettingsQuery {
  params: ICreateSituationSettingsParams;
  result: ICreateSituationSettingsResult;
}

const createSituationSettingsIR: any = {"usedParamSet":{"escalationAfterMinutes":true,"snoozeMinutes":true},"params":[{"name":"escalationAfterMinutes","required":true,"transform":{"type":"scalar"},"locs":[{"a":91,"b":114}]},{"name":"snoozeMinutes","required":true,"transform":{"type":"scalar"},"locs":[{"a":119,"b":133}]}],"statement":"INSERT INTO situation_settings (\n  escalation_after_minutes,\n  snooze_minutes\n)\nVALUES (\n  :escalationAfterMinutes!,\n  :snoozeMinutes!\n)\nRETURNING *"};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO situation_settings (
 *   escalation_after_minutes,
 *   snooze_minutes
 * )
 * VALUES (
 *   :escalationAfterMinutes!,
 *   :snoozeMinutes!
 * )
 * RETURNING *
 * ```
 */
export const createSituationSettings = new PreparedQuery<ICreateSituationSettingsParams,ICreateSituationSettingsResult>(createSituationSettingsIR);


/** 'CreateAlarmSettings' parameters type */
export interface ICreateAlarmSettingsParams {
  badHigh: string;
  badLow: string;
  compressionLow: string;
  falling: string;
  high: string;
  low: string;
  outdated: string;
  persistentHigh: string;
  rising: string;
}

/** 'CreateAlarmSettings' return type */
export interface ICreateAlarmSettingsResult {
  badHigh: string;
  badlow: string;
  compressionLow: string;
  falling: string;
  high: string;
  id: string;
  low: string;
  outdated: string;
  persistentHigh: string;
  rising: string;
}

/** 'CreateAlarmSettings' query type */
export interface ICreateAlarmSettingsQuery {
  params: ICreateAlarmSettingsParams;
  result: ICreateAlarmSettingsResult;
}

const createAlarmSettingsIR: any = {"usedParamSet":{"outdated":true,"falling":true,"rising":true,"low":true,"badLow":true,"high":true,"badHigh":true,"persistentHigh":true,"compressionLow":true},"params":[{"name":"outdated","required":true,"transform":{"type":"scalar"},"locs":[{"a":150,"b":159}]},{"name":"falling","required":true,"transform":{"type":"scalar"},"locs":[{"a":165,"b":173}]},{"name":"rising","required":true,"transform":{"type":"scalar"},"locs":[{"a":179,"b":186}]},{"name":"low","required":true,"transform":{"type":"scalar"},"locs":[{"a":192,"b":196}]},{"name":"badLow","required":true,"transform":{"type":"scalar"},"locs":[{"a":202,"b":209}]},{"name":"high","required":true,"transform":{"type":"scalar"},"locs":[{"a":215,"b":220}]},{"name":"badHigh","required":true,"transform":{"type":"scalar"},"locs":[{"a":226,"b":234}]},{"name":"persistentHigh","required":true,"transform":{"type":"scalar"},"locs":[{"a":240,"b":255}]},{"name":"compressionLow","required":true,"transform":{"type":"scalar"},"locs":[{"a":261,"b":276}]}],"statement":"INSERT INTO alarm_settings (\n  outdated,\n  falling,\n  rising,\n  low,\n  badLow,\n  high,\n  bad_high,\n  persistent_high,\n  compression_low\n)\nVALUES (\n   :outdated!,\n   :falling!,\n   :rising!,\n   :low!,\n   :badLow!,\n   :high!,\n   :badHigh!,\n   :persistentHigh!,\n   :compressionLow!\n)\nRETURNING *"};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO alarm_settings (
 *   outdated,
 *   falling,
 *   rising,
 *   low,
 *   badLow,
 *   high,
 *   bad_high,
 *   persistent_high,
 *   compression_low
 * )
 * VALUES (
 *    :outdated!,
 *    :falling!,
 *    :rising!,
 *    :low!,
 *    :badLow!,
 *    :high!,
 *    :badHigh!,
 *    :persistentHigh!,
 *    :compressionLow!
 * )
 * RETURNING *
 * ```
 */
export const createAlarmSettings = new PreparedQuery<ICreateAlarmSettingsParams,ICreateAlarmSettingsResult>(createAlarmSettingsIR);


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


