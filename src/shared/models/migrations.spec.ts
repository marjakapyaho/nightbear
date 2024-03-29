import { SavedProfile, ActiveProfile } from 'shared/models/model';
import 'mocha';
import { assertEqualWithoutMeta } from 'backend/utils/test';
import { migrateModelIfNeeded } from 'shared/models/migrations';

describe('shared/models/migrations', () => {
  describe('from modelVersion 1', () => {
    it('works for SavedProfile', () => {
      // This was type-checked against old version of the relevant Model:
      const old: any = {
        modelType: 'SavedProfile',
        modelUuid: '863700b3-2511-406a-973b-19d7d519859b',
        profileName: 'day',
        activatedAtUtc: {
          hours: 11,
          minutes: 0,
        },
        alarmsEnabled: true,
        analyserSettings: {
          HIGH_LEVEL_REL: 6.5,
          TIME_SINCE_BG_LIMIT: 20,
          BATTERY_LIMIT: 30,
          LOW_LEVEL_ABS: 4.7,
          ALARM_EXPIRE: 10800,
          LOW_LEVEL_REL: 9,
          HIGH_LEVEL_ABS: 8,
          ALARM_RETRY: 30,
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
            escalationAfterMinutes: [10, 10, 10],
            snoozeMinutes: 20,
          },
          FALLING: {
            escalationAfterMinutes: [10, 10, 10],
            snoozeMinutes: 15,
          },
          RISING: {
            escalationAfterMinutes: [10, 15, 15],
            snoozeMinutes: 20,
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
      // This is type-checked against the relevant Model, so it's guaranteed to remain current:
      const current: SavedProfile = {
        modelType: 'SavedProfile',
        modelUuid: '863700b3-2511-406a-973b-19d7d519859b',
        profileName: 'day',
        activatedAtUtc: {
          hours: 11,
          minutes: 0,
        },
        alarmsEnabled: true,
        analyserSettings: {
          HIGH_LEVEL_REL: 6.5,
          TIME_SINCE_BG_LIMIT: 20,
          BATTERY_LIMIT: 30,
          LOW_LEVEL_BAD: 3, // NEW IN THIS MODEL VERSION
          LOW_LEVEL_ABS: 4.7,
          ALARM_EXPIRE: 10800,
          LOW_LEVEL_REL: 9,
          HIGH_LEVEL_ABS: 8,
          HIGH_LEVEL_BAD: 15, // NEW IN THIS MODEL VERSION
          ALARM_RETRY: 30,
          HIGH_CORRECTION_SUPPRESSION_WINDOW: 135, // NEW 17.1.2022
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
          // NEW IN THIS MODEL VERSION:
          BAD_HIGH: {
            escalationAfterMinutes: [10, 20, 20],
            snoozeMinutes: 90,
          },
          PERSISTENT_HIGH: {
            escalationAfterMinutes: [10, 20, 20],
            snoozeMinutes: 90,
          },
          LOW: {
            escalationAfterMinutes: [10, 10, 10],
            snoozeMinutes: 20,
          },
          // NEW IN THIS MODEL VERSION:
          BAD_LOW: {
            escalationAfterMinutes: [10, 10, 10],
            snoozeMinutes: 20,
          },
          FALLING: {
            escalationAfterMinutes: [10, 10, 10],
            snoozeMinutes: 15,
          },
          RISING: {
            escalationAfterMinutes: [10, 15, 15],
            snoozeMinutes: 20,
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
      assertEqualWithoutMeta(migrateModelIfNeeded(old, 1), current);
    });

    it('works for ActiveProfile', () => {
      // This was type-checked against old version of the relevant Model:
      const old: any = {
        modelType: 'ActiveProfile',
        modelUuid: '863700b3-2511-406a-973b-19d7d519859b',
        timestamp: 1586609596636,
        profileName: 'day',
        alarmsEnabled: true,
        analyserSettings: {
          HIGH_LEVEL_REL: 6.5,
          TIME_SINCE_BG_LIMIT: 20,
          BATTERY_LIMIT: 30,
          LOW_LEVEL_ABS: 4.7,
          ALARM_EXPIRE: 10800,
          LOW_LEVEL_REL: 9,
          HIGH_LEVEL_ABS: 8,
          ALARM_RETRY: 30,
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
            escalationAfterMinutes: [10, 10, 10],
            snoozeMinutes: 20,
          },
          FALLING: {
            escalationAfterMinutes: [10, 10, 10],
            snoozeMinutes: 15,
          },
          RISING: {
            escalationAfterMinutes: [10, 15, 15],
            snoozeMinutes: 20,
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
      // This is type-checked against the relevant Model, so it's guaranteed to remain current:
      const current: ActiveProfile = {
        modelType: 'ActiveProfile',
        modelUuid: '863700b3-2511-406a-973b-19d7d519859b',
        timestamp: 1586609596636,
        profileName: 'day',
        alarmsEnabled: true,
        analyserSettings: {
          HIGH_LEVEL_REL: 6.5,
          TIME_SINCE_BG_LIMIT: 20,
          BATTERY_LIMIT: 30,
          LOW_LEVEL_BAD: 3, // NEW IN THIS MODEL VERSION
          LOW_LEVEL_ABS: 4.7,
          ALARM_EXPIRE: 10800,
          LOW_LEVEL_REL: 9,
          HIGH_LEVEL_ABS: 8,
          HIGH_LEVEL_BAD: 15, // NEW IN THIS MODEL VERSION
          ALARM_RETRY: 30,
          HIGH_CORRECTION_SUPPRESSION_WINDOW: 135, // NEW 17.1.2022
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
          // NEW IN THIS MODEL VERSION:
          BAD_HIGH: {
            escalationAfterMinutes: [10, 20, 20],
            snoozeMinutes: 90,
          },
          PERSISTENT_HIGH: {
            escalationAfterMinutes: [10, 20, 20],
            snoozeMinutes: 90,
          },
          LOW: {
            escalationAfterMinutes: [10, 10, 10],
            snoozeMinutes: 20,
          },
          // NEW IN THIS MODEL VERSION:
          BAD_LOW: {
            escalationAfterMinutes: [10, 10, 10],
            snoozeMinutes: 20,
          },
          FALLING: {
            escalationAfterMinutes: [10, 10, 10],
            snoozeMinutes: 15,
          },
          RISING: {
            escalationAfterMinutes: [10, 15, 15],
            snoozeMinutes: 20,
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
      assertEqualWithoutMeta(migrateModelIfNeeded(old, 1), current);
    });
  });
});
