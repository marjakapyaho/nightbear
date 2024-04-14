/* @name createProfileTemplate */
INSERT INTO profile_templates (
    profile_name,
    alarms_enabled,
    analyser_settings_id,
    alarm_settings_id
)
VALUES (
  :profileName!,
  :alarmsEnabled!,
  :analyserSettingsId!,
  :alarmSettingsId!
)
RETURNING *;

/* @name createAnalyserSettings */
INSERT INTO analyser_settings (
  high_level_rel,
  high_level_abs,
  high_level_bad,
  low_level_rel,
  low_level_abs,
  low_level_bad,
  time_since_bg_minutes,
  high_correction_suppression_minutes
)
VALUES (
  :highLevelRel!,
  :highLevelAbs!,
  :highLevelBad!,
  :lowLevelRel!,
  :lowLevelAbs!,
  :lowLevelBad!,
  :timeSinceBgMinutes!,
  :highCorrectionSuppressionMinutes!
)
RETURNING *;

/* @name createSituationSettings */
INSERT INTO situation_settings (
  escalation_after_minutes,
  snooze_minutes
)
VALUES (
  :escalationAfterMinutes!,
  :snoozeMinutes!
)
RETURNING *;

/* @name createAlarmSettings */
INSERT INTO alarm_settings (
  outdated,
  falling,
  rising,
  low,
  badLow,
  high,
  bad_high,
  persistent_high,
  compression_low
)
VALUES (
   :outdated!,
   :falling!,
   :rising!,
   :low!,
   :badLow!,
   :high!,
   :badHigh!,
   :persistentHigh!,
   :compressionLow!
)
RETURNING *;


/* @name createPushoverTargets */
INSERT INTO pushover_levels (
  profile_template_id,
  name
)
VALUES (
   :profileTemplateId!,
   :name!
)
RETURNING *;
