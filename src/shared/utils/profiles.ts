import { Profile } from 'shared/types/profiles';

export const DEFAULT_ALARM_SETTINGS = {
  escalationAfterMinutes: [5, 10, 10],
  snoozeMinutes: 10,
};

export const DEFAULT_TARGETS = ['bear-phone', 'marjan_iphone', 'jrwNexus5'];

export const PROFILE_BASE = {
  isActive: true,
  alarmsEnabled: true,
  analyserSettings: {
    highLevelRel: 8,
    highLevelAbs: 10,
    highLevelBad: 14,
    lowLevelRel: 6,
    lowLevelAbs: 4,
    timeSinceBgMinutes: 30,
  },
  situationSettings: {
    outdated: DEFAULT_ALARM_SETTINGS,
    criticalOutdated: DEFAULT_ALARM_SETTINGS,
    falling: DEFAULT_ALARM_SETTINGS,
    rising: DEFAULT_ALARM_SETTINGS,
    low: DEFAULT_ALARM_SETTINGS,
    badLow: DEFAULT_ALARM_SETTINGS,
    compressionLow: DEFAULT_ALARM_SETTINGS,
    high: DEFAULT_ALARM_SETTINGS,
    badHigh: DEFAULT_ALARM_SETTINGS,
    persistentHigh: DEFAULT_ALARM_SETTINGS,
    missingDayInsulin: DEFAULT_ALARM_SETTINGS,
  },
  notificationTargets: DEFAULT_TARGETS,
};

export const getActiveProfile = (profiles?: Profile[]) => {
  return profiles?.find(profile => profile.isActive);
};
