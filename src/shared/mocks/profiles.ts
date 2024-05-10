import {
  AlarmSettings,
  AnalyserSettings,
  Profile,
  ProfileActivation,
  SituationSettings,
} from 'shared/types/profiles';

export const mockAnalyserSettings: AnalyserSettings = {
  id: '1',
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
  id: '1',
  OUTDATED: mockAlarmSettings,
  CRITICAL_OUTDATED: mockAlarmSettings,
  FALLING: mockAlarmSettings,
  RISING: mockAlarmSettings,
  LOW: mockAlarmSettings,
  BAD_LOW: mockAlarmSettings,
  COMPRESSION_LOW: mockAlarmSettings,
  HIGH: mockAlarmSettings,
  BAD_HIGH: mockAlarmSettings,
  PERSISTENT_HIGH: mockAlarmSettings,
};

export const mockProfiles: Profile[] = [
  {
    id: '1',
    profileName: 'Day',
    isActive: true,
    alarmsEnabled: true,
    analyserSettings: mockAnalyserSettings,
    situationSettings: mockSituationSettings,
    notificationTargets: ['first', 'second'],
  },
  {
    id: '2',
    profileName: 'Night',
    isActive: false,
    alarmsEnabled: true,
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
    repeatTimeInLocalTimezone: '8:00',
  },
  {
    id: '456',
    profileTemplateId: '2',
    profileName: 'Night',
    activatedAt: '2024-04-26T20:00:00.123Z',
    repeatTimeInLocalTimezone: '20:00',
  },
];
