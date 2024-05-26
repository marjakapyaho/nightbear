import {
  NO_PUSHOVER,
  PushoverClient,
  createPushoverClient,
} from '../cronjobs/alarms/pushoverClient'
import {
  DexcomShareClient,
  NO_DEXCOM_SHARE,
  createDexcomShareClient,
} from '../cronjobs/dexcom/dexcomShareClient'
import { Logger, createLogger } from './logging'
import { readFileSync } from 'fs'
import { map } from 'lodash'
import { parseNumber } from '@nightbear/shared'
import { getTimeAsISOStr } from '@nightbear/shared'
import { DbClient, createDbClient } from './db'

export type Headers = {
  [header: string]: string | string[]
}

export type Request = {
  requestId: string
  requestMethod: string
  requestPath: string
  requestParams: { [param: string]: string }
  requestHeaders: Headers
  requestBody: object | string
}

export type ResponsePayload = {
  responseStatus: number
  responseBody: object | string
}

export type Response = Promise<ResponsePayload>

export type Context = {
  httpPort: number
  timestamp: () => string
  log: Logger
  db: DbClient
  storage: Storage | null // ?
  pushover: PushoverClient
  dexcomShare: DexcomShareClient
  config: {
    DEXCOM_SHARE_LOGIN_ATTEMPT_DELAY_MINUTES?: number
    DEV_DATA_IMPORT_FROM_COUCHDB?: string
  }
}

export type RequestHandler = (request: Request, context: Context) => Promise<ResponsePayload>

export function createNodeContext(): Context {
  const {
    DATABASE_URL,
    PUSHOVER_USER,
    PUSHOVER_TOKEN,
    PUSHOVER_CALLBACK,
    DEXCOM_SHARE_USERNAME,
    DEXCOM_SHARE_PASSWORD,
    DEXCOM_SHARE_LOGIN_ATTEMPT_DELAY_MINUTES,
    PUSHOVER_DISABLED,
    DEV_DATA_IMPORT_FROM_COUCHDB,
  } = process.env

  if (!DATABASE_URL) throw new Error(`Missing required env-var: DATABASE_URL`)
  if (!PUSHOVER_USER) throw new Error(`Missing required env-var: PUSHOVER_USER`)
  if (!PUSHOVER_TOKEN) throw new Error(`Missing required env-var: PUSHOVER_TOKEN`)
  if (!PUSHOVER_CALLBACK) throw new Error(`Missing required env-var: PUSHOVER_CALLBACK`)

  const log = createLogger()
  const config = {
    DEXCOM_SHARE_LOGIN_ATTEMPT_DELAY_MINUTES:
      parseNumber(DEXCOM_SHARE_LOGIN_ATTEMPT_DELAY_MINUTES) ?? 180, // Default to 3 hours
    DEV_DATA_IMPORT_FROM_COUCHDB,
  }

  log(`Starting Nightbear version ${getDeployedVersion()}`)
  log(`Loaded config is: ${map(config, (val, key) => [key, val].join('=')).join(', ')}`)

  return {
    httpPort: 4000,
    timestamp: () => getTimeAsISOStr(Date.now()),
    log,
    db: createDbClient(DATABASE_URL),
    storage: null, // TODO
    pushover: PUSHOVER_DISABLED
      ? NO_PUSHOVER
      : createPushoverClient(PUSHOVER_USER, PUSHOVER_TOKEN, PUSHOVER_CALLBACK, log),
    dexcomShare:
      DEXCOM_SHARE_USERNAME && DEXCOM_SHARE_PASSWORD
        ? createDexcomShareClient(DEXCOM_SHARE_USERNAME, DEXCOM_SHARE_PASSWORD, log)
        : NO_DEXCOM_SHARE,
    config,
  }
}

export function createResponse(responseBody: object | string = ''): Response {
  return Promise.resolve({
    responseStatus: 200,
    responseBody,
  })
}

export function getDeployedVersion() {
  try {
    return readFileSync('.nightbear-deploy-version').toString().trim()
  } catch (err) {
    return '(local dev)'
  }
}
