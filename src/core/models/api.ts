import { createPushoverClient, PushoverClient } from 'core/alarms/pushover-client';
import { createCouchDbStorage } from 'core/storage/couchDbStorage';
import { Storage } from 'core/storage/storage';
import { createLogger, Logger } from 'core/utils/logging';
import { readFileSync } from 'fs';
import { isFinite, map } from 'lodash';
import { createDexcomShareClient, DexcomShareClient, NO_DEXCOM_SHARE } from 'server/share/dexcom-share-client';

export function createNodeContext(): Context {
  const {
    NIGHTBEAR_DB_URL,
    PUSHOVER_USER,
    PUSHOVER_TOKEN,
    PUSHOVER_CALLBACK,
    DEXCOM_SHARE_USERNAME,
    DEXCOM_SHARE_PASSWORD,
    DEXCOM_SHARE_LOGIN_ATTEMPT_DELAY_MINUTES,
  } = process.env;
  if (!NIGHTBEAR_DB_URL) throw new Error(`Missing required env-var: NIGHTBEAR_DB_URL`);
  if (!PUSHOVER_USER) throw new Error(`Missing required env-var: PUSHOVER_USER`);
  if (!PUSHOVER_TOKEN) throw new Error(`Missing required env-var: PUSHOVER_TOKEN`);
  if (!PUSHOVER_CALLBACK) throw new Error(`Missing required env-var: PUSHOVER_CALLBACK`);
  const log = createLogger();
  const config = {
    DEXCOM_SHARE_LOGIN_ATTEMPT_DELAY_MINUTES: parseNumber(DEXCOM_SHARE_LOGIN_ATTEMPT_DELAY_MINUTES) ?? 180, // default to a pretty conservative 3 hours
  };
  log(`Starting Nightbear version ${getDeployedVersion()}`);
  log(`Loaded config is: ${map(config, (val, key) => [key, val].join('=')).join(', ')}`);
  return {
    httpPort: 3000,
    timestamp: Date.now,
    log,
    storage: createCouchDbStorage(NIGHTBEAR_DB_URL),
    pushover: createPushoverClient(PUSHOVER_USER, PUSHOVER_TOKEN, PUSHOVER_CALLBACK, log),
    dexcomShare:
      DEXCOM_SHARE_USERNAME && DEXCOM_SHARE_PASSWORD
        ? createDexcomShareClient(DEXCOM_SHARE_USERNAME, DEXCOM_SHARE_PASSWORD, log)
        : NO_DEXCOM_SHARE,
    config,
  };
}

export interface Headers {
  [header: string]: string | string[]; // in case someone's wondering, string[] is how multiple instances of the SAME header are represented
}

export interface Request {
  requestId: string;
  requestMethod: string;
  requestPath: string;
  requestParams: { [param: string]: string };
  requestHeaders: Headers;
  requestBody: object | string;
}

export interface ResponsePayload {
  responseStatus: number;
  responseBody: object | string;
}

export type Response = Promise<ResponsePayload>;

export interface Context {
  httpPort: number;
  timestamp: () => number;
  log: Logger;
  storage: Storage;
  pushover: PushoverClient;
  dexcomShare: DexcomShareClient;
  config: {
    DEXCOM_SHARE_LOGIN_ATTEMPT_DELAY_MINUTES: number;
  };
}

export type RequestHandler = (request: Request, context: Context) => Response;

export function createResponse(responseBody: object | string = ''): Response {
  return Promise.resolve({
    responseStatus: 200,
    responseBody,
  });
}

export function getDeployedVersion() {
  try {
    return readFileSync('.nightbear-deploy-version').toString().trim();
  } catch (err) {
    return '(local dev)';
  }
}

function parseNumber(num?: string) {
  const parsed = parseInt(String(num));
  return isFinite(parsed) ? parsed : undefined;
}
