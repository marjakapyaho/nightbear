export interface Request {
  requestId: string;
  requestMethod: string;
  requestParams: Object;
  requestHeaders: Object;
  requestBody: Object;
}

export interface Context {
  version: string;
  timestamp: () => number;
}

export type RequestHandler = (request: Request, context: Context) => Promise<Object>;
