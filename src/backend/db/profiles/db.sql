/* @name createProfileTemplate */
INSERT INTO profile_templates (
    profile_name,
    alarms_enabled,
    analyser_settings_id,
    alarm_settings_id,
    pushover_levels_id
)
VALUES (
    :profileName!,
    :alarmsEnabled!,
    :analyserSettingsId!,
    :alarmSettingsId!,
    :pushoverLevelsId!,
)
RETURNING *;

/* @name createAnalyserSettings */
INSERT INTO analyser_settings (
    highLevelRel,
    highLevelAbs,
    highLevelBad,
    lowLevelRel,
    lowLevelAbs,
    lowLevelBad,
    timeSinceBgMinutes,
    highCorrectionSuppressionMinutes
)
VALUES (
   :highLevelRel!,
   :highLevelAbs!,
   :highLevelBad!,
   :lowLevelRel!,
   :lowLevelAbs!,
   :lowLevelBad!,
   :timeSinceBgMinutes!,
   :highCorrectionSuppressionMinutes!,
)
RETURNING *;

/* @name createSituationSettings */
INSERT INTO situation_settings (
    escalationAfterMinutes,
    snoozeMinutes
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
    badHigh,
    persistentHigh
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
)
RETURNING *;

/* @name createPushoverLevels */
INSERT INTO pushover_levels (
    level1,
    level2,
    level3,
    level4,
    level5
)
VALUES (
   :level1!,
   :level2!,
   :level3!,
   :level4!,
   :level5!
)
RETURNING *;

/* @name createPushoverTargets */
INSERT INTO pushover_targets (
    name
)
VALUES (
   :name!
)
RETURNING *;
