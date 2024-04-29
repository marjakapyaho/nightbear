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
