export type AnalyserSettings = {
  id: string;
  highLevelRel: number;
  highLevelAbs: number;
  highLevelBad: number;
  lowLevelRel: number;
  lowLevelAbs: number;
  lowLevelBad: number;
  timeSinceBgMinutes: number;
  highCorrectionSuppressionMinutes: number;
};

export type SituationSettings = {
  id: string;
  escalationAfterMinutes: number;
  snoozeMinutes: number;
};

export type AlarmSettings = {
  id: string;
  outdated: SituationSettings;
  falling: SituationSettings;
  rising: SituationSettings;
  low: SituationSettings;
  badLow: SituationSettings;
  compressionLow: SituationSettings;
  high: SituationSettings;
  badHigh: SituationSettings;
  persistentHigh: SituationSettings;
};

export type PushoverLevel = {
  id: string;
  name: string;
};

export type Profile = {
  id: string;
  profileName: string;
  isActive: boolean;
  alarmsEnabled: boolean;
  analyserSettings: AnalyserSettings;
  alarmSettings: AlarmSettings;
  pushoverLevels: PushoverLevel[];
};

export type ProfileActivation = {
  id: string;
  profileName: string;
  activatedAt: number;
  repeatTimeInLocalTimezone?: string;
  deactivatedAt?: number;
};
