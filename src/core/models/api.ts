import { createPushoverClient, PushoverClient } from 'core/alarms/pushover-client';
import { createCouchDbStorage } from 'core/storage/couchDbStorage';
import { Storage } from 'core/storage/storage';
import { createLogger, Logger } from 'core/utils/logging';
import { createDexcomShareClient, DexcomShareClient, NO_DEXCOM_SHARE } from 'server/share/dexcom-share-client';

export function createNodeContext(): Context {
  const {
    NIGHTBEAR_DB_URL,
    PUSHOVER_USER,
    PUSHOVER_TOKEN,
    PUSHOVER_CALLBACK,
    DEXCOM_SHARE_USERNAME,
    DEXCOM_SHARE_PASSWORD,
  } = process.env;
  if (!NIGHTBEAR_DB_URL) throw new Error(`Missing required env-var: NIGHTBEAR_DB_URL`);
  if (!PUSHOVER_USER) throw new Error(`Missing required env-var: PUSHOVER_USER`);
  if (!PUSHOVER_TOKEN) throw new Error(`Missing required env-var: PUSHOVER_TOKEN`);
  if (!PUSHOVER_CALLBACK) throw new Error(`Missing required env-var: PUSHOVER_CALLBACK`);
  const log = createLogger();
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
}

export type RequestHandler = (request: Request, context: Context) => Response;

export function createResponse(responseBody: object | string = ''): Response {
  return Promise.resolve({
    responseStatus: 200,
    responseBody,
  });
}
