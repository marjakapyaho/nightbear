import { Request, Context } from '../utils/types';
import { createContext } from './context';
import { handlerWithLogging } from './logging';

type RequestHandler = (request: Request, context: Context) => Promise<Object>;
type RequestHandlerMap = { [propName: string]: RequestHandler; };

export function setUpRequestHandlers(exports: Object, handlers: RequestHandlerMap): void {
  Object.keys(handlers).forEach(handlerName => {
    exports[handlerName] = (event, context, cb) => {
      Promise.resolve({
        requestId: context.awsRequestId,
        requestMethod: event.method,
        requestPath: handlerName, // note that this isn't a "path" in the HTTP sense, but in Lambda we don't have easy access to that (with API Gateway sitting in between)
        requestParams: event.query,
        requestHeaders: event.headers,
        requestBody: event.body,
      })
        .then(request => handlerWithLogging(handlers[handlerName])(request, createContext(process.env)))
        .then(res => cb(null, res))
        .catch(err => cb(new Error(`[500] Nightbear API Error (see logs for requestId ${context.awsRequestId})`))); // see https://serverless.com/framework/docs/providers/aws/events/apigateway/#status-codes
    };
  });
}
