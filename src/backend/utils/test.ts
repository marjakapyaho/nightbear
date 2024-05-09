import { NO_PUSHOVER } from 'backend/cronjobs/alarms/pushoverClient';
import { NO_DEXCOM_SHARE } from 'backend/cronjobs/dexcom/dexcom-share-client';
import { NO_LOGGING } from 'backend/utils/logging';
import { mockNow } from 'shared/mocks/dates';
import { Alarm } from 'shared/types/alarms';
import { generateUuid } from 'shared/utils/id';
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

export const checkActiveAlarms = async (context: Context): Promise<Alarm[]> =>
  (await context.db.alarms.getAlarms({
    onlyActive: true,
  })) as unknown as Alarm[];

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
