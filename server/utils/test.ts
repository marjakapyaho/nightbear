import { Context } from '../models/api';
import { NO_LOGGING } from './logging';
import { NO_STORAGE } from '../storage/storage';
import { Profile } from '../models/model';

export function createTestContext(): Context {
  return {
    httpPort: 80,
    timestamp: () => 1508672249758,
    log: NO_LOGGING,
    storage: NO_STORAGE,
  };
}

export function activeProfile(name: string): Profile {
  return {
    modelType: 'Profile',
    profileName: name,
    activatedAtUtc: {
      hours: 11,
      minutes: 0,
    },
    analyserSettings: {
      HIGH_LEVEL_REL: 10,
      TIME_SINCE_BG_LIMIT: 20,
      BATTERY_LIMIT: 30,
      LOW_LEVEL_ABS: 5,
      ALARM_EXPIRE: 20,
      LOW_LEVEL_REL: 9,
      HIGH_LEVEL_ABS: 15,
      ALARM_RETRY: 2,
    },
    alarmSettings: {
      OUTDATED: {
        escalationAfterMinutes: [10, 20, 20],
        snoozeMinutes: 120,
      },
      HIGH: {
        escalationAfterMinutes: [10, 20, 20],
        snoozeMinutes: 90,
      },
      PERSISTENT_HIGH: {
        escalationAfterMinutes: [10, 20, 20],
        snoozeMinutes: 90,
      },
      LOW: {
        escalationAfterMinutes: [6, 7, 10],
        snoozeMinutes: 15,
      },
      FALLING: {
        escalationAfterMinutes: [8, 15, 15],
        snoozeMinutes: 10,
      },
      RISING: {
        escalationAfterMinutes: [10, 20, 20],
        snoozeMinutes: 10,
      },
      BATTERY: {
        escalationAfterMinutes: [10, 20, 20],
        snoozeMinutes: 60,
      },
      COMPRESSION_LOW: {
        escalationAfterMinutes: [10, 20, 20],
        snoozeMinutes: 60,
      },
    },
    pushoverLevels: [],
  };
}
