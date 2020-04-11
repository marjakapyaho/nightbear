import { assert } from 'chai';
import { NO_PUSHOVER } from 'core/alarms/pushover-client';
import { Context, Request } from 'core/models/api';
import { ActiveProfile, DexcomCalibration, MeterEntry, Model, SavedProfile } from 'core/models/model';
import { createCouchDbStorage, getModelRef } from 'core/storage/couchDbStorage';
import PouchDB from 'core/storage/PouchDb';
import { NO_STORAGE, Storage } from 'core/storage/storage';
import { generateUuid } from 'core/utils/id';
import { NO_LOGGING } from 'core/utils/logging';
import 'mocha';

export type TestSuite = (storage: () => Storage) => void;

const TEMP_DB_PREFIX = 'temp_test_db_';

export function withStorage(suite: TestSuite) {
  withInMemoryStorage(suite);
  withCouchDbStorage(suite);
}

function withInMemoryStorage(suite: TestSuite) {
  describe('with in-memory storage', () => {
    suite(() => {
      const dbUrl = TEMP_DB_PREFIX + generateUuid();
      return createCouchDbStorage(dbUrl, { adapter: 'memory' });
    });
  });
}

function withCouchDbStorage(suite: TestSuite) {
  const NIGHTBEAR_TEST_DB_URL = process.env.NIGHTBEAR_TEST_DB_URL || null; // e.g. "http://admin:admin@localhost:5984/"
  (NIGHTBEAR_TEST_DB_URL ? describe : xdescribe)('with CouchDB storage', () => {
    let createdDbs: string[] = [];
    suite(() => {
      const dbUrl = NIGHTBEAR_TEST_DB_URL + TEMP_DB_PREFIX + generateUuid();
      createdDbs.push(dbUrl);
      return createCouchDbStorage(dbUrl);
    });
    after(() => {
      return Promise.all(createdDbs.map(dbUrl => new PouchDB(dbUrl).destroy())).then(() => {
        createdDbs = [];
      });
    });
  });
}

export function createTestRequest(): Request {
  return {
    requestId: '',
    requestMethod: '',
    requestPath: '',
    requestParams: {},
    requestHeaders: {},
    requestBody: {},
  };
}

export function createTestContext(storage = NO_STORAGE, timestamp = () => 1508672249758): Context {
  return {
    httpPort: 80,
    timestamp,
    log: NO_LOGGING,
    storage,
    pushover: NO_PUSHOVER,
  };
}

// This is just a common occurrence in test code
export function saveAndAssociate(context: Context, cal: DexcomCalibration, entry: MeterEntry) {
  return Promise.resolve()
    .then(() => context.storage.saveModel(entry))
    .then(entry => ({ ...cal, meterEntries: [getModelRef(entry)] }))
    .then(context.storage.saveModel);
}

// Asserts deep equality of 2 Models, ignoring their metadata
export function assertEqualWithoutMeta(
  actual: Model[] | Model | undefined,
  expected: Model[] | Model | undefined,
): void {
  const withoutMeta = (model?: Model) =>
    typeof model === 'undefined' ? undefined : Object.assign({}, model, { modelMeta: undefined });
  assert.deepEqual(
    Array.isArray(actual) ? actual.map(withoutMeta) : withoutMeta(actual),
    Array.isArray(expected) ? expected.map(withoutMeta) : withoutMeta(expected),
  );
}

export const ERASED_UUID = '<uuid-erased-in-test-code>';

// Erasing the ID's of Model(s) makes it simpler to compare them, when the ID's aren't important
export function eraseModelUuid<T extends Model>(model: T): T {
  return { ...model, modelUuid: ERASED_UUID };
}

export function savedProfile(profileName: string): SavedProfile {
  const { alarmsEnabled, analyserSettings, alarmSettings, pushoverLevels } = activeProfile(profileName, Date.now()); // note: the timestamp value given here should be irrelevant, since it's not actually visible on the SavedProfile interface
  return {
    modelType: 'SavedProfile',
    modelUuid: generateUuid(),
    profileName,
    alarmsEnabled,
    analyserSettings,
    alarmSettings,
    pushoverLevels,
  };
}

export function activeProfile(profileName: string, timestamp: number, isEnabled: boolean = true): ActiveProfile {
  return {
    modelType: 'ActiveProfile',
    modelUuid: generateUuid(),
    timestamp,
    profileName,
    alarmsEnabled: !!isEnabled,
    analyserSettings: {
      HIGH_LEVEL_REL: 10,
      TIME_SINCE_BG_LIMIT: 20,
      BATTERY_LIMIT: 30,
      LOW_LEVEL_ABS: 5,
      ALARM_EXPIRE: 20,
      LOW_LEVEL_REL: 9,
      LOW_LEVEL_BAD: 3,
      HIGH_LEVEL_ABS: 15,
      HIGH_LEVEL_BAD: 18,
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
      BAD_HIGH: {
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
      BAD_LOW: {
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
