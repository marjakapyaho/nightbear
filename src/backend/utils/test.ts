import { NO_PUSHOVER } from 'backend/cronjobs/alarms/pushoverClient';
import { NO_DEXCOM_SHARE } from 'backend/cronjobs/dexcom/dexcom-share-client';
import { mockProfiles } from 'shared/mocks/profiles';
import { Profile } from 'shared/types/profiles';
import { NO_LOGGING } from 'shared/utils/logging';
import { Context } from './api';
import { createDbClient } from './db';

export const createTestContext = (timestamp = () => 1508672249758): Context => {
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

export const getMockActiveProfile = (profileName: string, alarmsEnabled?: boolean): Profile => ({
  ...mockProfiles[0],
  alarmsEnabled: alarmsEnabled || true,
  profileName,
});
