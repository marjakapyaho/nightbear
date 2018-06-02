import { Logger, createConsoleLogger } from 'nightbear/server/utils/logging';
import { createCouchDbStorage } from 'nightbear/core/storage/couchDbStorage';
import { Storage } from 'nightbear/core/storage/storage';

export function createNodeContext(): Context {
  const { NIGHTBEAR_DB_URL } = process.env;
  if (!NIGHTBEAR_DB_URL) throw new Error(`Missing required env-var: NIGHTBEAR_DB_URL`);
  return {
    httpPort: 3000,
    timestamp: Date.now,
    log: createConsoleLogger(),
    storage: createCouchDbStorage(NIGHTBEAR_DB_URL),
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
}

export type RequestHandler = (request: Request, context: Context) => Response;

export function createResponse(responseBody: object | string = ''): Response {
  return Promise.resolve({
    responseStatus: 200,
    responseBody,
  });
}
