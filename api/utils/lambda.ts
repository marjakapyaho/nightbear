import { Request, Context } from '../utils/types';
import { createContext } from './context';

type RequestHandler = (request: Request, context: Context) => Promise<Object>;
type RequestHandlerMap = { [propName: string]: RequestHandler; };

export function setUpRequestHandlers(exports: Object, handlers: RequestHandlerMap): void {
  Object.keys(handlers).forEach(handlerName => {
    exports[handlerName] = (event, context, cb) => {
      Promise.resolve({
        requestId: context.awsRequestId,
        requestMethod: event.method,
        requestParams: event.query,
        requestHeaders: event.headers,
        requestBody: event.body,
      })
        .then(request => handlers[handlerName](request, createContext(process.env)))
        .then(res => cb(null, res))
        .catch(err => cb(new Error(`[500] Nightbear API Error (see logs for requestId ${context.awsRequestId})`))); // see https://serverless.com/framework/docs/providers/aws/events/apigateway/#status-codes
    };
  });
}
