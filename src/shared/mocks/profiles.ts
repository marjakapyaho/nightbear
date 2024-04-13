import {
  AlarmSettings,
  AnalyserSettings,
  Profile,
  ProfileActivation,
  PushoverLevel,
  SituationSettings,
} from 'shared/types/profiles';
import { HOUR_IN_MS } from 'shared/utils/calculations';

export const mockAnalyserSettings: AnalyserSettings = {
  id: '1',
  highLevelRel: 8,
  highLevelAbs: 10,
  highLevelBad: 13,
  lowLevelRel: 5,
  lowLevelAbs: 4,
  lowLevelBad: 3.3,
  timeSinceBgMinutes: 30,
  highCorrectionSuppressionMinutes: 120,
};

export const mockSituationSettings: SituationSettings = {
  id: '1',
  escalationAfterMinutes: 10,
  snoozeMinutes: 15,
};

export const mockAlarmSettings: AlarmSettings = {
  id: '1',
  outdated: mockSituationSettings,
  falling: mockSituationSettings,
  rising: mockSituationSettings,
  low: mockSituationSettings,
  badLow: mockSituationSettings,
  compressionLow: mockSituationSettings,
  high: mockSituationSettings,
  badHigh: mockSituationSettings,
  persistentHigh: mockSituationSettings,
};

export const mockPushoverLevels: PushoverLevel[] = [
  {
    id: '1',
    name: 'first-test-phone',
  },
  {
    id: '2',
    name: 'second-test-phone',
  },
  {
    id: '3',
    name: 'third-test-phone',
  },
  {
    id: '4',
    name: 'fourth-test-phone',
  },
  {
    id: '5',
    name: 'fifth-test-phone',
  },
];

export const mockProfiles: Profile[] = [
  {
    id: '1',
    profileName: 'Day',
    isActive: true,
    alarmsEnabled: true,
    analyserSettings: mockAnalyserSettings,
    alarmSettings: mockAlarmSettings,
    pushoverLevels: mockPushoverLevels,
  },
  {
    id: '2',
    profileName: 'Night',
    isActive: false,
    alarmsEnabled: true,
    analyserSettings: mockAnalyserSettings,
    alarmSettings: mockAlarmSettings,
    pushoverLevels: mockPushoverLevels,
  },
];

export const mockProfileActivations: ProfileActivation[] = [
  {
    id: '1',
    profileName: 'Day',
    activatedAt: Date.now() - HOUR_IN_MS,
    repeatTimeInLocalTimezone: '08:00',
  },
  {
    id: '1',
    profileName: 'Meeting',
    activatedAt: Date.now() - 5 * HOUR_IN_MS,
    deactivatedAt: Date.now() - HOUR_IN_MS,
  },
];
