import { NO_PUSHOVER } from '../cronjobs/alarms/pushoverClient';
import { NO_DEXCOM_SHARE } from '../cronjobs/dexcom/dexcomShareClient';
import { NO_LOGGING } from './logging';
import { mockNow } from '../shared';
import { mockProfiles } from '../shared';
import { MIN_IN_MS } from '../shared';
import { generateUuid } from '../shared';
import { generateSensorEntries } from '../shared';
import { getTimeMinusTime } from '../shared';
import { getTimestampFlooredToEveryFiveMinutes } from '../shared';
import { Context, Request } from './api';
import { createDbClient } from './db';

export const createTestContext = (timestamp = () => mockNow): Context => {
  if (!process.env.DATABASE_URL_TEST)
    throw new Error(`Test suite requires DATABASE_URL_TEST to be set on the env`); // normally we abstract env selection via DATABASE_URL, but relying on that in the test runner too might be dangerous
  return {
    httpPort: 80,
    timestamp,
    log: NO_LOGGING,
    db: createDbClient(process.env.DATABASE_URL_TEST),
    storage: null,
    pushover: NO_PUSHOVER,
    dexcomShare: NO_DEXCOM_SHARE,
    config: {},
  };
};

export const truncateDb = async (context: Context) => {
  try {
    await context.db.query(`DELETE FROM alarm_states`);
    await context.db.query(`DELETE FROM alarms`);
    await context.db.query(`DELETE FROM analyser_settings`);
    await context.db.query(`DELETE FROM carb_entries`);
    await context.db.query(`DELETE FROM cronjobs_journal`);
    await context.db.query(`DELETE FROM insulin_entries`);
    await context.db.query(`DELETE FROM meter_entries`);
    await context.db.query(`DELETE FROM migrations`);
    await context.db.query(`DELETE FROM profile_templates`);
    await context.db.query(`DELETE FROM profile_activations`);
    await context.db.query(`DELETE FROM sensor_entries`);
    await context.db.query(`DELETE FROM situation_settings`);
  } catch (e) {
    console.log(`Error deleting test data: ${String(e)}`);
  }
};

export function createRequest(request: Partial<Request>): Request {
  return {
    requestId: generateUuid(),
    requestMethod: 'GET',
    requestPath: '/',
    requestParams: {},
    requestHeaders: {},
    requestBody: '',
    ...request,
  };
}

export const generateSeedData = async (context: Context) => {
  const now = getTimestampFlooredToEveryFiveMinutes(context.timestamp()) || context.timestamp();

  // Create timeline entries
  await context.db.createSensorEntries(
    generateSensorEntries({
      currentTimestamp: now,
      bloodGlucoseHistory: [3.8, 4.4, 4.9, 5.1, 5.3, 5.5, 5.6, 5.5, 4.5, 3.9],
      latestEntryAge: 1,
    }),
  );

  await context.db.createCarbEntries([
    {
      timestamp: getTimeMinusTime(now, 50 * MIN_IN_MS),
      amount: 20,
      durationFactor: 1.5,
    },
  ]);

  await context.db.createInsulinEntries([
    {
      timestamp: getTimeMinusTime(now, 30 * MIN_IN_MS),
      amount: 1,
      type: 'FAST',
    },
  ]);

  await context.db.createMeterEntries([
    {
      timestamp: getTimeMinusTime(now, 30 * MIN_IN_MS),
      bloodGlucose: 5.5,
    },
  ]);

  // Create active alarm
  await context.db.createAlarmWithState('LOW');

  // Create active day profile
  const dayProfile = await context.db.createProfile(mockProfiles[0]);
  await context.db.createProfileActivation({
    profileTemplateId: dayProfile.id,
    activatedAt: now,
  });

  // Create not active night profile
  const nightProfile = await context.db.createProfile(mockProfiles[1]);
  await context.db.createProfileActivation({
    profileTemplateId: nightProfile.id,
    activatedAt: getTimeMinusTime(now, 300 * MIN_IN_MS),
    deactivatedAt: getTimeMinusTime(now, 2 * MIN_IN_MS),
  });
};
