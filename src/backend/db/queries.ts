import { PreparedQuery } from '@pgtyped/runtime';
import {
  createSensorEntry,
  getLatestSensorEntry,
  getSensorEntriesByTimestamp,
} from 'backend/db/sensorEntries/sensorEntries.queries';
import _ from 'lodash';
import { Pool } from 'pg';
import { SensorEntry } from 'shared/types/timelineEntries';
import { z } from 'zod';

export const queries = (pool: Pool) => {
  return {
    async createSensorEntry(params: Omit<SensorEntry, 'timestamp'>) {
      const res = await createSensorEntry.run(params, pool);
      const mapped = res.map(row => _.mapKeys(row, (_val, key) => _.camelCase(key)));
      return mapped[0] as unknown as (typeof res)[number];
    },

    async getLatestSensorEntry() {
      return query(pool, true, SensorEntry, getLatestSensorEntry);
    },

    async getSensorEntriesByTimestamp(params: { from: string; to?: string }) {
      return query(pool, false, SensorEntry, getSensorEntriesByTimestamp, params);
    },
  };
};

async function query<
  One extends boolean,
  Schema extends z.ZodTypeAny,
  Params extends object,
  Result extends z.infer<Schema>, // note: the "extends" constraint can be dropped if we just want to rely on the Zod schema, and ignore DB-side types completely
>(
  pool: Pool,
  one: One,
  schema: Schema,
  method: PreparedQuery<Params, Result>,
  params: Params,
): Promise<One extends true ? z.infer<Schema> : z.infer<Schema>[]>;
async function query<
  One extends boolean,
  Schema extends z.ZodTypeAny,
  Params extends void,
  Result extends z.infer<Schema>,
>(
  pool: Pool,
  one: One,
  schema: Schema,
  method: PreparedQuery<Params, Result>,
): Promise<One extends true ? z.infer<Schema> : z.infer<Schema>[]>;
async function query<
  One extends boolean,
  Schema extends z.ZodTypeAny,
  Params,
  Result extends z.infer<Schema>,
>(
  pool: Pool,
  one: One,
  schema: Schema,
  method: PreparedQuery<Params, Result>,
  params?: Params,
): Promise<One extends true ? z.infer<Schema> : z.infer<Schema>[]> {
  const raw = await method.run(params as Params, pool);
  const mapped = raw.map(row => _.mapKeys(row as object, (_val, key) => _.camelCase(key)));
  if (one) {
    if (mapped.length !== 1)
      throw new Error(`Expected exactly one result row but got ${mapped.length} instead`);
    return schema.parse(mapped[0]);
  } else {
    return z.array(schema).parse(mapped);
  }
}
