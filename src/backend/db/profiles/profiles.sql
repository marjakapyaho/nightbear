/* @name createProfileTemplate */
INSERT INTO profile_templates (
  profile_name,
  alarms_enabled,
  repeat_time_in_local_timezone,
  notification_targets,
  analyser_high_level_rel,
  analyser_high_level_abs,
  analyser_high_level_bad,
  analyser_low_level_rel,
  analyser_low_level_abs,
  analyser_time_since_bg_minutes,
  situation_outdated,
  situation_critical_outdated,
  situation_falling,
  situation_rising,
  situation_low,
  situation_bad_low,
  situation_compression_low,
  situation_high,
  situation_bad_high,
  situation_persistent_high,
  situation_missing_day_insulin
)
VALUES (
  :profileName,
  :alarmsEnabled!,
  :repeatTimeInLocalTimezone,
  :notificationTargets!,
  :highLevelRel!,
  :highLevelAbs!,
  :highLevelBad!,
  :lowLevelRel!,
  :lowLevelAbs!,
  :timeSinceBgMinutes!,
  :outdated!,
  :criticalOutdated!,
  :falling!,
  :rising!,
  :low!,
  :badLow!,
  :compressionLow!,
  :high!,
  :badHigh!,
  :persistentHigh!,
  :missingDayInsulin!
)
RETURNING *;

/* @name editProfileTemplate */
UPDATE profile_templates SET
  profile_name = :profileName,
  alarms_enabled = :alarmsEnabled!,
  repeat_time_in_local_timezone = :repeatTimeInLocalTimezone,
  notification_targets = :notificationTargets!,
  analyser_high_level_rel = :highLevelRel!,
  analyser_high_level_abs = :highLevelAbs!,
  analyser_high_level_bad = :highLevelBad!,
  analyser_low_level_rel = :lowLevelRel!,
  analyser_low_level_abs = :lowLevelAbs!,
  analyser_time_since_bg_minutes = :timeSinceBgMinutes!,
  situation_outdated = :outdated!,
  situation_critical_outdated = :criticalOutdated!,
  situation_falling = :falling!,
  situation_rising = :rising!,
  situation_low = :low!,
  situation_bad_low = :badLow!,
  situation_compression_low = :compressionLow!,
  situation_high = :high!,
  situation_bad_high = :badHigh!,
  situation_persistent_high = :persistentHigh!,
  situation_missing_day_insulin = :missingDayInsulin!
WHERE id = :id!
RETURNING *;

/* @name getProfiles */
WITH
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
  repeat_time_in_local_timezone,
  notification_targets,
  most_recent_activation_query.profile_template_id IS NOT NULL AS "is_active!",
  json_build_object(
    'highLevelRel', analyser_high_level_rel,
    'highLevelAbs', analyser_high_level_abs,
    'highLevelBad', analyser_high_level_bad,
    'lowLevelRel', analyser_low_level_rel,
    'lowLevelAbs', analyser_low_level_abs,
    'timeSinceBgMinutes', analyser_time_since_bg_minutes
  ) AS analyser_settings,
  json_build_object(
    'outdated', situation_outdated,
    'criticalOutdated', situation_critical_outdated,
    'falling', situation_falling,
    'rising', situation_rising,
    'low', situation_low,
    'badLow', situation_bad_low,
    'compressionLow', situation_compression_low,
    'high', situation_high,
    'badHigh', situation_bad_high,
    'persistentHigh', situation_persistent_high,
    'missingDayInsulin', situation_missing_day_insulin
  ) AS situation_settings
FROM profile_templates
  LEFT JOIN most_recent_activation_query ON most_recent_activation_query.profile_template_id = profile_templates.id
WHERE
  (profile_name IS NOT NULL OR (most_recent_activation_query.profile_template_id IS NOT NULL)) AND
  (:templateId::uuid IS NULL OR :templateId = profile_templates.id) AND
  (:onlyActive::bool IS NULL OR (most_recent_activation_query.profile_template_id IS NOT NULL));

/* @name createProfileActivation */
INSERT INTO profile_activations (
  profile_template_id,
  activated_at,
  deactivated_at
)
VALUES (
 :profileTemplateId!,
 :activatedAt!,
 :deactivatedAt
)
RETURNING *;

/* @name getLatestProfileActivation */
SELECT
  profile_activations.id,
  profile_template_id,
  activated_at,
  deactivated_at,
  profile_templates.profile_name
FROM profile_activations
  INNER JOIN profile_templates ON profile_templates.id = profile_activations.profile_template_id
ORDER BY activated_at DESC
LIMIT 1;

/* @name getProfileActivationById */
SELECT
  profile_activations.id,
  profile_template_id,
  activated_at,
  deactivated_at,
  profile_templates.profile_name
FROM profile_activations
  INNER JOIN profile_templates ON profile_templates.id = profile_activations.profile_template_id
WHERE profile_activations.id = :id!;
