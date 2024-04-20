import { NO_PUSHOVER } from 'backend/cronjobs/alarms/pushoverClient';
import { NO_DEXCOM_SHARE } from 'backend/cronjobs/dexcom/dexcom-share-client';
import { mockProfiles } from 'shared/mocks/profiles';
import { Profile } from 'shared/types/profiles';
import { SensorEntry } from 'shared/types/timelineEntries';
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

export function generateSensorEntries({
  currentTimestamp,
  bloodGlucoseHistory,
  latestEntryAge = 0, // when omitted, "latest" entry is "now"
  intervalMinutes = 5, // default interval between entries is 5 minutes
}: {
  currentTimestamp: number;
  bloodGlucoseHistory: (number | null)[]; // nulls mean gaps in data
  latestEntryAge?: number; // how long ago (in minutes) was the last entry in the array
  intervalMinutes?: number; // interval in minutes between entries
}): SensorEntry[] {
  return bloodGlucoseHistory
    .map((bloodGlucose, index) => {
      if (!bloodGlucose) return null;
      const minutesAgo = latestEntryAge + (bloodGlucoseHistory.length - 1 - index) * intervalMinutes;
      const entryTimestamp = new Date(currentTimestamp - minutesAgo * 60 * 1000);
      return {
        type: 'DEXCOM_G6_SHARE',
        timestamp: entryTimestamp.toISOString(),
        bloodGlucose,
      };
    })
    .filter(entry => entry !== null) as SensorEntry[];
}
