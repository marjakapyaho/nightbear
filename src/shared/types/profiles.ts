import { Situation } from 'shared/types/analyser';

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
  situation: Situation;
  escalationAfterMinutes: number[];
  snoozeMinutes: number;
};

export type Profile = {
  id: string;
  profileName: string;
  isActive: boolean;
  alarmsEnabled: boolean;
  analyserSettings: AnalyserSettings;
  situationSettings: SituationSettings[];
  notificationTargets: string[];
};

export type ProfileActivation = {
  id: string;
  profileTemplateId: string;
  profileName: string;
  activatedAt: string;
  repeatTimeInLocalTimezone?: string;
  deactivatedAt?: string;
};
