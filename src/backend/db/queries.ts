import {
  createSensorEntry,
  getLatestSensorEntry,
  getSensorEntriesByTimestamp,
} from 'backend/db/sensorEntries/sensorEntries.queries';
import { GenParams, bindQueryShorthands } from 'backend/utils/db';
import { Pool } from 'pg';
import { SensorEntry } from 'shared/types/timelineEntries';

export const queries = (pool: Pool) => {
  const { one, many } = bindQueryShorthands(pool);

  return {
    async createSensorEntry(params: Omit<SensorEntry, 'timestamp'>) {
      return one(SensorEntry, createSensorEntry, params);
    },

    async getLatestSensorEntry() {
      return one(SensorEntry, getLatestSensorEntry);
    },

    async getSensorEntriesByTimestamp(params: GenParams<typeof getSensorEntriesByTimestamp>) {
      return many(SensorEntry, getSensorEntriesByTimestamp, params);
    },
  };
};
