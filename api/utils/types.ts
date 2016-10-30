import { Logger } from './logging';

export interface Request {
  requestId: string;
  requestMethod: string;
  requestPath: string;
  requestParams: Object;
  requestHeaders: Object;
  requestBody: Object;
}

export interface Context {
  version: string;
  timestamp: () => number;
  log: Logger;
}

export type RequestHandler = (request: Request, context: Context) => Promise<Object>;
