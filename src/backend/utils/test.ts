import { NO_DEXCOM_SHARE } from 'backend/share/dexcom-share-client';
import { createDbClient } from 'backend/utils/db';
import 'mocha';
import { NO_PUSHOVER } from 'shared/alarms/pushoverClient';
import PouchDB from 'shared/storage/PouchDb';
import { Context, Request } from 'shared/storage/api';
import { createCouchDbStorage } from 'shared/storage/couchDbStorage';
import { NO_STORAGE, Storage } from 'shared/storage/storage';
import { generateUuid } from 'shared/utils/id';
import { NO_LOGGING } from 'shared/utils/logging';

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
  const { DATABASE_URL } = process.env;
  if (!DATABASE_URL) throw new Error(`Missing required env-var: DATABASE_URL`);
  if (!DATABASE_URL.match('test')) throw new Error(`DATABASE_URL being used in tests doesn't look like a test URL`);
  return {
    httpPort: 80,
    timestamp,
    log: NO_LOGGING,
    storage,
    db: createDbClient(DATABASE_URL),
    pushover: NO_PUSHOVER,
    dexcomShare: NO_DEXCOM_SHARE,
    config: {
      DEXCOM_SHARE_LOGIN_ATTEMPT_DELAY_MINUTES: 60,
    },
  };
}

export const ERASED_UUID = '<uuid-erased-in-test-code>';
