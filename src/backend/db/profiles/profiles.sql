/* @name createProfileTemplate */
INSERT INTO profile_templates (
    profile_name,
    alarms_enabled,
    analyser_settings_id,
    situation_settings_id,
    notification_targets
)
VALUES (
  :profileName,
  :alarmsEnabled!,
  :analyserSettingsId!,
  :situationSettingsId!,
  :notificationTargets!
)
RETURNING *;

/* @name createAnalyserSettings */
INSERT INTO analyser_settings (
  high_level_rel,
  high_level_abs,
  high_level_bad,
  low_level_rel,
  low_level_abs,
  time_since_bg_minutes
)
VALUES (
  :highLevelRel!,
  :highLevelAbs!,
  :highLevelBad!,
  :lowLevelRel!,
  :lowLevelAbs!,
  :timeSinceBgMinutes!
)
RETURNING analyser_settings.id;

/* @name createSituationSettings */
INSERT INTO situation_settings (
  outdated,
  critical_outdated,
  falling,
  rising,
  low,
  bad_low,
  compression_low,
  high,
  bad_high,
  persistent_high
)
VALUES (
   :outdated!,
   :criticalOutdated!,
   :falling!,
   :rising!,
   :low!,
   :badLow!,
   :compressionLow!,
   :high!,
   :badHigh!,
   :persistentHigh!
)
RETURNING situation_settings.id;

/* @name createProfileActivation */
INSERT INTO profile_activations (
  profile_template_id,
  activated_at,
  repeat_time_in_local_timezone,
  deactivated_at
)
VALUES (
   :profileTemplateId!,
   :activatedAt!,
   :repeatTimeInLocalTimezone,
   :deactivatedAt
 )
RETURNING *;

/*
  @name getProfiles
*/
WITH
  analyser_settings_query AS (
    SELECT
      analyser_settings.id,
      json_build_object(
        'highLevelRel', analyser_settings.high_level_rel,
        'highLevelAbs', analyser_settings.high_level_abs,
        'highLevelBad', analyser_settings.high_level_bad,
        'lowLevelRel', analyser_settings.low_level_rel,
        'lowLevelAbs', analyser_settings.low_level_abs,
        'timeSinceBgMinutes', analyser_settings.time_since_bg_minutes
      ) AS analyser_settings
    FROM analyser_settings
  ),
  situation_settings_query AS (
    SELECT
      situation_settings.id,
      json_build_object(
        'outdated', situation_settings.outdated,
        'criticalOutdated', situation_settings.critical_outdated,
        'falling', situation_settings.falling,
        'rising', situation_settings.rising,
        'low', situation_settings.low,
        'badLow', situation_settings.bad_low,
        'compressionLow', situation_settings.compression_low,
        'high', situation_settings.high,
        'badHigh', situation_settings.bad_high,
        'persistentHigh', situation_settings.persistent_high
      ) AS situation_settings
    FROM situation_settings
  ),
  most_recent_activation_query AS (
    SELECT profile_template_id
    FROM profile_activations
    ORDER BY activated_at DESC
    LIMIT 1
  )
SELECT
  profile_templates.id AS id,
  profile_name,
  alarms_enabled,
  notification_targets,
  most_recent_activation_query.profile_template_id IS NOT NULL AS "is_active!",
  analyser_settings_query.analyser_settings AS analyser_settings,
  situation_settings_query.situation_settings AS situation_settings
FROM profile_templates
  INNER JOIN analyser_settings_query ON analyser_settings_query.id = profile_templates.analyser_settings_id
  INNER JOIN situation_settings_query ON situation_settings_query.id = profile_templates.situation_settings_id
  LEFT JOIN most_recent_activation_query ON most_recent_activation_query.profile_template_id = profile_templates.id
WHERE
  (:templateId::uuid IS NULL OR :templateId = profile_templates.id) OR
  (:onlyActive::bool IS NULL OR (most_recent_activation_query.profile_template_id IS NOT NULL));

/*
  @name getRelevantProfileActivations
*/
WITH
  most_recent_activation_query AS (
    SELECT profile_template_id
    FROM profile_activations
    ORDER BY activated_at DESC
    LIMIT 1
  )
SELECT
  profile_activations.id,
  profile_activations.profile_template_id,
  profile_templates.profile_name,
  activated_at,
  repeat_time_in_local_timezone,
  deactivated_at
FROM profile_activations
  INNER JOIN profile_templates ON profile_templates.id = profile_activations.profile_template_id
  LEFT JOIN most_recent_activation_query ON most_recent_activation_query.profile_template_id = profile_templates.id
WHERE repeat_time_in_local_timezone IS NOT NULL OR most_recent_activation_query.profile_template_id IS NOT NULL;

/* @name reactivateProfileActivation */
UPDATE profile_activations SET
  activated_at = CURRENT_TIMESTAMP
WHERE id = :id!
RETURNING *;
