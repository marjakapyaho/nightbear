import {
  AnalyserSettings,
  Profile,
  ProfileActivation,
  SituationSettings,
} from 'shared/types/profiles';
import { HOUR_IN_MS } from 'shared/utils/calculations';

export const mockAnalyserSettings: AnalyserSettings = {
  id: '1',
  highLevelRel: 8,
  highLevelAbs: 10,
  highLevelBad: 14,
  lowLevelRel: 6,
  lowLevelAbs: 4,
  lowLevelBad: 3,
  timeSinceBgMinutes: 30,
  highCorrectionSuppressionMinutes: 60,
};

export const mockSituationSettings: SituationSettings[] = [
  {
    situation: 'OUTDATED',
    escalationAfterMinutes: [10],
    snoozeMinutes: 15,
  },
  {
    situation: 'CRITICAL_OUTDATED',
    escalationAfterMinutes: [10],
    snoozeMinutes: 15,
  },
  {
    situation: 'FALLING',
    escalationAfterMinutes: [10],
    snoozeMinutes: 15,
  },
  {
    situation: 'RISING',
    escalationAfterMinutes: [10],
    snoozeMinutes: 15,
  },
  {
    situation: 'LOW',
    escalationAfterMinutes: [10],
    snoozeMinutes: 15,
  },
  {
    situation: 'BAD_LOW',
    escalationAfterMinutes: [10],
    snoozeMinutes: 15,
  },
  {
    situation: 'COMPRESSION_LOW',
    escalationAfterMinutes: [10],
    snoozeMinutes: 15,
  },
  {
    situation: 'HIGH',
    escalationAfterMinutes: [10],
    snoozeMinutes: 15,
  },
  {
    situation: 'BAD_HIGH',
    escalationAfterMinutes: [10],
    snoozeMinutes: 15,
  },
  {
    situation: 'PERSISTENT_HIGH',
    escalationAfterMinutes: [10],
    snoozeMinutes: 15,
  },
];

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
