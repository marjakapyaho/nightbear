import { Situation } from './analyser';

export type Profile = {
  id: string;
  activatedAt?: number;
  profileName: string;
  alarmsEnabled: boolean;
  analyserSettings: {
    HIGH_LEVEL_REL: number;
    TIME_SINCE_BG_LIMIT: number; // minutes
    BATTERY_LIMIT: number;
    LOW_LEVEL_BAD: number;
    LOW_LEVEL_ABS: number;
    LOW_LEVEL_REL: number;
    HIGH_LEVEL_ABS: number;
    HIGH_LEVEL_BAD: number;
    ALARM_RETRY: number; // seconds, min in Pushover 30
    ALARM_EXPIRE: number; // seconds, max in Pushover 10800
    HIGH_CORRECTION_SUPPRESSION_WINDOW: number; // minutes
  };
  alarmSettings: {
    [S in Situation]: {
      escalationAfterMinutes: number[];
      snoozeMinutes: number;
    };
  };
  pushoverLevels: string[];
};

export type ActiveProfile = Profile & {
  timestamp: number;
};

export type SavedProfile = Profile & {
  activatedAtUtc?: {
    hours: number;
    minutes: number;
  };
};
