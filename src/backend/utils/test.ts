import { NO_PUSHOVER } from 'backend/cronjobs/alarms/pushoverClient';
import { NO_DEXCOM_SHARE } from 'backend/cronjobs/dexcom/dexcom-share-client';
import { NO_LOGGING } from 'backend/utils/logging';
import { Context } from './api';
import { createDbClient } from './db';
import { mockNow } from 'shared/mocks/dates';

export const createTestContext = (timestamp = () => mockNow): Context => {
  return {
    httpPort: 80,
    timestamp,
    log: NO_LOGGING,
    db: createDbClient('postgres://nightbear:nightbear@localhost:25432/nightbear_test'), // needs to match docker-compose.yml
    storage: null,
    pushover: NO_PUSHOVER,
    dexcomShare: NO_DEXCOM_SHARE,
    config: {},
  };
};
