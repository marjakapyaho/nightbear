/* @name createProfileTemplate */
INSERT INTO profile_templates (
    profile_name,
    alarms_enabled,
    analyser_settings_id
)
VALUES (
  :profileName!,
  :alarmsEnabled!,
  :analyserSettingsId!
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
  situation,
  profile_template_id,
  escalation_after_minutes,
  snooze_minutes
)
VALUES (
   :situation!,
   :profileTemplateId!,
   :escalationAfterMinutes!,
   :snoozeMinutes!
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
