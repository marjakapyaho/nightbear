import {
  AlarmSettings,
  AnalyserSettings,
  Profile,
  ProfileActivation,
  SituationSettings,
} from '../types'

export const mockAnalyserSettings: AnalyserSettings = {
  highLevelRel: 8,
  highLevelAbs: 10,
  highLevelBad: 14,
  lowLevelRel: 6,
  lowLevelAbs: 4,
  timeSinceBgMinutes: 30,
}

export const mockAlarmSettings: AlarmSettings = {
  escalationAfterMinutes: [10, 10],
  snoozeMinutes: 15,
}

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
}

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
]

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
]

export const actualNightProfile = {
  profileName: 'Night',
  isActive: true,
  alarmsEnabled: true,
  repeatTimeInLocalTimezone: '23:00',
  analyserSettings: {
    highLevelRel: 9.6,
    highLevelAbs: 9.6,
    highLevelBad: 13,
    lowLevelRel: 3.9,
    lowLevelAbs: 3.9,
    timeSinceBgMinutes: 60,
  },
  situationSettings: {
    outdated: {
      escalationAfterMinutes: [5, 20, 20],
      snoozeMinutes: 60,
    },
    criticalOutdated: {
      escalationAfterMinutes: [5, 10, 10],
      snoozeMinutes: 10,
    },
    falling: {
      escalationAfterMinutes: [5, 10, 10],
      snoozeMinutes: 20,
    },
    rising: {
      escalationAfterMinutes: [5, 15, 15],
      snoozeMinutes: 50,
    },
    low: {
      escalationAfterMinutes: [5, 10, 10],
      snoozeMinutes: 12,
    },
    badLow: {
      escalationAfterMinutes: [5, 10, 10],
      snoozeMinutes: 12,
    },
    compressionLow: {
      escalationAfterMinutes: [5, 20, 20],
      snoozeMinutes: 90,
    },
    high: {
      escalationAfterMinutes: [5, 20, 20],
      snoozeMinutes: 10,
    },
    badHigh: {
      escalationAfterMinutes: [5, 20, 20],
      snoozeMinutes: 60,
    },
    persistentHigh: {
      escalationAfterMinutes: [5, 20, 20],
      snoozeMinutes: 120,
    },
    missingDayInsulin: {
      escalationAfterMinutes: [15, 30, 30],
      snoozeMinutes: 10,
    },
  },
  notificationTargets: ['bear-phone', 'marjan_iphone', 'jrwNexus5'],
}

export const actualDayProfile = {
  profileName: 'Day',
  isActive: true,
  alarmsEnabled: true,
  repeatTimeInLocalTimezone: '8:00',
  analyserSettings: {
    highLevelRel: 6.5,
    highLevelAbs: 9,
    highLevelBad: 14,
    lowLevelRel: 8,
    lowLevelAbs: 4.3,
    timeSinceBgMinutes: 35,
  },
  situationSettings: {
    outdated: {
      escalationAfterMinutes: [10, 20, 20],
      snoozeMinutes: 60,
    },
    criticalOutdated: {
      escalationAfterMinutes: [10, 10, 10],
      snoozeMinutes: 10,
    },
    falling: {
      escalationAfterMinutes: [10, 10, 10],
      snoozeMinutes: 20,
    },
    rising: {
      escalationAfterMinutes: [10, 15, 15],
      snoozeMinutes: 50,
    },
    low: {
      escalationAfterMinutes: [5, 10, 10],
      snoozeMinutes: 15,
    },
    badLow: {
      escalationAfterMinutes: [5, 10, 10],
      snoozeMinutes: 15,
    },
    compressionLow: {
      escalationAfterMinutes: [10, 20, 20],
      snoozeMinutes: 60,
    },
    high: {
      escalationAfterMinutes: [10, 20, 20],
      snoozeMinutes: 30,
    },
    badHigh: {
      escalationAfterMinutes: [10, 20, 20],
      snoozeMinutes: 60,
    },
    persistentHigh: {
      escalationAfterMinutes: [10, 20, 20],
      snoozeMinutes: 120,
    },
    missingDayInsulin: {
      escalationAfterMinutes: [15, 30, 30],
      snoozeMinutes: 10,
    },
  },
  notificationTargets: ['marjan_iphone', 'jrwNexus5', 'bear-phone'],
}
