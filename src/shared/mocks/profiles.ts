import {
  AlarmSettings,
  AnalyserSettings,
  Profile,
  ProfileActivation,
  SituationSettings,
} from 'shared/types/profiles';

export const mockAnalyserSettings: AnalyserSettings = {
  highLevelRel: 8,
  highLevelAbs: 10,
  highLevelBad: 14,
  lowLevelRel: 6,
  lowLevelAbs: 4,
  timeSinceBgMinutes: 30,
};

export const mockAlarmSettings: AlarmSettings = {
  escalationAfterMinutes: [10, 10],
  snoozeMinutes: 15,
};

export const mockSituationSettings: SituationSettings = {
  outdated: mockAlarmSettings,
  criticalOutdated: mockAlarmSettings,
  falling: mockAlarmSettings,
  rising: mockAlarmSettings,
  low: mockAlarmSettings,
  badLow: mockAlarmSettings,
  compressionLow: mockAlarmSettings,
  high: mockAlarmSettings,
  badHigh: mockAlarmSettings,
  persistentHigh: mockAlarmSettings,
  missingDayInsulin: mockAlarmSettings,
};

export const mockProfiles: Profile[] = [
  {
    id: '1',
    profileName: 'Day',
    isActive: true,
    alarmsEnabled: true,
    repeatTimeInLocalTimezone: '8:00',
    analyserSettings: mockAnalyserSettings,
    situationSettings: mockSituationSettings,
    notificationTargets: ['first', 'second'],
  },
  {
    id: '2',
    profileName: 'Night',
    isActive: false,
    alarmsEnabled: true,
    repeatTimeInLocalTimezone: '20:00',
    analyserSettings: mockAnalyserSettings,
    situationSettings: mockSituationSettings,
    notificationTargets: ['first', 'second'],
  },
];

export const mockProfileActivations: ProfileActivation[] = [
  {
    id: '123',
    profileTemplateId: '1',
    profileName: 'Day',
    activatedAt: '2024-04-27T08:00:00.123Z',
  },
  {
    id: '456',
    profileTemplateId: '2',
    profileName: 'Night',
    activatedAt: '2024-04-26T20:00:00.123Z',
  },
];
