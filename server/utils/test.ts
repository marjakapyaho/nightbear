import 'mocha';
import PouchDB from 'core/storage/PouchDb';
import { assert } from 'chai';
import { Context, Request } from 'core/models/api';
import { NO_LOGGING } from './logging';
import { NO_STORAGE } from 'core/storage/storage';
import { NO_PUSHOVER } from 'core/alarms/pushover-client';
import { Profile, Model } from 'core/models/model';
import { Storage } from 'core/storage/storage';
import { createCouchDbStorage } from 'core/storage/couchDbStorage';
import { getUuid } from './uuid';

export type TestSuite = (storage: () => Storage) => void;

const TEMP_DB_PREFIX = 'temp_test_db_';

export function withStorage(suite: TestSuite) {
  withInMemoryStorage(suite);
  withCouchDbStorage(suite);
}

function withInMemoryStorage(suite: TestSuite) {
  describe('with in-memory storage', () => {
    suite(() => {
      const dbUrl = TEMP_DB_PREFIX + getUuid();
      return createCouchDbStorage(dbUrl, { adapter: 'memory' });
    });
  });
}

function withCouchDbStorage(suite: TestSuite) {
  const NIGHTBEAR_TEST_DB_URL = process.env.NIGHTBEAR_TEST_DB_URL || null; // e.g. "http://admin:admin@localhost:5984/"
  (NIGHTBEAR_TEST_DB_URL ? describe : xdescribe)('with CouchDB storage', () => {
    let createdDbs: string[] = [];
    suite(() => {
      const dbUrl = NIGHTBEAR_TEST_DB_URL + TEMP_DB_PREFIX + getUuid();
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

// Asserts deep equality of 2 Models, ignoring their metadata
export function assertEqualWithoutMeta(actual: Model, expected: Model): void;
export function assertEqualWithoutMeta(actual: Model[], expected: Model[]): void;
export function assertEqualWithoutMeta(actual: any, expected: any): void {
  const withoutMeta = (model: Model) => Object.assign({}, model, { modelMeta: undefined });
  if (Array.isArray(actual)) {
    assert.deepEqual(actual.map(withoutMeta), expected.map(withoutMeta));
  } else {
    assert.deepEqual(withoutMeta(actual), withoutMeta(expected));
  }
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
