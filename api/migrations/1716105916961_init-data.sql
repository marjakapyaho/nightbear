-- Up Migration

-- Journal row that's required by cronjobs runner:
INSERT INTO cronjobs_journal
  DEFAULT VALUES;

-- Initial day profile:
INSERT INTO profile_templates (
  profile_name,
  repeat_time_in_local_timezone,
  alarms_enabled,
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
) VALUES (
  'Day',
  '8:00',
  TRUE,
  '{marjan_iphone,jrwNexus5,bear-phone}',
  6.5,
  9.0,
  14.0,
  8.0,
  4.3,
  35,
  '{"snoozeMinutes": 60, "escalationAfterMinutes": [10, 20, 20]}',
  '{"snoozeMinutes": 10, "escalationAfterMinutes": [10, 10, 10]}',
  '{"snoozeMinutes": 20, "escalationAfterMinutes": [10, 10, 10]}',
  '{"snoozeMinutes": 50, "escalationAfterMinutes": [10, 15, 15]}',
  '{"snoozeMinutes": 15, "escalationAfterMinutes": [5, 10, 10]}',
  '{"snoozeMinutes": 15, "escalationAfterMinutes": [5, 10, 10]}',
  '{"snoozeMinutes": 60, "escalationAfterMinutes": [10, 20, 20]}',
  '{"snoozeMinutes": 30, "escalationAfterMinutes": [10, 20, 20]}',
  '{"snoozeMinutes": 60, "escalationAfterMinutes": [10, 20, 20]}',
  '{"snoozeMinutes": 120, "escalationAfterMinutes": [10, 20, 20]}',
  '{"snoozeMinutes": 10, "escalationAfterMinutes": [15, 30, 30]}'
);

-- Initial night profile:
INSERT INTO profile_templates (
  profile_name,
  repeat_time_in_local_timezone,
  alarms_enabled,
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
) VALUES (
  'Night',
  '23:00',
  TRUE,
  '{bear-phone,marjan_iphone,jrwNexus5}',
  9.6,
  9.6,
  13.0,
  3.9,
  3.9,
  60,
  '{"snoozeMinutes": 60, "escalationAfterMinutes": [5, 20, 20]}',
  '{"snoozeMinutes": 10, "escalationAfterMinutes": [5, 10, 10]}',
  '{"snoozeMinutes": 20, "escalationAfterMinutes": [5, 10, 10]}',
  '{"snoozeMinutes": 50, "escalationAfterMinutes": [5, 15, 15]}',
  '{"snoozeMinutes": 12, "escalationAfterMinutes": [5, 10, 10]}',
  '{"snoozeMinutes": 12, "escalationAfterMinutes": [5, 10, 10]}',
  '{"snoozeMinutes": 90, "escalationAfterMinutes": [5, 20, 20]}',
  '{"snoozeMinutes": 10, "escalationAfterMinutes": [5, 20, 20]}',
  '{"snoozeMinutes": 60, "escalationAfterMinutes": [5, 20, 20]}',
  '{"snoozeMinutes": 120, "escalationAfterMinutes": [5, 20, 20]}',
  '{"snoozeMinutes": 10, "escalationAfterMinutes": [15, 30, 30]}'
);

-- Leave day as the currently active profile:
INSERT INTO profile_activations (
  profile_template_id,
  activated_at,
  deactivated_at
) VALUES (
  (SELECT id FROM profile_templates WHERE profile_name = 'Day'),
  '1970-01-01 00:00:00.000000 +00:00',
  NULL
);
