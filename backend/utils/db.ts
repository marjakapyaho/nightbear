import { PreparedQuery } from '@pgtyped/runtime';
import * as alarms from '../db/alarms/alarms.queries';
import * as carbEntries from '../db/carbEntries/carbEntries.queries';
import * as cronjobsJournal from '../db/cronjobsJournal/cronjobsJournal.queries';
import * as insulinEntries from '../db/insulinEntries/insulinEntries.queries';
import * as meterEntries from '../db/meterEntries/meterEntries.queries';
import * as profiles from '../db/profiles/profiles.queries';
import { queries } from '../db/queries';
import * as sensorEntries from '../db/sensorEntries/sensorEntries.queries';
import { Client, Pool, types } from 'pg';
import { z } from 'zod';
import {camelCase, mapKeys, mapValues } from 'lodash';

/**
 * All DB modules need to be listed here to become accessible via the DB wrapper.
 */
const dbModules = {
  sensorEntries,
  carbEntries,
  insulinEntries,
  meterEntries,
  alarms,
  profiles,
  cronjobsJournal,
};

/**
 * @see https://pgtyped.dev/docs/typing
 */
types.setTypeParser(types.builtins.NUMERIC, value => parseFloat(value));
types.setTypeParser(types.builtins.TIMESTAMPTZ, value => new Date(value).toISOString());

export type DbClient = ReturnType<typeof createDbClient>;

/**
 * Creates a Postgres wrapper for talking to the database.
 */
export function createDbClient(connectionString: string) {
  const pool = new Pool({ connectionString });
  return {
    // @ts-ignore THIS WILL GET REMOVED SOON:
    ...wrapQueries(dbModules, pool),
    ...queries(pool),
    async query(query: string) {
      return await pool.query(query);
    },
  };
}

/**
 * Updates the DB modules generated by pgtyped to not require manually passing in a DB connection.
 */
function wrapQueries<
  T extends Record<
    string,
    Record<string, { run: (params: any, client: Client) => Promise<unknown> }>
  >,
>(db: T, pool: Pool) {
  return mapValues(db, methods =>
    mapValues(methods, (method: any) => (args: any) => performQuery(method, args, pool)),
  ) as unknown as {
    [K1 in keyof T]: {
      [K2 in keyof T[K1]]: (
        params: Parameters<T[K1][K2]['run']>[0],
      ) => ReturnType<T[K1][K2]['run']>;
    };
  };
}

/**
 * Performs the actual query against the DB. Also converts rows from snake_case to camelCase.
 */
const performQuery = async (
  query: { run: (args: unknown, client: Pool) => Promise<Record<string, unknown>[]> },
  args: unknown,
  pool: Pool,
) => {
  const res = await query.run(args, pool);
  return res.map(row => mapKeys(row, (_val, key) => camelCase(key)));
};

export type GenParams<T> = T extends PreparedQuery<infer P, any> ? P : void;

export const runQueryAndValidateResult = async <
  One extends boolean,
  None extends boolean,
  Schema extends z.ZodTypeAny,
  Params,
>(
  pool: Pool,
  one: One,
  none: None,
  schema: Schema,
  method: PreparedQuery<Params, z.infer<Schema>>,
  params?: Params,
): Promise<
  One extends true
    ? None extends true
      ? z.infer<Schema> | undefined
      : z.infer<Schema>
    : z.infer<Schema>[]
> => {
  const raw = await method.run((params ?? {}) as Params, pool);
  const mapped = raw.map(row => mapKeys(row as object, (_val, key) => camelCase(key)));
  if (one && none) {
    if (mapped.length === 0) {
      // TODO: fix this
      // @ts-ignore
      return undefined;
    } else if (mapped.length !== 1) {
      throw new Error(`Expected exactly one result or no results but got ${mapped.length} instead`);
    }
    return schema.parse(mapped[0]);
  }
  if (one) {
    if (mapped.length !== 1) {
      throw new Error(`Expected exactly one result row but got ${mapped.length} instead`);
    }
    return schema.parse(mapped[0]);
  } else {
    return z.array(schema).parse(mapped);
  }
};

export const bindQueryShorthands = (pool: Pool) => {
  const one = async <Schema extends z.ZodTypeAny, Params extends object | void>(
    schema: Schema,
    method: PreparedQuery<Params, z.infer<Schema>>,
    params?: Params extends object ? Params : undefined,
  ): Promise<z.infer<Schema>> => {
    return runQueryAndValidateResult(pool, true, false, schema, method, params as Params);
  };

  const oneOrNone = async <Schema extends z.ZodTypeAny, Params extends object | void>(
    schema: Schema,
    method: PreparedQuery<Params, z.infer<Schema>>,
    params?: Params extends object ? Params : undefined,
  ): Promise<z.infer<Schema>> => {
    return runQueryAndValidateResult(pool, true, true, schema, method, params as Params);
  };

  const many = async <Schema extends z.ZodTypeAny, Params extends object | void>(
    schema: Schema,
    method: PreparedQuery<Params, z.infer<Schema>>,
    params?: Params extends object ? Params : undefined,
  ): Promise<z.infer<Schema>[]> => {
    return runQueryAndValidateResult(pool, false, false, schema, method, params as Params);
  };

  return {
    one,
    oneOrNone,
    many,
  };
};