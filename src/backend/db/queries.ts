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
      return one(SensorEntry, createSensorEntry, params);
    },

    async getLatestSensorEntry() {
      return one(SensorEntry, getLatestSensorEntry);
    },

    async getSensorEntriesByTimestamp(params: GenParams<typeof getSensorEntriesByTimestamp>) {
      return many(SensorEntry, getSensorEntriesByTimestamp, params);
    },
  };

  async function one<
    Schema extends z.ZodTypeAny,
    Params extends object,
    Result extends z.infer<Schema>, // note: the "extends" constraint can be dropped if we just want to rely on the Zod schema, and ignore DB-side types completely
  >(
    schema: Schema,
    method: PreparedQuery<Params, Result>,
    params: Params,
  ): Promise<z.infer<Schema>>;
  async function one<
    Schema extends z.ZodTypeAny,
    Params extends void,
    Result extends z.infer<Schema>,
  >(schema: Schema, method: PreparedQuery<Params, Result>): Promise<z.infer<Schema>>;
  async function one<Schema extends z.ZodTypeAny, Params, Result extends z.infer<Schema>>(
    schema: Schema,
    method: PreparedQuery<Params, Result>,
    params?: Params,
  ): Promise<z.infer<Schema>> {
    return query(pool, true, schema, method, params);
  }

  async function many<
    Schema extends z.ZodTypeAny,
    Params extends object,
    Result extends z.infer<Schema>, // note: the "extends" constraint can be dropped if we just want to rely on the Zod schema, and ignore DB-side types completely
  >(
    schema: Schema,
    method: PreparedQuery<Params, Result>,
    params: Params,
  ): Promise<z.infer<Schema>[]>;
  async function many<
    Schema extends z.ZodTypeAny,
    Params extends void,
    Result extends z.infer<Schema>,
  >(schema: Schema, method: PreparedQuery<Params, Result>): Promise<z.infer<Schema>[]>;
  async function many<Schema extends z.ZodTypeAny, Params, Result extends z.infer<Schema>>(
    schema: Schema,
    method: PreparedQuery<Params, Result>,
    params?: Params,
  ): Promise<z.infer<Schema>[]> {
    return query(pool, false, schema, method, params);
  }
};

type GenParams<T> = T extends PreparedQuery<infer P, any> ? P : void;

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
