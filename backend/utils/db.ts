/* eslint-disable @typescript-eslint/no-unsafe-return */

import { measure } from '@nightbear/shared'
import { PreparedQuery } from '@pgtyped/runtime'
import _, { camelCase, mapKeys } from 'lodash'
import { Pool, types } from 'pg'
import { z } from 'zod'
import { queries } from '../db/queries'
import { Logger, extendLogger } from './logging'

/**
 * @see https://pgtyped.dev/docs/typing
 */
types.setTypeParser(types.builtins.NUMERIC, value => parseFloat(value))
types.setTypeParser(types.builtins.TIMESTAMPTZ, value => new Date(value).toISOString())

export type DbClient = ReturnType<typeof createDbClient>

/**
 * Creates a Postgres wrapper for talking to the database.
 */
export function createDbClient(connectionString: string, logger: Logger) {
  const log = extendLogger(logger, 'db')
  const pool = new Pool({ connectionString })
  return {
    ...queries(pool, log),
    async query(query: string) {
      return await pool.query(query)
    },
  }
}

export type GenParams<T> = T extends PreparedQuery<infer P, unknown> ? P : void

export const runQueryAndValidateResult = async <
  Count extends 'one' | 'oneOrNone' | 'many',
  Schema extends z.ZodTypeAny,
  Params,
  Return extends Count extends 'one'
    ? z.infer<Schema>
    : Count extends 'oneOrNone'
      ? z.infer<Schema> | undefined
      : Count extends 'many'
        ? z.infer<Schema>[]
        : never,
>(
  pool: Pool,
  log: Logger,
  count: Count,
  schema: Schema,
  method: PreparedQuery<Params, z.infer<Schema>>,
  params?: Params,
): Promise<Return> => {
  const duration = measure()
  const queryName = getQueryName(method)
  const raw = await method.run((params ?? {}) as Params, pool)
  const mapped = raw.map(row => mapKeys(row as object, (_val, key) => camelCase(key)))

  log(`${queryName} (${duration()}) → ${raw.length} rows`)

  switch (count) {
    case 'one':
      if (mapped.length !== 1) {
        throw new Error(`Expected exactly 1 row, but got ${mapped.length} instead`)
      } else {
        return schema.parse(mapped[0])
      }

    case 'oneOrNone':
      if (mapped.length > 1) {
        throw new Error(`Expected exactly 0-1 rows, but got ${mapped.length} instead`)
      } else if (mapped.length === 1) {
        return schema.parse(mapped[0])
      } else {
        return undefined as Return
      }

    case 'many':
      return z.array(schema).parse(mapped) as Return

    default:
      throw new Error(`Invalid count argument: ${count}`)
  }
}

export const bindQueryShorthands = (pool: Pool, logger: Logger) => {
  const one = async <Schema extends z.ZodTypeAny, Params extends object | void>(
    schema: Schema,
    method: PreparedQuery<Params, z.infer<Schema>>,
    params?: Params extends object ? Params : undefined,
  ): Promise<z.infer<Schema>> => {
    return runQueryAndValidateResult(pool, logger, 'one', schema, method, params as Params)
  }

  const oneOrNone = async <Schema extends z.ZodTypeAny, Params extends object | void>(
    schema: Schema,
    method: PreparedQuery<Params, z.infer<Schema>>,
    params?: Params extends object ? Params : undefined,
  ): Promise<z.infer<Schema> | undefined> => {
    return runQueryAndValidateResult(pool, logger, 'oneOrNone', schema, method, params as Params)
  }

  const many = async <Schema extends z.ZodTypeAny, Params extends object | void>(
    schema: Schema,
    method: PreparedQuery<Params, z.infer<Schema>>,
    params?: Params extends object ? Params : undefined,
  ): Promise<z.infer<Schema>[]> => {
    return runQueryAndValidateResult(pool, logger, 'many', schema, method, params as Params)
  }

  return {
    one,
    oneOrNone,
    many,
  }
}

const queryName = Symbol('queryName')

/**
 * @see https://github.com/adelsz/pgtyped/issues/522 for what could eventually replace this
 */
export const patchQueryNames = <
  T extends Array<
    Record<
      string,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      PreparedQuery<any, any>
    >
  >,
>(
  modules: T,
) => {
  for (const module of modules) {
    _.forEach(module, (val, key) => {
      _.set(val, queryName, key)
    })
  }
  return modules
}

export const getQueryName = (
  method: // eslint-disable-next-line @typescript-eslint/no-explicit-any
  PreparedQuery<any, any>,
) => {
  const res = _.get(method, queryName) as string | undefined
  if (!res) throw new Error(`Query module has not been prepared with patchQueryNames()`)
  return res
}
