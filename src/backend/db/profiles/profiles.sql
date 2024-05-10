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
RETURNING *;

/* @name createSituationSettings */
INSERT INTO situation_settings (
  OUTDATED_escalation_after_minutes,
  OUTDATED_snooze_minutes,
  CRITICAL_OUTDATED_escalation_after_minutes,
  CRITICAL_OUTDATED_snooze_minutes,
  FALLING_escalation_after_minutes,
  FALLING_snooze_minutes,
  RISING_escalation_after_minutes,
  RISING_snooze_minutes,
  LOW_escalation_after_minutes,
  LOW_snooze_minutes,
  BAD_LOW_escalation_after_minutes,
  BAD_LOW_snooze_minutes,
  HIGH_escalation_after_minutes,
  HIGH_snooze_minutes,
  BAD_HIGH_escalation_after_minutes,
  BAD_HIGH_snooze_minutes,
  PERSISTENT_HIGH_escalation_after_minutes,
  PERSISTENT_HIGH_snooze_minutes
)
VALUES (
   :outdatedEscalationAfterMinutes!,
   :outdatedSnoozeMinutes!,
   :criticalOutdatedEscalationAfterMinutes!,
   :criticalOutdatedSnoozeMinutes!,
   :fallingEscalationAfterMinutes!,
   :fallingSnoozeMinutes!,
   :risingEscalationAfterMinutes!,
   :risingSnoozeMinutes!,
   :lowEscalationAfterMinutes!,
   :lowSnoozeMinutes!,
   :badLowEscalationAfterMinutes!,
   :badLowSnoozeMinutes!,
   :highEscalationAfterMinutes!,
   :highSnoozeMinutes!,
   :badHighEscalationAfterMinutes!,
   :badHighSnoozeMinutes!,
   :persistentHighEscalationAfterMinutes!,
   :persistentHighSnoozeMinutes!
)
RETURNING *;

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
        'id', analyser_settings.id::VARCHAR,
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
        'id', situation_settings.id::VARCHAR,
        'outdatedEscalationAfterMinutes', situation_settings.outdated_escalation_after_minutes,
        'outdatedSnoozeMinutes', situation_settings.outdated_snooze_minutes,
        'criticalOutdatedEscalationAfterMinutes', situation_settings.critical_outdated_escalation_after_minutes,
        'criticalOutdatedSnoozeMinutes', situation_settings.critical_outdated_snooze_minutes,
        'fallingEscalationAfterMinutes', situation_settings.falling_escalation_after_minutes,
        'fallingSnoozeMinutes', situation_settings.falling_snooze_minutes,
        'risingEscalationAfterMinutes', situation_settings.rising_escalation_after_minutes,
        'risingSnoozeMinutes', situation_settings.rising_snooze_minutes,
        'lowEscalationAfterMinutes', situation_settings.low_escalation_after_minutes,
        'lowSnoozeMinutes', situation_settings.low_snooze_minutes,
        'badLowEscalationAfterMinutes', situation_settings.bad_low_escalation_after_minutes,
        'badLowSnoozeMinutes', situation_settings.bad_low_snooze_minutes,
        'highEscalationAfterMinutes', situation_settings.high_escalation_after_minutes,
        'highSnoozeMinutes', situation_settings.high_snooze_minutes,
        'badHighEscalationAfterMinutes', situation_settings.bad_high_escalation_after_minutes,
        'badHighSnoozeMinutes', situation_settings.bad_high_snooze_minutes,
        'persistentHighEscalationAfterMinutes', situation_settings.persistent_high_escalation_after_minutes,
        'persistentHighSnoozeMinutes', situation_settings.persistent_high_snooze_minutes
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
