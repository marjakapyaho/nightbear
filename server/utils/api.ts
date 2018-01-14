import { Logger, createConsoleLogger } from './logging';

export function createNodeContext(): Context {
  return {
    httpPort: 3000,
    timestamp: Date.now,
    log: createConsoleLogger(),
  };
}

export interface Headers {
  [header: string]: string;
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
}

export type RequestHandler = (request: Request, context: Context) => Response;

export function createResponse(responseBody: object | string): Response {
  return Promise.resolve({
    responseStatus: 200,
    responseBody,
  });
}
