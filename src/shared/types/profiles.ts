import { Situation } from 'shared/types/analyser';

export type AnalyserSettings = {
  id: string;
  highLevelRel: number;
  highLevelAbs: number;
  highLevelBad: number;
  lowLevelRel: number;
  lowLevelAbs: number;
  timeSinceBgMinutes: number;
};

export type SituationSettings = {
  situation: Situation;
  escalationAfterMinutes: number[];
  snoozeMinutes: number;
};

export type Profile = {
  id: string;
  profileName: string | null;
  isActive: boolean;
  alarmsEnabled: boolean;
  analyserSettings: AnalyserSettings;
  situationSettings: SituationSettings[];
  notificationTargets: string[];
};

export type ProfileActivation = {
  id: string;
  profileTemplateId: string;
  profileName: string | null;
  activatedAt: string;
  repeatTimeInLocalTimezone?: string | null;
  deactivatedAt?: string | null;
};
