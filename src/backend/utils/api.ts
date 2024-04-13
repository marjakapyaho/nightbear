import { PushoverClient, createPushoverClient } from 'backend/cronjobs/alarms/pushoverClient';
import { readFileSync } from 'fs';
import { map } from 'lodash';
import { Logger, createLogger } from 'shared/utils/logging';
import {
  createDexcomShareClient,
  DexcomShareClient,
  NO_DEXCOM_SHARE,
} from 'backend/cronjobs/dexcom/dexcom-share-client';
import { parseNumber } from 'shared/utils/helpers';

export type Headers = {
  [header: string]: string | string[];
};

export type Request = {
  requestId: string;
  requestMethod: string;
  requestPath: string;
  requestParams: { [param: string]: string };
  requestHeaders: Headers;
  requestBody: object | string;
};

export type ResponsePayload = {
  responseStatus: number;
  responseBody: object | string;
};

export type Response = Promise<ResponsePayload>;

export type Context = {
  httpPort: number;
  timestamp: () => number;
  log: Logger;
  db: null; // ?
  storage: Storage | null; // ?
  pushover: PushoverClient;
  dexcomShare: DexcomShareClient;
  config: {
    DEXCOM_SHARE_LOGIN_ATTEMPT_DELAY_MINUTES?: number;
  };
};

export type RequestHandler = (request: Request, context: Context) => Promise<ResponsePayload>;

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
    DEXCOM_SHARE_LOGIN_ATTEMPT_DELAY_MINUTES: parseNumber(DEXCOM_SHARE_LOGIN_ATTEMPT_DELAY_MINUTES) ?? 180, // Default to 3 hours
  };

  log(`Starting Nightbear version ${getDeployedVersion()}`);
  log(`Loaded config is: ${map(config, (val, key) => [key, val].join('=')).join(', ')}`);

  return {
    httpPort: 3000,
    timestamp: Date.now,
    log,
    db: null, // TODO
    storage: null, // TODO
    pushover: createPushoverClient(PUSHOVER_USER, PUSHOVER_TOKEN, PUSHOVER_CALLBACK, log),
    dexcomShare:
      DEXCOM_SHARE_USERNAME && DEXCOM_SHARE_PASSWORD
        ? createDexcomShareClient(DEXCOM_SHARE_USERNAME, DEXCOM_SHARE_PASSWORD, log)
        : NO_DEXCOM_SHARE,
    config,
  };
}

export function createResponse(responseBody: object | string = ''): Promise<ResponsePayload> {
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
