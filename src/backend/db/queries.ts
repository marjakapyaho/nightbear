import * as sensorEntries from 'backend/db/sensorEntries/sensorEntries.queries';
import _ from 'lodash';
import { Pool } from 'pg';
import { SensorEntry } from 'shared/types/timelineEntries';

export const queries = (pool: Pool) => ({
  async createSensorEntry(params: Omit<SensorEntry, 'timestamp'>) {
    const res = await sensorEntries.createSensorEntry.run(params, pool);
    const mapped = res.map(row => _.mapKeys(row, (_val, key) => _.camelCase(key)));
    return mapped[0] as unknown as (typeof res)[number];
  },

  async getLatestSensorEntry() {
    const res = await sensorEntries.getLatestSensorEntry.run(undefined, pool);
    const mapped = res.map(row => _.mapKeys(row, (_val, key) => _.camelCase(key)));
    return mapped[0] as unknown as (typeof res)[number];
  },

  async getSensorEntriesByTimestamp(
    params: Parameters<(typeof sensorEntries.getSensorEntriesByTimestamp)['run']>[0],
  ) {
    const res = await sensorEntries.getSensorEntriesByTimestamp.run(params, pool);
    const mapped = res.map(row => _.mapKeys(row, (_val, key) => _.camelCase(key)));
    return mapped as unknown as typeof res;
  },
});
